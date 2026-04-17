'use strict';

import React, {useState} from "react";
import Expense from "./expense";
import EditExpense from "./editExpense";

function Day({year, month, date, expenses, onExpenseDeleted}) {
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    const total = expenses?.reduce((total, expense) => total + expense.amount, 0).toFixed(2);

    return (
        date
            ? <td className="day">
                <div className="header">
                    {date}
                    <div className="add-expense" onClick={() => setIsAddingExpense(!isAddingExpense)}>
                        +
                    </div>
                    {expenses &&
                        <span className={`total ${total >= 0 ? "positive" : "negative"}-amount`}>
                            ${total}
                        </span>}
                </div>

                {isAddingExpense &&
                    <EditExpense
                        year={year}
                        month={month}
                        date={date}
                        closeForm={() => setIsAddingExpense(false)}/>}
                {expenses?.map(expense =>
                    <Expense
                        key={expense.id}
                        expense={expense}
                        onDeleted={() => onExpenseDeleted(expense.id)}/>)}
            </td>

            : <td className="day-empty"></td>
    )
}

export default Day;