'use strict';

import React, {useState} from "react";
import Year from "./year";
import YearHeader from "./yearHeader";

function Calendar({expenses}) {
    const [activeYear, setActiveYear] = useState(new Date().getFullYear());

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
            {years.map(year =>
                <YearHeader
                    key={year}
                    year={year}
                    expenses={expensesByDate.get(year)}
                    isActive={year === activeYear}
                    setActiveYear={setActiveYear}/>)}
            <Year
                year={activeYear}
                expenses={expensesByDate.get(activeYear)}/>
        </div>
    );
}

export default Calendar;