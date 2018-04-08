import React from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';

export class Login extends React.Component {    
    constructor() {
        super();

        this.state = {message: ''};
    }

    _login(event) {
        event.preventDefault();
        const username = this._username;
        const password = this._password;
        
        $.ajax({
            method: 'POST',
            url: 'https://todo30-be-au.herokuapp.com/login',
            header: {'Content-type': 'application/x-www-form-urlencoded'},
            xhrFields: {withCredentials: true},
            data: {username: username.value, password: password.value}
        }).then((response) => {
            if (response.error) {
                this.setState({message: response.error});
            } else {
                sessionStorage.setItem('user', JSON.stringify(response));
                window.location = '/tasks';
            }
        });

        this._username.value = '';
        this._password.value = '';
    }

    componentWillMount() {
        const sessionUser = sessionStorage.getItem('user');    
        const user = (sessionUser !== null) ? JSON.parse(sessionUser) : {};
        if(user.username !== undefined) {
            window.location = '/tasks';
        }

        const logoutMessage = sessionStorage.getItem('message');
        if(logoutMessage !== undefined) {
            this.setState({message: logoutMessage});
            sessionStorage.removeItem('message');
        }
    }

    render() {
        return(
            <div>
            <div id="header">                
                <h1>ToDo List 3.0</h1>
            </div>
            <div id="login">
                <p id="hi">Log in to see your personal task list.</p>
                <form name="loginForm" onSubmit={this._login.bind(this)}>  
                    <div>
                        <label>Username</label>
                        <br/>
                        <input type="text" id="field" required ref={(input) => this._username = input}/>
                    </div>
                    <div>
                        <label>Password</label>
                        <br/>
                        <input type="password" id="field" required ref={(input) => this._password = input}/>
                    </div>
                    <div >
                        <input id="submit" type="submit" value="Log In"/>
                    </div>         
                    <p>Need create an account? <Link to="/register">{'Sign up'}</Link></p>
                </form>
                <div id="message">
                        <p>{this.state.message}</p>
                </div> 
            </div>
            </div>
        );
    }
}