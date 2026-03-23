'use strict';

import React from 'react';
import {createRoot} from 'react-dom/client';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {expenses: []}
    }

    componentDidMount() {
        fetch('api/expense/all')
            .then(response => response.json())
            .then(data => data._embedded.expenses)
            .then(data => this.setState({expenses: data}));
    }

    render() {
        return (
            <div>
                <ExpenseList expenses={this.state.expenses}/>
            </div>
        );
    }
}

class ExpenseList extends React.Component {
    render() {
        function getExpenseDates(expenses) {
            const expenseDates = new Map();

            expenses.map(expense => expense.date).forEach(expenseDate => {
                const date = new Date(expenseDate);
                const year = date.getUTCFullYear();
                const month = date.getUTCMonth();

                if (!expenseDates.has(year)) {
                    expenseDates.set(year, new Map());
                }
                if (!expenseDates.get(year).has(month)) {
                    expenseDates.get(year).set(month, new Set());
                }

                expenseDates.get(year).get(month).add(date.getUTCDate());
            });

            return expenseDates;
        }

        function getFirstYearAndMonth(expenseDates) {
            const expenseYears = Array.from(expenseDates.keys());
            expenseYears.sort();
            const firstYear = expenseYears[0];

            const expenseMonths = expenseDates.get(firstYear) ? Array.from(expenseDates.get(firstYear).keys()) : [];
            expenseMonths.sort();

            return {firstYear, firstMonth: expenseMonths[0]};
        }

        function getYearsAndMonths(expenseDates) {
            const {firstYear, firstMonth} = getFirstYearAndMonth(expenseDates);
            const today = new Date();
            const lastYear = today.getFullYear();

            const yearsAndMonths = [];

            for (let year = firstYear; year <= lastYear; year++) {
                const startMonth = year === firstYear ? firstMonth : 0;
                const endMonth = year === lastYear ? today.getMonth() : 11;
                yearsAndMonths.push({year, months: Array.from({length: endMonth - startMonth + 1}, (_, i) => startMonth + i)});
            }

            return yearsAndMonths;
        }

        const expenseDates = getExpenseDates(this.props.expenses);
        const yearsAndMonths = getYearsAndMonths(expenseDates);

        return (
            <div>
                {yearsAndMonths.map(yearAndMonths => <Year year={yearAndMonths.year} months={yearAndMonths.months}/>)}
                {this.props.expenses.map(expense => <Expense expense={expense}/>)}
            </div>
        );
    }
}

class Expense extends React.Component {
    render() {
        return (
            <div>
                ID={this.props.expense.id}, ${this.props.expense.amount}, Name={this.props.expense.type.name}, Category={this.props.expense.type.category}, Date={this.props.expense.date}
            </div>
        );
    }
}

class Year extends React.Component {
    render() {
        return (
            <div>
                Year={this.props.year}
                {this.props.months.map(month => <Month year={this.props.year} month={month}/>)}
            </div>
        );
    }
}

class Month extends React.Component {
    render() {
        function getWeeks(year, month) {
            const lastDate = new Date(year, month + 1, 0).getUTCDate();

            const weeks = [];
            let currentWeek = {};
            let currentDay = new Date(year, month, 1).getUTCDay();

            for (let date = 1; date <= lastDate; date++) {
                currentWeek[currentDay] = date;
                if (++currentDay === 7) {
                    weeks.push(currentWeek);
                    currentWeek = {};
                    currentDay = 0;
                }
            }
            weeks.push(currentWeek);

            return weeks;
        }

        const weeks = getWeeks(this.props.year, this.props.month);

        return (
            <div>
                Month={this.props.month}
                {weeks.map(week => <Week week={week}/>)}
            </div>
        );
    }
}

class Week extends React.Component {
    render() {
        const DAYS = [0, 1, 2, 3, 4, 5, 6];

        return (
            <div>
                {DAYS.map(day => <Day day={day} date={this.props.week[day]}/>)}
            </div>
        );
    }
}

class Day extends React.Component {
    render() {
        return (
            <div>
                Day={this.props.day}, Date={this.props.date}
            </div>
        );
    }
}

const root = createRoot(document.getElementById('react'));
root.render(<App />);
