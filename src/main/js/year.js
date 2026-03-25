'use strict';

import React from 'react';
import Month from "./month";

export default class Year extends React.Component {
    render() {
        return (
            <div>
                <h3>Year={this.props.year}</h3>
                {this.props.months.map(month => <Month year={this.props.year} month={month} expenses={this.props.expenses?.get(month)} />)}
            </div>
        );
    }
}