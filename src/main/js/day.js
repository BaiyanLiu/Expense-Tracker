'use strict';

import React from "react";
import Expense from "./expense";

function Day({date, expenses}) {
    return (
        date
            ? <td className="day">
                <div className="day-header">
                    {date}
                    <div className="add-expense-button">+</div>
                    {expenses &&
                        <div className="day-header-total">
                            ${expenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2)}
                        </div>}
                </div>
                {expenses?.map(expense => <Expense expense={expense}/>)}
            </td>
            : <td className="day-empty"></td>
    )
}

export default Day;