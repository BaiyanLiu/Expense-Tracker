'use strict';

import React from "react";
import Month from "./month";
import {ExpenseType, NoteType} from "./calendar";

const MONTHS = Array.from({length: 12}, (_, i) => i);

function Year({year, expenses, notes, credits, openMonth, onExpenseDeleted}: {
    year: number;
    expenses?: Map<number, Map<number, ExpenseType[]>>,
    notes?: Map<number, NoteType>,
    // credit carried into each month's Each from the months before it
    credits?: Map<number, number>,
    openMonth?: OpenMonthRequest,
    onExpenseDeleted: (id: string) => void
}) {
    const today = new Date();
    const isPast = (month: number): boolean =>
        year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());

    return (
        <div>
            {MONTHS.map(month =>
                <Month
                    key={month}
                    year={year}
                    month={month}
                    expenses={expenses?.get(month)}
                    note={notes?.get(month)}
                    carriedCredit={credits?.get(month) ?? 0}
                    isPast={isPast(month)}
                    openRequest={openMonth?.year === year && openMonth.month === month ? openMonth.seq : 0}
                    onExpenseDeleted={onExpenseDeleted}/>)}
        </div>
    )
}

export type OpenMonthRequest = {
    year: number,
    month: number,
    seq: number,
}

export default React.memo(Year);