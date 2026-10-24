'use strict';

import React, {useState} from "react";
import Expense from "./expense";
import EditExpense from "./editExpense";
import {ExpenseType} from "./calendar";
import {amountClass, formatAmount, sumAmounts} from "./amount";
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

    const total = expenses && sumAmounts(expenses);

    return (
        date
            ? <td className="day">
                <div className="header">
                    {date}
                    <div className="add-expense" onClick={() => setIsAddingExpense(!isAddingExpense)}>
                        <FontAwesomeIcon icon={faPlus} size="sm"/>
                    </div>
                    {total !== undefined &&
                        <span className={`total ${amountClass(total)}`}>
                            {formatAmount(total)}
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

export default React.memo(Day);