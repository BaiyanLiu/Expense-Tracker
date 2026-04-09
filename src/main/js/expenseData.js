'use strict';

import React from "react";

function ExpenseData({expense}) {

    return (
        <div className="expense-data">
            <span>{expense.type.category ?? "None"}</span>
        </div>
    )
}

export default ExpenseData;