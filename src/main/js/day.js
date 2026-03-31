'use strict';

import React from "react";
import Expense from "./expense";

function Day({date, expenses}) {
    return (
        date
            ? <td className="date">
                <div className="header">
                    {date}
                    {expenses &&
                        <div className="total">
                            ${expenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2)}
                        </div>}
                </div>
                {expenses?.map(expense => <Expense expense={expense}/>)}
            </td>
            : <td className="empty"></td>
    )
}

export default Day;