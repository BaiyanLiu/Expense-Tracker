'use strict';

import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import Calendar from './calendar';

function App() {
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        fetch('api/expense/all')
            .then(response => response.json())
            .then(data => data._embedded.expenses)
            .then(data => setExpenses(data));
    }, [])

    return (
        <div className="calendar">
            <Calendar expenses={expenses}/>
        </div>
    )
}

const root = createRoot(document.getElementById('react'));
root.render(<App />);
