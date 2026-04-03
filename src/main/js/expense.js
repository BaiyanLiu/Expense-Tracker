'use strict';

import React, {useState} from "react";
import ExpenseData from "./expenseData";

function Expense({expense}) {
    const [isActive, setIsActive] = useState(false);

    const handleClick = () => {
        setIsActive(!isActive);
    }

    return (
        <div>
            <div className="expense" onClick={handleClick}>
                <div className="expense-name">{expense.type.name}</div>
                <div className="expense-amount">${expense.amount}</div>
            </div>
            {isActive && <ExpenseData expense={expense}/>}
        </div>
    )
}

export default Expense;