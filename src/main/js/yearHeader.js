'use strict';

import React from "react";

function YearHeader({year, expenses, isActive, setActiveYear}) {

    const getTotal = () => {
        let total = 0;
        expenses?.forEach((month, _0, _1) =>
            month.forEach((date, _0, _1) =>
                total += date.reduce((total, expense) => total + expense.amount, 0)))
        return total.toFixed(2);
    }

    return (
        <h2 className={`year-header${isActive ? "-active" : ""}`} onClick={() => setActiveYear(year)}>{year} - ${getTotal()}</h2>
    );
}

export default YearHeader;