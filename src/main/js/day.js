'use strict';

import React, {useState} from "react";
import Expense from "./expense";
import AddExpense from "./addExpense";

function Day({date, expenses}) {
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    return (
        date
            ? <td className="day">
                <div className="day-header">
                    {date}
                    <div className="add-expense-button" onClick={() => setIsAddingExpense(true)}>+</div>
                    {expenses &&
                        <div className="day-header-total">
                            ${expenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2)}
                        </div>}
                </div>
                {isAddingExpense && <AddExpense setIsAddingExpense={setIsAddingExpense}/>}
                {expenses?.map(expense => <Expense expense={expense}/>)}
            </td>
            : <td className="day-empty"></td>
    )
}

export default Day;