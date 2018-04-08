import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';

import { Login } from './login';
import { Register } from './register';
import { Tasks } from './tasks';
import { Notes } from './notes';

ReactDOM.render(
    <Router>
        <Switch>      
        <Route
            component={Login}
            path="/login"
        />
        <Route
            component={Register}
            path="/register"
        />
        <Route
            component={Tasks}
            path="/tasks"
        />
        <Route
            component={Notes}
            path="/notes"
        />
        <Route
            component={Login}
            path="/"
        />
        </Switch>
    </Router>,
    document.getElementById('app')
);