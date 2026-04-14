'use strict';

import React from "react";

function ExpenseData({expense}) {

    return (
        <div className="expense-data">
            <span>{expense.category.charAt(0) + expense.category.slice(1).toLowerCase()}</span>
        </div>
    )
}

export default ExpenseData;