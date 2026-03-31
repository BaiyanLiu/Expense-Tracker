'use strict';

import React from 'react';
import Month from "./month";

function Year({year, months, expenses}) {

    const getTotal = () => {
        let total = 0;
        expenses?.forEach((month, _0, _1) =>
            month.forEach((date, _0, _1) =>
                total += date.reduce((total, expense) => total + expense.amount, 0)))
        return total.toFixed(2);
    }

    return (
        <div>
            <h2>{year} - ${getTotal()}</h2>
            {months.map(month => <Month year={year} month={month} expenses={expenses?.get(month)}/>)}
        </div>
    )
}

export default Year;