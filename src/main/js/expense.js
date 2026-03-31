'use strict';

import React from "react";

function Expense({expense}) {
    return (
        <div>
            Name={expense.type.name}, Category={expense.type.category}, ${expense.amount}
        </div>
    )
}

export default Expense;