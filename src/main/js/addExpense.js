'use strict';

import React, {useState} from "react";

function AddExpense({year, month, date, setIsAddingExpense}) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");

    const onAmountChanged = (e) => {
        setAmount(e.target.value.replace(/[^-0-9.]/, ""));
    }

    const onSave = () => {
        if (isSaveEnabled) {
            const saveRequest = {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({date: new Date(year, month, date), name: name, amount: amount}),
            }
            fetch("api/expense", saveRequest).then(() => setIsAddingExpense(false));
        }
    }

    const isNameValid = name.length > 0;
    const isAmountValid = /^-?\d+(\.\d{2})?$/.test(amount);
    const isSaveEnabled = isNameValid && isAmountValid;

    return (
        <div className="add-expense">
            <input type="text" placeholder="Name" className={isNameValid ? "" : "invalid-input"} value={name} onChange={(e) => setName(e.target.value)}/>
            <input type="text" placeholder="Amount" className={isAmountValid ? "" : "invalid-input"} value={amount} onChange={onAmountChanged}/>
            <div className="add-expense-footer">
                <div className="add-expense-cancel" onClick={() => setIsAddingExpense(false)}>Cancel</div>
                <div className={`add-expense-${isSaveEnabled ? "save" : "disabled"}`} onClick={onSave}>Save</div>
            </div>
        </div>
    );
}

export default AddExpense;
