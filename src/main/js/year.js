'use strict';

import React from "react";
import Month from "./month";

const MONTHS = Array.from({length: 12}, (_, i) => i);

function Year({year, expenses, notes, onExpenseDeleted}) {

    return (
        <div>
            {MONTHS.map(month =>
                <Month
                    key={month}
                    year={year}
                    month={month}
                    expenses={expenses?.get(month)}
                    note={notes?.get(month)}
                    onExpenseDeleted={onExpenseDeleted}/>)}
        </div>
    )
}

export default Year;