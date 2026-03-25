'use strict';

import React from 'react';
import Year from './year';

export default class Calendar extends React.Component {

    getExpensesByDate(expenses) {
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

    getFirstYearAndMonth(expensesByDate) {
        const years = Array.from(expensesByDate.keys());
        years.sort();
        const firstYear = years[0];

        const months = Array.from(expensesByDate.get(firstYear)?.keys() ?? []);
        months.sort();

        return {firstYear, firstMonth: months[0]};
    }

    getYearsAndMonths(expensesByDate) {
        const {firstYear, firstMonth} = this.getFirstYearAndMonth(expensesByDate);
        const today = new Date();
        const finalYear = today.getFullYear();
        const finalMonth = today.getMonth();

        const yearsAndMonths = [];

        for (let year = firstYear; year <= finalYear; year++) {
            const firstMonthOfYear = year === firstYear ? firstMonth : 0;
            const finalMonthOfYear = year === finalYear ? finalMonth : 11;
            yearsAndMonths.push({year, months: Array.from({length: finalMonthOfYear - firstMonthOfYear + 1}, (_, i) => firstMonthOfYear + i)});
        }

        return yearsAndMonths;
    }

    render() {
        const expensesByDate = this.getExpensesByDate(this.props.expenses);
        const yearsAndMonths = this.getYearsAndMonths(expensesByDate);

        return (
            <div>
                {yearsAndMonths.map(yearAndMonths => <Year year={yearAndMonths.year} months={yearAndMonths.months} expenses={expensesByDate.get(yearAndMonths.year)}/>)}
            </div>
        );
    }
}