'use strict';

import React from "react";
import Month from "./month";

const MONTHS = Array.from({length: 12}, (_, i) => i);

function Year({year, expenses}) {

    return (
        <div>
            {MONTHS.map(month => <Month year={year} month={month} expenses={expenses?.get(month)}/>)}
        </div>
    )
}

export default Year;