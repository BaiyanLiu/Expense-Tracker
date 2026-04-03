'use strict';

import React from "react";

function ExpenseData({expense}) {

    return (
        <div className="expense-data">
            <div>{expense.type.category}</div>
        </div>
    )
}

export default ExpenseData;