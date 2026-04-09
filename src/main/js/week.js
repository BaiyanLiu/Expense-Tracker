'use strict';

import React from "react";
import Day from "./day";

const DAYS = Array.from({length: 7}, (_, i) => i);

function Week({year, month, week, expenses}) {

    return (
        <tr>
            {DAYS.map(day => {
                const date = week[day];
                return <Day key={day} year={year} month={month} date={date} expenses={expenses?.get(date)}/>
            })}
        </tr>
    );
}

export default Week;