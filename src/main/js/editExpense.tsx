'use strict';

import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {ExpenseType} from "./calendar";
import {CategoryOptions, useCategories} from "./categories";
import {byNewestFirst, toDateString} from "./date";
import {evaluateAmount} from "./amount";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCheck, faFloppyDisk, faRotateLeft, faTrashCan} from '@fortawesome/free-solid-svg-icons'

// names used before, most recently used first, each with the category it was last saved under
type PastNameType = {
    name: string,
    categoryId: number,
}

export const PastNamesContext = React.createContext<PastNameType[]>([]);

const usePastNames = (): PastNameType[] => useContext(PastNamesContext);

// names that differ only in case count as one, keeping the latest spelling
export const getPastNames = (expenses: ExpenseType[]): PastNameType[] => {
    const latest = new Map<string, ExpenseType>();
    expenses.forEach(expense => {
        const key = expense.name.trim().toLowerCase();
        const current = latest.get(key);
        if (key.length > 0 && (!current || expense.date > current.date)) {
            latest.set(key, expense);
        }
    });
    return Array.from(latest.values())
        .sort(byNewestFirst)
        .map(expense => ({name: expense.name.trim(), categoryId: expense.categoryId}));
}

const MAX_SUGGESTIONS = 6;

// past names containing the typed text, those starting with it first, leaving out an exact match
const getSuggestions = (pastNames: PastNameType[], typed: string): string[] => {
    const query = typed.trim().toLowerCase();
    if (query.length === 0) {
        return [];
    }
    const matches = pastNames
        .map(pastName => pastName.name)
        .filter(name => name.toLowerCase().includes(query) && name.toLowerCase() !== query);
    return [
        ...matches.filter(name => name.toLowerCase().startsWith(query)),
        ...matches.filter(name => !name.toLowerCase().startsWith(query)),
    ].slice(0, MAX_SUGGESTIONS);
}

// bolds the part of the name that matches what was typed
function Suggestion({name, typed}: { name: string; typed: string; }) {
    const start = name.toLowerCase().indexOf(typed.trim().toLowerCase());
    const end = start + typed.trim().length;
    return <>{name.slice(0, start)}<b>{name.slice(start, end)}</b>{name.slice(end)}</>;
}

type ListPosition = {
    left: number,
    top: number,
    minWidth: number,
    maxWidth: number,
}

// just under the input, in page coordinates, at least as wide as the input and never past the window's right edge
const getListPosition = (input: HTMLInputElement): ListPosition => {
    const rect = input.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY + 1,
        minWidth: rect.width,
        maxWidth: document.documentElement.clientWidth - rect.left - 8,
    };
}

// a text input whose suggestions are drawn in the page's own style rather than the browser's
function NameInput({value, isValid, onChange}: {
    value: string;
    isValid: boolean;
    onChange: (value: string) => void;
}) {

    const pastNames = usePastNames();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [highlighted, setHighlighted] = useState<number>(-1);
    const [position, setPosition] = useState<ListPosition | undefined>();
    const inputRef = useRef<HTMLInputElement>(null);

    const suggestions = isOpen ? getSuggestions(pastNames, value) : [];
    const isListShown = suggestions.length > 0;

    // the list floats on the page body so it can be wider than the day without widening it,
    // and so a month's hidden overflow can't clip it; it follows the input when the layout changes
    useLayoutEffect(() => {
        if (!isListShown) {
            return;
        }
        const updatePosition = () => setPosition(getListPosition(inputRef.current!));
        updatePosition();
        window.addEventListener("resize", updatePosition);
        return () => window.removeEventListener("resize", updatePosition);
    }, [isListShown, value]);

    const pick = (name: string): void => {
        onChange(name);
        setIsOpen(false);
        setHighlighted(-1);
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (suggestions.length === 0) {
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((highlighted + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((highlighted - 1 + suggestions.length) % suggestions.length);
        // the list can shrink under the highlight when names arrive from elsewhere
        } else if (e.key === "Enter" && highlighted >= 0 && highlighted < suggestions.length) {
            e.preventDefault();
            pick(suggestions[highlighted]);
        } else if (e.key === "Escape") {
            // closes just the list, not the whole form
            e.preventDefault();
            setIsOpen(false);
        }
    }

    return (
        <>
            <input
                className={isValid ? "" : "invalid"}
                ref={inputRef}
                type="text"
                placeholder="Name"
                autoComplete="off"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                    setHighlighted(-1);
                }}
                onKeyDown={onKeyDown}
                onBlur={() => setIsOpen(false)}/>
            {isListShown && position && createPortal(
                <div className="name-suggestions" style={position}>
                    {suggestions.map((suggestion, index) =>
                        <div
                            key={suggestion}
                            className={`name-suggestion${index === highlighted ? " highlighted" : ""}`}
                            // keep focus in the input so picking doesn't close the list first
                            onMouseDown={e => e.preventDefault()}
                            onMouseEnter={() => setHighlighted(index)}
                            onClick={() => pick(suggestion)}>
                            <Suggestion name={suggestion} typed={value}/>
                        </div>)}
                </div>,
                document.body)}
        </>
    );
}

function EditExpense({year, month, date, expense, onDeleted, closeForm}: {
    year?: number;
    month?: number;
    date?: number;
    expense?: ExpenseType;
    onDeleted?: () => void;
    closeForm: () => void;
}) {

    const [name, setName] = useState<string>(expense?.name ?? "");
    const categories = useCategories();
    const [categoryId, setCategoryId] = useState<number | undefined>(expense?.categoryId ?? categories[0]?.id);
    const [amount, setAmount] = useState<string>(expense?.amount.toString() ?? "");
    const [note, setNote] = useState<string>(expense?.note ?? "");
    const [isPersonal, setIsPersonal] = useState<boolean>(expense?.personal ?? false);
    // the first click on the delete button turns it into a confirm button, the second deletes
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
    // set while a save or delete is on its way, so a double click or a held Enter doesn't send it twice
    const isSending = useRef<boolean>(false);
    const pastNames = usePastNames();

    // if the chosen category is merged away while the form is open, follow the expense to its new category
    useEffect(() => {
        if (!categories.some(category => category.id === categoryId)) {
            setCategoryId(expense?.categoryId ?? categories[0]?.id);
        }
    }, [categories])

    const onNameChanged = (value: string): void => {
        setName(value);
        // a new expense picks up the category last used for the same name
        if (!expense) {
            const typed = value.trim().toLowerCase();
            const match = pastNames.find(pastName => pastName.name.toLowerCase() === typed);
            if (match && categories.some(category => category.id === match.categoryId)) {
                setCategoryId(match.categoryId);
            }
        }
    }

    const onAmountChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setAmount(e.target.value.replace(/[^-+*/()0-9. ]/g, ""));
    }

    // a sum is replaced by its result on leaving the box, so you can see what will be saved
    const onAmountBlur = (): void => {
        if (amountValue !== undefined && !/^-?[\d.]*$/.test(amount.trim())) {
            setAmount(String(amountValue));
        }
    }

    const onSave = (): void => {
        if (isSaveEnabled && !isSending.current) {
            const payload: {
                id?: string,
                date: string,
                name: string,
                categoryId?: number,
                amount: string,
                note: string | null,
                personal: boolean
            } = {
                date: expense?.date ?? toDateString(year!, month!, date!),
                name: name.trim(),
                categoryId: categoryId,
                amount: String(amountValue),
                // a blank note is saved as no note
                note: note.trim().length > 0 ? note.trim() : null,
                personal: isPersonal,
            }
            if (expense) {
                payload.id = expense.id;
            }

            const request = {
                method: expense ? "PUT" : "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            }
            isSending.current = true;
            // the second handler frees the form again if the request never reaches the server
            fetch("api/expense", request).then(response => {
                isSending.current = false;
                if (response.ok) {
                    closeForm();
                } else {
                    window.alert("Couldn't save the expense. Please try again.");
                }
            }, () => isSending.current = false);
        }
    }

    const onDelete = (): void => {
        if (isSending.current) {
            return;
        }
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            return;
        }
        const request = {
            method: "DELETE",
            headers: {'Content-Type': 'application/json'},
            body: expense!.id,
        }
        isSending.current = true;
        fetch("api/expense", request)
            .then(response => {
                isSending.current = false;
                if (response.ok) {
                    onDeleted!();
                } else {
                    window.alert("Couldn't delete the expense. Please try again.");
                }
                closeForm();
            }, () => isSending.current = false);
    }

    const isNameValid = name.trim().length > 0;
    const amountValue = evaluateAmount(amount);
    const isAmountValid = amountValue !== undefined;
    const isSaveEnabled = isNameValid && isAmountValid && categoryId !== undefined;

    // Enter saves from any field but the note, where it starts a new line; Escape cancels.
    // The name input marks the keys it used for its suggestion list, so those are left alone
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.defaultPrevented) {
            return;
        }
        if (e.key === "Escape") {
            closeForm();
        } else if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            onSave();
        }
    }

    return (
        <div className="edit-expense" onKeyDown={onKeyDown}>
            <NameInput value={name} isValid={isNameValid} onChange={onNameChanged}/>

            <select
                value={categoryId ?? ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(Number(e.target.value))}>
                <CategoryOptions/>
            </select>

            <input
                className={isAmountValid ? "" : "invalid"}
                type="text"
                placeholder="Amount"
                title="A number, or a sum like 45.80/2 or 12+8.50"
                value={amount}
                onChange={onAmountChanged}
                onBlur={onAmountBlur}/>

            <textarea
                placeholder="Note"
                rows={2}
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}/>

            <label className="personal" title="Leave this expense out of the month's Each amount">
                <input
                    type="checkbox"
                    checked={isPersonal}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPersonal(e.target.checked)}/>
                Personal
            </label>

            <div className={`${onDeleted ? "three" : "two"}-columns`}>
                <div className="cancel-button" onClick={closeForm}>
                    <FontAwesomeIcon icon={faRotateLeft} size="xs"/>Cancel
                </div>
                <div className={`${isSaveEnabled ? "save" : "disabled"}-button`} onClick={onSave}>
                    <FontAwesomeIcon icon={faFloppyDisk} size="xs"/>Save
                </div>
                {onDeleted &&
                    <div
                        className="delete-button"
                        title={isConfirmingDelete ? "Click again to delete" : "Delete"}
                        onClick={onDelete}>
                        <FontAwesomeIcon icon={isConfirmingDelete ? faCheck : faTrashCan} size="xs"/>
                    </div>}
            </div>
        </div>
    );
}

export default EditExpense;
