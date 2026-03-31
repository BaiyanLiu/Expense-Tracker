'use strict';

import React from 'react';
import Day from "./day";

function Week({week, expenses}) {
    const DAYS = [0, 1, 2, 3, 4, 5, 6];

    return (
        <tr>
            {DAYS.map(day => {
                const date = week[day];
                return <Day date={date} expenses={expenses?.get(date)}/>
            })}
        </tr>
    );
}

export default Week;