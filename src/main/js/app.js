'use strict';

import React from "react";
import {createRoot} from "react-dom/client";
import Calendar from "./calendar";

function App() {
    return (
        <div className="calendar">
            <Calendar/>
        </div>
    )
}

const root = createRoot(document.getElementById("react"));
root.render(<App />);
