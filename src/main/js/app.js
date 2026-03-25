'use strict';

import React from 'react';
import {createRoot} from 'react-dom/client';
import Calendar from './calendar';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {expenses: []}
    }

    componentDidMount() {
        fetch('api/expense/all')
            .then(response => response.json())
            .then(data => data._embedded.expenses)
            .then(data => this.setState({expenses: data}));
    }

    render() {
        return (
            <div>
                <Calendar expenses={this.state.expenses}/>
            </div>
        );
    }
}

const root = createRoot(document.getElementById('react'));
root.render(<App />);
