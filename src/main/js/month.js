'use strict';

import React from "react";
import Week from "./week";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default class Month extends React.Component {

    getWeeks(year, month) {
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

    render() {
        const weeks = this.getWeeks(this.props.year, this.props.month);

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