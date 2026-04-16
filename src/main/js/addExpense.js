'use strict';

import React, {useEffect, useState} from "react";

function AddExpense({year, month, date, setIsAddingExpense}) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch("/api/expense/category/all")
            .then(response => response.json())
            .then(data => data._embedded.strings)
            .then(data => {
                setCategories(data);
                setCategory(data[0]);
            });
    }, [])

    const onAmountChanged = (e) => {
        setAmount(e.target.value.replace(/[^-0-9.]/, ""));
    }

    const onSave = () => {
        if (isSaveEnabled) {
            const request = {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    date: new Date(year, month, date),
                    name: name,
                    category: category,
                    amount: amount}),
            }
            fetch("api/expense", request).then(() => setIsAddingExpense(false));
        }
    }

    const isNameValid = name.length > 0;
    const isAmountValid = /^-?\d+(\.\d{2})?$/.test(amount);
    const isSaveEnabled = isNameValid && isAmountValid;

    return (
        <div className="add-expense">
            <input
                className={isNameValid ? "" : "invalid"}
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}/>

            <select onChange={(e) => setCategory(e.target.value)}>
                {categories.map(category =>
                    <option value={category}>
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                    </option>)}
            </select>

            <input
                className={isAmountValid ? "" : "invalid"}
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={onAmountChanged}/>

            <div className="footer">
                <div className="cancel-button" onClick={() => setIsAddingExpense(false)}>
                    Cancel
                </div>
                <div className={`${isSaveEnabled ? "save" : "disabled"}-button`} onClick={onSave}>
                    Save
                </div>
            </div>
        </div>
    );
}

export default AddExpense;
