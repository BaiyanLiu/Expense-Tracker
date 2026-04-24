'use strict';

import React from "react";
import Day from "./day";
import {ExpenseType} from "./calendar";

const DAYS = Array.from({length: 7}, (_, i) => i);

function Week({year, month, week, expenses, onExpenseDeleted}: {
    year: number;
    month: number;
    week: {[_: number]: number},
    expenses?: Map<number, ExpenseType[]>,
    onExpenseDeleted: (id: string) => void
}) {

    return (
        <tr>
            {DAYS.map(day => {
                const date = week[day];
                // noinspection HtmlUnknownAttribute
                return <Day
                    key={`${year}_${day}`}
                    year={year}
                    month={month}
                    date={date}
                    expenses={expenses?.get(date)}
                    onExpenseDeleted={onExpenseDeleted}/>
            })}
        </tr>
    );
}

export default Week;