'use strict';

import React from "react";
import Expense from "./expense";

export default class Day extends React.Component {
    render() {
        if (this.props.date) {
            return (
                <td>
                    <div className="date">
                        <div className="header">{this.props.date}</div>
                        {this.props.expenses?.map(expense => <Expense expense={expense}/>)}
                    </div>
                </td>
            );
        } else {
            return <td className="empty"></td>
        }
    }
}