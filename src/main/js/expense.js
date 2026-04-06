'use strict';

import React, {useState} from "react";
import ExpenseData from "./expenseData";

function Expense({expense}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div>
            <div className="expense" onClick={() => setIsExpanded(!isExpanded)}>
                <span className="expense-name">{expense.type.name}</span>
                <span className={`expense-amount ${expense.amount >= 0 ? "positive" : "negative"}-amount`}>${expense.amount}</span>
            </div>
            {isExpanded && <ExpenseData expense={expense}/>}
        </div>
    )
}

export default Expense;