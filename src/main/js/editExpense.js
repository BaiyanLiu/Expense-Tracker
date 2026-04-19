'use strict';

import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFloppyDisk, faRotateLeft, faTrashCan} from '@fortawesome/free-solid-svg-icons'

function EditExpense({year, month, date, expense, onDeleted, closeForm}) {
    const [name, setName] = useState(expense?.name ?? "");
    const [category, setCategory] = useState(expense?.category ?? "");
    const [amount, setAmount] = useState(expense?.amount ?? "");

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch("/api/expense/category/all")
            .then(response => response.json())
            .then(data => data._embedded.strings)
            .then(data => {
                setCategories(data);
                setCategory(expense?.category ?? data[0]);
            });
    }, [])

    const onAmountChanged = (e) => {
        setAmount(e.target.value.replace(/[^-0-9.]/, ""));
    }

    const onSave = () => {
        if (isSaveEnabled) {
            const payload = {
                date: expense?.date ?? new Date(year, month, date),
                name: name,
                category: category,
                amount: amount,
            }
            if (expense) {
                payload.id = expense.id;
            }

            const request = {
                method: expense ? "PUT" : "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            }
            fetch("api/expense", request).then(() => closeForm());
        }
    }

    const onDelete = () => {
        const request = {
            method: "DELETE",
            headers: {'Content-Type': 'application/json'},
            body: expense.id,
        }
        fetch("api/expense", request)
            .then(response => {
                if (response.ok) {
                    onDeleted();
                }
                closeForm()
            });
    }

    const isNameValid = name.length > 0;
    const isAmountValid = /^-?\d+(\.\d{2})?$/.test(amount);
    const isSaveEnabled = isNameValid && isAmountValid;

    return (
        <div className="edit-expense">
            <input
                className={isNameValid ? "" : "invalid"}
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}/>

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(category =>
                    <option key={category} value={category}>
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                    </option>)}
            </select>

            <input
                className={isAmountValid ? "" : "invalid"}
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={onAmountChanged}/>

            <div className={`${onDeleted ? "three" : "two"}-columns`}>
                <div className="cancel-button" onClick={closeForm}>
                    <FontAwesomeIcon icon={faRotateLeft} size="xs"/>Cancel
                </div>
                <div className={`${isSaveEnabled ? "save" : "disabled"}-button`} onClick={onSave}>
                    <FontAwesomeIcon icon={faFloppyDisk} size="xs"/>Save
                </div>
                {onDeleted &&
                    <div className="delete-button" onClick={onDelete}>
                        <FontAwesomeIcon icon={faTrashCan} size="xs"/>
                    </div>}
            </div>
        </div>
    );
}

export default EditExpense;
