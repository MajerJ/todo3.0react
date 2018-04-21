import React from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';

export class Register extends React.Component {
    constructor() {
        super();

        this.state = {message: ''}
    }

    _register(event) {
        event.preventDefault();
        const username = this._username;
        const password = this._password;
        
        $.ajax({
            method: 'POST',
            url: 'https://todo30-be-au.herokuapp.com/local-reg',
            header: {'Content-type': 'application/x-www-form-urlencoded'},
            xhrFields: {withCredentials: true},
            data: {username: username.value, password: password.value}
        }).then((response) => {
            if (response.error) {
                this.setState({message: response.error});
            } else {
                sessionStorage.setItem('user', JSON.stringify(response));
                window.location = '/#/tasks';
            }
        });

        this._username.value = '';
        this._password.value = '';
    }

    render() {
        return(
            <div>
            <div id="header">                
                <h1>ToDo List 3.0</h1>
            </div>
            <div id="login">
                <p id="hi">Create your ToDo List 3.0 account.</p>
                <form name="regForm" onSubmit={this._register.bind(this)}>
                    <div>
                        <label>Username</label>
                        <br/>
                        <input type="text" id="field" required ref={ (input) => this._username = input }/>
                    </div>
                    <div>
                        <label>Password</label>
                        <br/>
                        <input type="password" id="field" required ref={ (input) => this._password = input }/>
                    </div>
                    <div>
                        <input id="submit" type="submit" value="Register"/>
                    </div>        
                    <p>Already have an account? <Link to="/login">{'Log in'}</Link></p> 
                </form>
                <div id="message">
                        <p>{this.state.message}</p>
                </div>
            </div>
            </div>        
        );
    }
}