'use strict';

import React from "react";
import Expense from "./expense";

export default class Day extends React.Component {
    render() {
        if (this.props.date) {
            return (
                <td>
                    Date={this.props.date}
                    {this.props.expenses?.map(expense => <Expense expense={expense}/>)}
                </td>
            );
        } else {
            return <td></td>
        }
    }
}