'use strict';

import React from 'react';
import Day from "./day";

const DAYS = [0, 1, 2, 3, 4, 5, 6];

export default class Week extends React.Component {
    render() {
        return (
            <tr>
                {DAYS.map(day => {
                    const date = this.props.week[day];
                    return <Day date={date} expenses={this.props.expenses?.get(date)}/>
                })}
            </tr>
        );
    }
}