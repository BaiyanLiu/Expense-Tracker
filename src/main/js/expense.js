'use strict';

import React, {useState} from "react";
import EditExpense from "./editExpense";

function Expense({expense, onDeleted}) {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div>
            <div className="expense" onClick={() => setIsEditing(!isEditing)}>
                <span className="name">{expense.name}</span>
                <span className={`amount ${expense.amount >= 0 ? "positive" : "negative"}-text`}>
                    ${expense.amount.toFixed(2)}
                </span>
            </div>
            {isEditing &&
                <EditExpense
                    expense={expense}
                    onDeleted={onDeleted}
                    closeForm={() => setIsEditing(false)}/>}
        </div>
    )
}

export default Expense;