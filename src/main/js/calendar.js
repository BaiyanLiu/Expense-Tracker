'use strict';

import React, {useEffect, useState} from "react";
import SockJsClient from "react-stomp";
import Year from "./year";
import YearHeader from "./yearHeader";

function Calendar() {
    const [expenses, setExpenses] = useState([]);
    const [activeYear, setActiveYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetch("api/expense/all")
            .then(response => response.json())
            .then(data => data._embedded.expenses)
            .then(data => setExpenses(data));
    }, [])

    const onExpenseMessage = (message) => {
        const newExpenses = [...expenses];
        const index = newExpenses.findIndex(expense => expense.id === message.expense.id);
        if (index > -1) {
            newExpenses[index] = message.expense;
        } else {
            newExpenses.push(message.expense);
        }
        setExpenses(newExpenses);
    };

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

    const expensesByDate = getExpensesByDate();
    const years = Array.from(expensesByDate.keys());
    years.sort();

    return (
        <div>
            <SockJsClient
                url={'http://localhost:8080/events'}
                topics={['/topic/expense']}
                onMessage={message => onExpenseMessage(message)}/>
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
                onExpenseDeleted={onExpenseDeleted}/>
        </div>
    );
}

export default Calendar;