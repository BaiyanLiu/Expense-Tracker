'use strict';

import React from "react";
import Expense from "./expense";

export default class Day extends React.Component {
    render() {
        if (this.props.date) {
            return (
                <td className="date">
                    <div className="header">
                        {this.props.date}
                        {this.props.expenses &&
                            <div className="total">
                                ${this.props.expenses.reduce((total, current) => total + current.amount, 0)}
                            </div>}
                    </div>
                    {this.props.expenses?.map(expense => <Expense expense={expense}/>)}
                </td>
            );
        } else {
            return <td className="empty"></td>
        }
    }
}