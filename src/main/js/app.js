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
        function getExpensesByDate(expenses) {
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

        function getFirstYearAndMonth(expensesByDate) {
            const years = Array.from(expensesByDate.keys());
            years.sort();
            const firstYear = years[0];

            const months = Array.from(expensesByDate.get(firstYear)?.keys() ?? []);
            months.sort();

            return {firstYear, firstMonth: months[0]};
        }

        function getYearsAndMonths(expensesByDate) {
            const {firstYear, firstMonth} = getFirstYearAndMonth(expensesByDate);
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

        const expensesByDate = getExpensesByDate(this.props.expenses);
        const yearsAndMonths = getYearsAndMonths(expensesByDate);

        return (
            <div>
                {yearsAndMonths.map(yearAndMonths => <Year year={yearAndMonths.year} months={yearAndMonths.months} expenses={expensesByDate.get(yearAndMonths.year)}/>)}
            </div>
        );
    }
}

class Year extends React.Component {
    render() {
        return (
            <div>
                <h3>Year={this.props.year}</h3>
                {this.props.months.map(month => <Month year={this.props.year} month={month} expenses={this.props.expenses?.get(month)} />)}
            </div>
        );
    }
}

class Month extends React.Component {
    render() {
        const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        function getWeeks(year, month) {
            const finalDate = new Date(year, month + 1, 0).getUTCDate();

            const weeks = [];
            let currentWeek = {};
            let currentDay = new Date(year, month, 1).getUTCDay();

            for (let date = 1; date <= finalDate; date++) {
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
                <h4>Month={MONTHS[this.props.month]}</h4>
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
                        {weeks.map(week => <Week week={week} expenses={this.props.expenses}/>)}
                    </tbody>
                </table>
            </div>
        );
    }
}

class Week extends React.Component {
    render() {
        const DAYS = [0, 1, 2, 3, 4, 5, 6];

        return (
            <tr>
                {DAYS.map(day => {
                    const date = this.props.week[day];
                    return <Day date={date} expenses={this.props.expenses?.get(date)}/>
                })}
            </tr>
        );
    }
}

class Day extends React.Component {
    render() {
        if (this.props.date) {
            return (
                <td>
                    Date={this.props.date}
                    {this.props.expenses?.map(expense => <Expense expense={expense}/>)}
                </td>
            );
        } else {
            return <td></td>
        }
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

const root = createRoot(document.getElementById('react'));
root.render(<App />);
