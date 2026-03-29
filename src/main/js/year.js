'use strict';

import React from 'react';
import Month from "./month";

export default class Year extends React.Component {

    getTotal(expenses) {
        let total = 0;
        expenses?.forEach((month, _0, _1) =>
            month.forEach((date, _0, _1) =>
                total += date.reduce((total, expense) => total + expense.amount, 0)))
        return total.toFixed(2);
    }

    render() {
        return (
            <div>
                <h2>{this.props.year} - ${this.getTotal(this.props.expenses)}</h2>
                {this.props.months.map(month => <Month year={this.props.year} month={month} expenses={this.props.expenses?.get(month)} />)}
            </div>
        );
    }
}