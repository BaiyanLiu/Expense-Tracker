'use strict';

import React, {useEffect} from "react";
import Week from "./week";
import {ExpenseType, NoteType} from "./calendar";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleCheck, faCircleXmark, faFloppyDisk} from '@fortawesome/free-solid-svg-icons'

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Month({year, month, expenses, note, onExpenseDeleted}: {
    year: number,
    month: number,
    expenses?: Map<number, ExpenseType[]>,
    note?: NoteType,
    onExpenseDeleted: (id: string) => void
}) {

    const [paid, setPaid] = React.useState<boolean>(false);
    const [noteText, setNoteText] = React.useState<string>("");
    const [noteChanged, setNoteChanged] = React.useState<boolean>(false);

    useEffect(() => {
        if (note) {
            setPaid(note.paid);
            setNoteText(note.text);
        }
    }, [note])

    const getWeeks = (): {[_: number]: number}[] => {
        const finalDate = new Date(year, month + 1, 0).getUTCDate();

        const weeks = [];
        let currentWeek: {[_: number]: number} = {};
        let currentDay = new Date(year, month, 1).getUTCDay();

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
        expenses?.forEach((date, _0, _1) =>
            total += date.reduce((total, expense) => total + expense.amount, 0))
        return total;
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

    const onSaveNote = (): void => {
        saveNote({text: noteText}, () => setNoteChanged(false));
    }

    const weeks = getWeeks();
    const total = getTotal();

    return (
        <div className="month">
            <h3>
                {MONTH_NAMES[month]} -&nbsp;
                <span className={`${total >= 0 ? "positive" : "negative"}-text`}>${total.toFixed(2)}</span>
            </h3>
            {total < 0 &&
                <span className="note">
                    <span className={`button ${paid ? "positive" : "negative"}-text`} onClick={onPaidChanged}>
                        <FontAwesomeIcon icon={paid ? faCircleCheck : faCircleXmark} size="sm"/>Paid
                    </span>
                    {paid &&
                        <>
                            <span className="text">
                                <input type="text" placeholder="Notes" size={30} value={noteText} onChange={onNoteChanged}/>
                            </span>
                            {noteChanged &&
                                <span className="save-button" onClick={onSaveNote}>
                                    <FontAwesomeIcon icon={faFloppyDisk} size="xs"/>
                                </span>}
                        </>}
                </span>}

            <table>
                <thead>
                    <tr>
                        <th>Sunday</th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                        <th>Saturday</th>
                    </tr>
                </thead>
                <tbody>
                {weeks.map(week => {
                    // noinspection HtmlUnknownAttribute
                    return <Week
                        key={weeks.indexOf(week)}
                        year={year}
                        month={month}
                        week={week}
                        expenses={expenses}
                        onExpenseDeleted={onExpenseDeleted}/>;
                })}
                </tbody>
            </table>
        </div>
    )
}

export default Month;