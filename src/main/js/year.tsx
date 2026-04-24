'use strict';

import React from "react";
import Month from "./month";
import {ExpenseType, NoteType} from "./calendar";

const MONTHS = Array.from({length: 12}, (_, i) => i);

function Year({year, expenses, notes, onExpenseDeleted}: {
    year: number;
    expenses?: Map<number, Map<number, ExpenseType[]>>,
    notes?: Map<number, NoteType>,
    onExpenseDeleted: (id: string) => void
}) {

    return (
        <div>
            {MONTHS.map(month => {
                // noinspection HtmlUnknownAttribute
                return <Month
                    key={month}
                    year={year}
                    month={month}
                    expenses={expenses?.get(month)}
                    note={notes?.get(month)}
                    onExpenseDeleted={onExpenseDeleted}/>;
            })}
        </div>
    )
}

export default Year;