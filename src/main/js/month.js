'use strict';

import React from "react";
import Week from "./week";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Month({year, month, expenses}) {

    const getWeeks = () => {
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
        if (Object.keys(currentWeek).length !== 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }

    const getTotal = () => {
        let total = 0;
        expenses?.forEach((date, _0, _1) =>
            total += date.reduce((total, expense) => total + expense.amount, 0))
        return total.toFixed(2);
    }

    const weeks = getWeeks();
    const total = getTotal();

    return (
        <div className="month">
            <h3>{MONTH_NAMES[month]} - <span className={`${total >= 0 ? "positive" : "negative"}-amount`}>${total}</span></h3>
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
                    {weeks.map(week =>
                        <Week
                            key={weeks.indexOf(week)}
                            week={week}
                            expenses={expenses}/>)}
                </tbody>
            </table>
        </div>
    )
}

export default Month;