'use strict';

import React, {useState} from "react";
import EditExpense from "./editExpense";
import {ExpenseType} from "./calendar";
import {useCategoryLookup} from "./categories";
import {amountClass, formatAmount} from "./amount";

function Expense({expense, onDeleted}: {
    expense: ExpenseType;
    onDeleted: () => void;
}) {

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const category = useCategoryLookup()(expense.categoryId);

    return (
        <div>
            <div
                className="expense"
                title={[category.name, expense.personal && "Personal", expense.note].filter(Boolean).join("\n")}
                style={{borderLeftColor: category.color}}
                onClick={() => setIsEditing(!isEditing)}>
                <span className="name">{expense.name}</span>
                <span className={`amount ${amountClass(expense.amount)}`}>
                    {formatAmount(expense.amount)}
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

export default React.memo(Expense);