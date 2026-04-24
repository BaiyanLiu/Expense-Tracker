'use strict';

import React, {useState} from "react";
import Expense from "./expense";
import EditExpense from "./editExpense";
import {ExpenseType} from "./calendar";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'

function Day({year, month, date, expenses, onExpenseDeleted}: {
    year: number;
    month: number;
    date: number;
    expenses?: ExpenseType[];
    onExpenseDeleted: (id: string) => void;
}) {

    const [isAddingExpense, setIsAddingExpense] = useState<boolean>(false);

    const total = expenses?.reduce((total, expense) => total + expense.amount, 0);

    return (
        date
            ? <td className="day">
                <div className="header">
                    {date}
                    <div className="add-expense" onClick={() => setIsAddingExpense(!isAddingExpense)}>
                        <FontAwesomeIcon icon={faPlus} size="sm"/>
                    </div>
                    {total &&
                        <span className={`total ${total >= 0 ? "positive" : "negative"}-text`}>
                            ${total.toFixed(2)}
                        </span>}
                </div>

                {isAddingExpense &&
                    <EditExpense
                        year={year}
                        month={month}
                        date={date}
                        closeForm={() => setIsAddingExpense(false)}/>}
                {expenses?.map(expense => {
                    // noinspection HtmlUnknownAttribute
                    return <Expense
                        key={expense.id}
                        expense={expense}
                        onDeleted={() => onExpenseDeleted(expense.id)}/>;
                })}
            </td>

            : <td className="day-empty"></td>
    )
}

export default Day;