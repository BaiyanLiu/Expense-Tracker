'use strict';

import React from "react";

function Expense({expense}) {
    return (
        <div className="expense">
            <div className="expense-name">{expense.type.name}</div>
            <div className="expense-amount">${expense.amount}</div>
        </div>
    )
}

export default Expense;