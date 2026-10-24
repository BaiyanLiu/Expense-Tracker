'use strict';

import React, {useEffect, useMemo, useRef, useState} from "react";
import Week from "./week";
import CategorySummary from "./categorySummary";
import {ExpenseType, NoteType} from "./calendar";
import {amountClass, formatAmount, halveAmount, roundToCents, sumAmounts, sumShared} from "./amount";
import {toDate} from "./date";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChartPie, faChevronDown, faChevronRight, faCircleCheck, faCircleXmark} from '@fortawesome/free-solid-svg-icons'

// matches the slide transition on .month-body in main.less
const SLIDE_MS = 200;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Month({year, month, expenses, note, carriedCredit, isPast, openRequest, onExpenseDeleted}: {
    year: number,
    month: number,
    expenses?: Map<number, ExpenseType[]>,
    note?: NoteType,
    // a credit (negative) left over from earlier months, which only goes into Each
    carriedCredit: number,
    // past months start collapsed to their header line
    isPast: boolean,
    // goes up each time the year chart asks to show this month
    openRequest: number,
    onExpenseDeleted: (id: string) => void
}) {

    const [paid, setPaid] = useState<boolean>(false);
    const [noteText, setNoteText] = useState<string>("");
    const [noteChanged, setNoteChanged] = useState<boolean>(false);
    const [showSummary, setShowSummary] = useState<boolean>(false);
    const [collapsed, setCollapsed] = useState<boolean>(isPast);
    const [collapsedYear, setCollapsedYear] = useState<number>(year);
    // the weeks stay rendered while the month slides shut, and are dropped once it has
    const [bodyRendered, setBodyRendered] = useState<boolean>(!isPast);
    const [bodyOpen, setBodyOpen] = useState<boolean>(!isPast);

    // the same Month is reused when switching years, so start over from the new year's default, without sliding
    if (collapsedYear !== year) {
        setCollapsedYear(year);
        setCollapsed(isPast);
        setBodyRendered(!isPast);
        setBodyOpen(!isPast);
    }

    useEffect(() => {
        if (collapsed) {
            setBodyOpen(false);
            const timeout = setTimeout(() => setBodyRendered(false), SLIDE_MS);
            return () => clearTimeout(timeout);
        }
        // render the weeks shut first, then open them on a later frame so the slide has somewhere to start from
        setBodyRendered(true);
        let frame = requestAnimationFrame(() => frame = requestAnimationFrame(() => setBodyOpen(true)));
        return () => cancelAnimationFrame(frame);
    }, [collapsed])

    // the request stays set after switching years and back, so only act on one not handled yet
    const handledOpenRequest = useRef<number>(0);
    useEffect(() => {
        if (openRequest > handledOpenRequest.current) {
            handledOpenRequest.current = openRequest;
            setCollapsed(false);
        }
    }, [openRequest])

    useEffect(() => {
        // a month with no note starts unpaid and blank, rather than keeping the year shown before
        setPaid(note?.paid ?? false);
        setNoteText(note?.text ?? "");
        setNoteChanged(false);
    }, [note])

    const getWeeks = (): {[_: number]: number}[] => {
        const finalDate = toDate(year, month + 1, 0).getDate();

        const weeks = [];
        let currentWeek: {[_: number]: number} = {};
        // columns run Monday (0) to Sunday (6), while getDay counts from Sunday
        let currentDay = (toDate(year, month, 1).getDay() + 6) % 7;

        for (let date = 1; date <= finalDate; date++) {
            currentWeek[currentDay] = date;
            if (++currentDay === 7) {
                weeks.push(currentWeek);
                currentWeek = {};
                currentDay = 0;
            }
        }
        if (Object.keys(currentWeek).length !== 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }

    const getTotal = (): number => {
        let total = 0;
        expenses?.forEach(date => total += sumAmounts(date));
        return roundToCents(total);
    }


    const saveNote = (data: any, onSavedHandler: () => void): void => {
        const payload = {
            ...note,
            ...data,
            year: year,
            month: month,
        }

        const request = {
            method: note ? "PUT" : "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
        }
        fetch("api/note", request)
            .then(response => {
                if (response.ok) {
                    onSavedHandler();
                } else {
                    window.alert("Couldn't save the note. Please try again.");
                }
            });
    }

    const onPaidChanged = (): void => {
        saveNote({paid: !paid}, () => setPaid(!paid));
    }

    const onNoteChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setNoteText(e.target.value);
        setNoteChanged(true);
    }

    // saved whenever the box loses focus with changes in it
    const onNoteBlur = (): void => {
        if (noteChanged) {
            saveNote({text: noteText}, () => setNoteChanged(false));
        }
    }

    // Enter leaves the box, which saves it; Escape puts back the saved text
    const onNoteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            setNoteText(note?.text ?? "");
            setNoteChanged(false);
        }
    }

    const weeks = useMemo(getWeeks, [year, month]);
    const total = getTotal();
    // personal expenses are left out of the split, and a credit from earlier months comes off it
    const sharedTotal = sumShared(expenses);
    const half = halveAmount(roundToCents(sharedTotal + carriedCredit));
    const halfTitle = [
        sharedTotal !== total && `Half of ${formatAmount(sharedTotal)} shared`,
        carriedCredit < 0 && `Includes a ${formatAmount(carriedCredit)} credit carried over from ${MONTH_NAMES[(month + 11) % 12]} (${formatAmount(halveAmount(carriedCredit))} each)`,
    ].filter(Boolean).join("\n") || undefined;

    return (
        <div className={`month ${collapsed ? "collapsed" : ""}`} id={`month-${year}-${month}`}>
            {/* the header line is a flex row so the title, Paid, the note box and By Category share one center line */}
            <div className="month-header">
            <h3 title={collapsed ? "Show month" : "Hide month"} onClick={() => setCollapsed(!collapsed)}>
                <FontAwesomeIcon className="collapse-icon" icon={collapsed ? faChevronRight : faChevronDown} size="xs"/>
                {MONTH_NAMES[month]} -&nbsp;
                <span className={amountClass(total)}>{formatAmount(total)}</span>
                <span className="half-amount" title={halfTitle}>
                    &nbsp;(Each&nbsp;
                    <span className={amountClass(half)}>{formatAmount(half)}</span>)
                </span>
            </h3>
            {/* Paid stays visible when collapsed; By Category is always laid out but hidden, so the header line is the same open or closed */}
            <span className="header-controls">
            {total > 0 &&
                <span className="note">
                    <span className={`button ${paid ? "positive" : "negative"}-text`} onClick={onPaidChanged}>
                        <FontAwesomeIcon icon={paid ? faCircleCheck : faCircleXmark} size="sm"/>Paid
                    </span>
                    {paid &&
                        <>
                            <span className="text">
                                <input type="text" placeholder="Notes" size={30} value={noteText} onChange={onNoteChanged} onKeyDown={onNoteKeyDown} onBlur={onNoteBlur}/>
                            </span>
                        </>}
                </span>}
            <span className={`summary-button ${showSummary ? "active" : ""} ${collapsed ? "hidden" : ""}`} onClick={() => setShowSummary(!showSummary)}>
                <FontAwesomeIcon icon={faChartPie} size="sm"/>By Category
            </span>
            </span>
            </div>

            {bodyRendered &&
            <div className={`month-body ${bodyOpen ? "open" : ""}`}>
            <div className="month-body-inner">
            {showSummary && <CategorySummary expenses={expenses}/>}

            <table>
                <thead>
                    <tr>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                        <th>Saturday</th>
                        <th>Sunday</th>
                    </tr>
                </thead>
                <tbody>
                {weeks.map((week, index) =>
                    <Week
                        key={index}
                        year={year}
                        month={month}
                        week={week}
                        expenses={expenses}
                        onExpenseDeleted={onExpenseDeleted}/>)}
                </tbody>
            </table>
            </div>
            </div>}
        </div>
    )
}

export default React.memo(Month);