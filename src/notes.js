import React from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';

export class Notes extends React.Component {
constructor() {
    super();

    this.state = {
        selectedTask: JSON.parse(sessionStorage.getItem('task')),
        notes: [],
        loggedUser: ''
    }
}

    componentWillMount() {
        this._getNotes();
    }

    _getNotes() {
        if(this.state.selectedTask === null) {
            window.location = '/login';
        }

        let user = JSON.parse(sessionStorage.getItem('user'));

        $.ajax({
            method: 'GET',
            url: 'https://todo30-be-au.herokuapp.com/notes/' + this.state.selectedTask.taskId,
            xhrFields: {withCredentials: true}
        }).then((response) => {
            if (response.message) {
                alert(response.message);
                window.location = '/login';
            } else {
                this.setState({notes: response});
                this.setState({loggedUser: <p>Welcome, {user.username}! | <a href="#" onClick={this._logout.bind(this)}>Log Out</a></p>})
            }
        });
    }

    _addNote(event) {
        event.preventDefault();

        $.ajax({
            method: 'POST',
            url: 'https://todo30-be-au.herokuapp.com/notes/' + this.state.selectedTask.taskId,
            data: {note: this._newNote.value, taskId: this.state.selectedTask.taskId},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((response) => {
            this.setState({notes: this.state.notes.concat([response])});
        });
        this._newNote.value = '';
    }

    _addByEnter(event) {        
        if (event.which === 13) {
            event.preventDefault();
            this._addNote(event);
        }
    }

    _loadNotes() {
        return this.state.notes.map((note) => {
            return (
                <p key={note._id}>{note.note}</p>
            );
        });
    }

    _logout() {
        $.ajax({
            method: 'GET',
            url: 'https://todo30-be-au.herokuapp.com/logout',
            xhrFields: {withCredentials: true}
        }).then(function(response) {
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('task');
            window.location = '/login'; 
        });
    }

    render() {
        const showNotes = this._loadNotes();
        return(
            <div>
            <div id="header">                
                <h1>ToDo List 3.0</h1>
                {this.state.loggedUser}
            </div>
            <div id="form">
                <form name="submitTask" onSubmit={this._addNote.bind(this)}>
                    <h3>New Note</h3>
                    <textarea placeholder="Write a note..." ref={(textarea) => this._newNote = textarea} onKeyPress={this._addByEnter.bind(this)}></textarea>
                    <input type="submit" value="Add" />
                </form>
            </div>        
            <div id="list">
                <h3>Notes for the Task "{this.state.selectedTask.task}"</h3>        
                <div>
                    {showNotes}
                </div>
            </div>
            <div id="buttons">
                <div></div>
                <div>
                    <Link to="/tasks"><button>Back to Task List</button></Link>
                </div> 
                <div></div>   
            </div>
        </div>
        );
    }
}