'use strict';

import React from "react";

export default class Expense extends React.Component {
    render() {
        return (
            <div>
                ID={this.props.expense.id}, ${this.props.expense.amount}, Name={this.props.expense.type.name}, Category={this.props.expense.type.category}, Date={this.props.expense.date}
            </div>
        );
    }
}