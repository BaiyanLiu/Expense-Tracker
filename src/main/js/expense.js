'use strict';

import React from "react";

export default class Expense extends React.Component {
    render() {
        return (
            <div>
                Name={this.props.expense.type.name}, Category={this.props.expense.type.category}, ${this.props.expense.amount}
            </div>
        );
    }
}