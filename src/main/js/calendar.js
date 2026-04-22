'use strict';

import React, {useEffect, useState} from "react";
import SockJsClient from "react-stomp";
import Year from "./year";
import YearHeader from "./yearHeader";

function Calendar() {
    const [expenses, setExpenses] = useState([]);
    const [activeYear, setActiveYear] = useState(new Date().getFullYear());
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        fetch("api/expense/all")
            .then(response => response.json())
            .then(data => data._embedded.expenses)
            .then(data => setExpenses(data));

        fetch("api/note/all")
            .then(response => response.json())
            .then(data => data._embedded.notes)
            .then(data => setNotes(data));
    }, [])

    const onMessage = (payload, entities, setEntities) => {
        const newEntities = [...entities];
        const index = newEntities.findIndex(entity => entity.id === payload.id);
        if (index > -1) {
            newEntities[index] = payload;
        } else {
            newEntities.push(payload);
        }
        setEntities(newEntities);
    }

    const onExpenseDeleted = (id) => {
        setExpenses(expenses.filter(expense => expense.id !== id));
    }

    const getExpensesByDate = () => {
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

    const getNotesByMonth = () => {
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
                onMessage={message => onMessage(message.expense, expenses, setExpenses)}/>
            <SockJsClient
                url={'http://localhost:8080/events'}
                topics={['/topic/note']}
                onMessage={message => onMessage(message.note, notes, setNotes)}/>
            {years.map(year =>
                <YearHeader
                    key={year}
                    year={year}
                    expenses={expensesByDate.get(year)}
                    isActive={year === activeYear}
                    setActiveYear={setActiveYear}/>)}
            <Year
                year={activeYear}
                expenses={expensesByDate.get(activeYear)}
                notes={notesByMonth.get(activeYear)}
                onExpenseDeleted={onExpenseDeleted}/>
        </div>
    );
}

export default Calendar;