'use strict';

import React, {useState} from "react";
import Expense from "./expense";
import AddExpense from "./addExpense";

function Day({year, month, date, expenses}) {
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    const total = expenses?.reduce((total, expense) => total + expense.amount, 0).toFixed(2);

    return (
        date
            ? <td className="day">
                <div className="day-header">
                    {date}
                    <div className="add-expense-button" onClick={() => setIsAddingExpense(!isAddingExpense)}>+</div>
                    {expenses &&
                        <span className={`day-header-total ${total >= 0 ? "positive" : "negative"}-amount`}>${total}</span>}
                </div>
                {isAddingExpense && <AddExpense year={year} month={month} date={date} setIsAddingExpense={setIsAddingExpense}/>}
                {expenses?.map(expense => <Expense key={expense.id} expense={expense}/>)}
            </td>
            : <td className="day-empty"></td>
    )
}

export default Day;