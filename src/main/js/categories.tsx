'use strict';

import React, {useContext, useEffect, useRef, useState} from "react";
import {ExpenseType} from "./calendar";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFloppyDisk} from '@fortawesome/free-solid-svg-icons'

export type CategoryType = {
    id: number,
    name: string,
    color: string,
}

// same palette the server uses when a category is added without a color
const PALETTE = ["#5b8def", "#e8a33d", "#4cc38a", "#d660a8", "#2ab7ca", "#9a8cf0", "#e5c454", "#e0645c"];

// the server refuses longer names
export const MAX_NAME_LENGTH = 50;

const UNKNOWN_CATEGORY: CategoryType = {id: -1, name: "Unknown", color: "#666666"};

// every category, sorted by name; provided by Calendar and kept live over the websocket
export const CategoriesContext = React.createContext<CategoryType[]>([]);

export const useCategories = (): CategoryType[] => useContext(CategoriesContext);

export const useCategoryLookup = (): (id: number) => CategoryType => {
    const categories = useCategories();
    return (id: number) => categories.find(category => category.id === id) ?? UNKNOWN_CATEGORY;
}

export function CategoryName({categoryId}: {categoryId: number}) {
    const category = useCategoryLookup()(categoryId);
    return (
        <>
            <span className="category-dot" style={{backgroundColor: category.color}}/>
            {category.name}
        </>
    );
}

// an <option> for every category, sorted by name, leaving out exceptId if given
export function CategoryOptions({exceptId}: {exceptId?: number}) {
    const categories = useCategories();
    return (
        <>
            {categories
                .filter(category => category.id !== exceptId)
                .map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
        </>
    );
}

const isNameTaken = (categories: CategoryType[], name: string, exceptId?: number): boolean =>
    categories.some(category => category.id !== exceptId && category.name.toLowerCase() === name.trim().toLowerCase());

const reportFailure = (response: Response, action: string): void => {
    if (!response.ok) {
        window.alert(`Couldn't ${action}. Please try again.`);
    }
}

const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? "" : "s"}`;

function CategoryRow({category, expenses}: {
    category: CategoryType,
    expenses: ExpenseType[]
}) {

    const categories = useCategories();
    const [name, setName] = useState<string>(category.name);
    const [color, setColor] = useState<string>(category.color);

    // pick up renames and recolors made elsewhere
    useEffect(() => {
        setName(category.name);
        setColor(category.color);
    }, [category])

    const isNameValid = name.trim().length > 0 && !isNameTaken(categories, name, category.id);

    const save = (newName: string, newColor: string): void => {
        fetch("api/category", {
            method: "PUT",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: category.id, name: newName, color: newColor}),
        }).then(response => reportFailure(response, "save the category"));
    }

    // saved whenever the box loses focus with a changed name; a blank or taken name goes back to the saved one
    const onNameBlur = (): void => {
        if (name.trim() === category.name) {
            return;
        }
        if (isNameValid) {
            save(name.trim(), category.color);
        } else {
            setName(category.name);
        }
    }

    // Enter leaves the box, which saves it; Escape puts back the saved name
    const onNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            setName(category.name);
        }
    }

    // React's onChange fires on every step while the picker is open, so save on the native change event,
    // which fires once the picker closes
    const colorInput = useRef<HTMLInputElement>(null);
    // a valid typed name goes along, so a quick color pick doesn't undo a rename the server hasn't echoed yet
    const savedName = isNameValid ? name.trim() : category.name;
    const latest = useRef({category, savedName, save});
    latest.current = {category, savedName, save};
    useEffect(() => {
        const input = colorInput.current;
        const onColorPicked = (): void => {
            const {category, savedName, save} = latest.current;
            if (input && input.value !== category.color) {
                save(savedName, input.value);
            }
        }
        input?.addEventListener("change", onColorPicked);
        return () => input?.removeEventListener("change", onColorPicked);
    }, [])

    const onMerge = (targetId: number): void => {
        const target = categories.find(other => other.id === targetId);
        if (!target) {
            return;
        }

        const expenseCount = expenses.filter(expense => expense.categoryId === category.id).length;
        const message = `Move ${plural(expenseCount, "expense")} from ${category.name} to ${target.name}, ` +
            `then remove ${category.name}?`;
        if (!window.confirm(message)) {
            return;
        }

        fetch("api/category/merge", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({fromId: category.id, toId: target.id}),
        }).then(response => reportFailure(response, "merge the categories"));
    }

    return (
        <tr>
            <td>
                <input
                    ref={colorInput}
                    className="color"
                    type="color"
                    title="Change color"
                    value={color}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}/>
            </td>
            <td>
                <input
                    className={isNameValid ? "" : "invalid"}
                    type="text"
                    maxLength={MAX_NAME_LENGTH}
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    onKeyDown={onNameKeyDown}
                    onBlur={onNameBlur}/>
            </td>
            <td>
                {categories.length > 1 &&
                    <select value="" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onMerge(Number(e.target.value))}>
                        <option value="">Merge into…</option>
                        <CategoryOptions exceptId={category.id}/>
                    </select>}
            </td>
        </tr>
    );
}

function Categories({expenses}: {
    expenses: ExpenseType[]
}) {

    const categories = useCategories();
    const getNextColor = (): string =>
        PALETTE.find(color => !categories.some(category => category.color === color)) ?? PALETTE[categories.length % PALETTE.length];

    const [newName, setNewName] = useState<string>("");
    const [newColor, setNewColor] = useState<string>(getNextColor());

    // once a color is taken, suggest the next free one for the following category
    useEffect(() => {
        setNewColor(getNextColor());
    }, [categories])

    const isNewNameValid = newName.trim().length > 0 && !isNameTaken(categories, newName);
    // set while an add is on its way, so a double click doesn't add the category twice
    const isAdding = useRef<boolean>(false);

    const onAdd = (): void => {
        if (!isNewNameValid || isAdding.current) {
            return;
        }
        isAdding.current = true;
        fetch("api/category", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: newName.trim(), color: newColor}),
        }).then(response => {
            isAdding.current = false;
            reportFailure(response, "add the category");
            if (response.ok) {
                setNewName("");
            }
        }, () => isAdding.current = false);
    }

    return (
        <div className="categories">
            <div className="panel-title">Categories</div>
            <table>
                <tbody>
                {categories.map(category =>
                    <CategoryRow
                        key={category.id}
                        category={category}
                        expenses={expenses}/>)}
                <tr className="add">
                    <td>
                        <input
                            className="color"
                            type="color"
                            title="Color"
                            value={newColor}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColor(e.target.value)}/>
                    </td>
                    <td>
                        <input
                            className={newName.length === 0 || isNewNameValid ? "" : "invalid"}
                            type="text"
                            maxLength={MAX_NAME_LENGTH}
                            placeholder="New category"
                            value={newName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && onAdd()}/>
                    </td>
                    <td>
                        <span className={`${isNewNameValid ? "save" : "disabled"}-button`} onClick={onAdd}>
                            <FontAwesomeIcon icon={faFloppyDisk} size="xs"/>Save
                        </span>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}

export default React.memo(Categories);
