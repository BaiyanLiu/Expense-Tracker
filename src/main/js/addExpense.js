'use strict';

import React from "react";

function AddExpense({setIsAddingExpense}) {

    return (
        <div className="add-expense">
            <input type="text" placeholder="Type"/>
            <input type="number" placeholder="0.00"/>
            <div className="add-expense-footer">
                <div className="add-expense-cancel" onClick={() => setIsAddingExpense(false)}>Cancel</div>
                <div className="add-expense-save" onClick={() => setIsAddingExpense(false)}>Save</div>
            </div>
        </div>
    );
}

export default AddExpense;
