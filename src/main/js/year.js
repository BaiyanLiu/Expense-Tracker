'use strict';

import React from 'react';
import Month from "./month";

export default class Year extends React.Component {
    render() {
        return (
            <div>
                <h2>{this.props.year}</h2>
                {this.props.months.map(month => <Month year={this.props.year} month={month} expenses={this.props.expenses?.get(month)} />)}
            </div>
        );
    }
}