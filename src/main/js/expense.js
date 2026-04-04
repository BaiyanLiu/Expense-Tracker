'use strict';

import React, {useState} from "react";
import ExpenseData from "./expenseData";

function Expense({expense}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div>
            <div className="expense" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="expense-name">{expense.type.name}</div>
                <div className="expense-amount">${expense.amount}</div>
            </div>
            {isExpanded && <ExpenseData expense={expense}/>}
        </div>
    )
}

export default Expense;