'use strict';

import React from "react";
import Year from './year';

function Calendar({expenses}) {

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

    const getYearsAndMonths = (expensesByDate) => {
        const years = Array.from(expensesByDate.keys());
        years.sort();
        const firstYear = years[0];
        const finalYear = new Date().getFullYear();

        const yearsAndMonths = [];
        for (let year = firstYear; year <= finalYear; year++) {
            yearsAndMonths.push({year, months: Array.from({length: 12}, (_, i) => i)});
        }

        return yearsAndMonths;
    }

    const expensesByDate = getExpensesByDate();
    const yearsAndMonths = getYearsAndMonths(expensesByDate);

    return (
        <div>
            {yearsAndMonths.map(yearAndMonths => <Year year={yearAndMonths.year} months={yearAndMonths.months} expenses={expensesByDate.get(yearAndMonths.year)}/>)}
        </div>
    );
}

export default Calendar;