'use strict';

import React, {useEffect, useState} from "react";
//@ts-expect-error
import SockJsClient from "react-stomp";
import Year from "./year";
import YearHeader from "./yearHeader";

function Calendar() {
    const [expenses, setExpenses] = useState<ExpenseType[]>([]);
    const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
    const [notes, setNotes] = useState<NoteType[]>([]);

    useEffect(() => {
        fetch("api/expense/all")
            .then(response => response.json())
            .then(data => data._embedded.expenses)
            .then((data: ExpenseType[]) => setExpenses(data));

        fetch("api/note/all")
            .then(response => response.json())
            .then(data => data._embedded.notes)
            .then((data: NoteType[]) => setNotes(data));
    }, [])

    const onExpenseMessage = (newExpense: ExpenseType): void => {
        const newExpenses = [...expenses];
        const index = newExpenses.findIndex(expense => expense.id === newExpense.id);
        if (index > -1) {
            newExpenses[index] = newExpense;
        } else {
            newExpenses.push(newExpense);
        }
        setExpenses(newExpenses);
    }

    const onExpenseDeleted = (id: string): void => {
        setExpenses(expenses.filter(expense => expense.id !== id));
    }

    const getExpensesByDate = (): Map<number, Map<number, Map<number, ExpenseType[]>>> => {
        const expensesByDate = new Map();

        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const year = expenseDate.getUTCFullYear();
            const month = expenseDate.getUTCMonth();
            const date = expenseDate.getUTCDate();

            if (!expensesByDate.has(year)) {
                expensesByDate.set(year, new Map());
            }
            const expensesForYear = expensesByDate.get(year);

            if (!expensesForYear.has(month)) {
                expensesForYear.set(month, new Map());
            }
            const expensesForMonth = expensesForYear.get(month);

            if (!expensesForMonth.has(date)) {
                expensesForMonth.set(date, []);
            }

            expensesForMonth.get(date).push(expense);
        });

        return expensesByDate;
    }

    const onNoteMessage = (newNote: NoteType): void => {
        const newNotes = [...notes];
        const index = newNotes.findIndex(note => note.year === newNote.year && note.month === newNote.month);
        if (index > -1) {
            newNotes[index] = newNote;
        } else {
            newNotes.push(newNote);
        }
        setNotes(newNotes);
    }

    const getNotesByMonth = (): Map<number, Map<number, NoteType>> => {
        const notesByMonth = new Map();

        notes.forEach(note => {
            const year = note.year;
            if (!notesByMonth.has(year)) {
                notesByMonth.set(year, new Map());
            }
            notesByMonth.get(year).set(note.month, note);
        });

        return notesByMonth;
    }

    const expensesByDate = getExpensesByDate();
    const notesByMonth = getNotesByMonth();
    const years = Array.from(expensesByDate.keys());
    years.sort();

    return (
        <div>
            <SockJsClient
                url={'http://localhost:8080/events'}
                topics={['/topic/expense']}
                onMessage={(payload: any) => onExpenseMessage(payload.expense)}/>
            <SockJsClient
                url={'http://localhost:8080/events'}
                topics={['/topic/note']}
                onMessage={(payload: any) => onNoteMessage(payload.note)}/>
            {years.map(year => {
                // noinspection HtmlUnknownAttribute
                return <YearHeader
                    key={year}
                    year={year}
                    expenses={expensesByDate.get(year)}
                    isActive={year === activeYear}
                    setActiveYear={setActiveYear}/>;
            })}
            <Year
                year={activeYear}
                expenses={expensesByDate.get(activeYear)}
                notes={notesByMonth.get(activeYear)}
                onExpenseDeleted={onExpenseDeleted}/>
        </div>
    );
}

export type ExpenseType = {
    id: string,
    date: Date,
    name: string,
    category: string,
    amount: number,
}

export type NoteType = {
    year: number,
    month: number,
    paid: boolean,
    text: string,
}

export default Calendar;