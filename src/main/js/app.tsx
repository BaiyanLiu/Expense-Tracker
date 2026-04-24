'use strict';

import React from "react";
import {createRoot} from "react-dom/client";
import Calendar from "./calendar";

function App() {
    return (
        <div className="calendar">
            <React.StrictMode>
                <Calendar/>
            </React.StrictMode>
        </div>
    )
}

const root = createRoot(document.getElementById("react")!);
root.render(<App />);
