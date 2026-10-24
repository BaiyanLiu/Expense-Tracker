'use strict';

import React from "react";
import {ExpenseType} from "./calendar";
import {formatAmount, roundToCents, sumAmounts} from "./amount";

function YearHeader({year, expenses, isActive, setActiveYear}: {
    year: number,
    expenses?: Map<number, Map<number, ExpenseType[]>>,
    isActive: boolean,
    setActiveYear: (year: number) => void
}) {

    const getTotal = (): number => {
        let total = 0;
        expenses?.forEach(month => month.forEach(date => total += sumAmounts(date)));
        return roundToCents(total);
    }

    return (
        <h2 className={`year-header ${isActive ? "active" : ""}`} onClick={() => setActiveYear(year)}>
            {year} - {formatAmount(getTotal())}
        </h2>
    );
}

export default React.memo(YearHeader);