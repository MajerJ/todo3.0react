import React from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import classNames from 'classnames';

export class Tasks extends React.Component {
    constructor() {
        super();

        const sessionUser = sessionStorage.getItem('user');    
        const user = (sessionUser !== null) ? JSON.parse(sessionUser) : {};

        this.state = {
            tasks: [],
            user: user,
            loggedUser: '',
            sortAbc: true,
            sortAbcRev: true,
            sortDate: true,
            sortDateRev: true,
        };
    }

    componentWillMount() {       
        this._getTasks();
        document.addEventListener('keydown', this._removeByCtrlD.bind(this));
    }

    _getTasks() {        
        if(this.state.user.username === undefined) {
            window.location = '/login';
        }

        $.ajax({
            method: 'GET',
            url: 'https://todo30-be-au.herokuapp.com/tasks/' + this.state.user._id,
            xhrFields: {withCredentials: true}
        }).then((response) => {
            if(response.message) {
                alert(response.message);
                sessionStorage.removeItem('user');
                window.location = '/login';
            } else {
                this.setState({tasks: response});
                this.setState({loggedUser: <p>Welcome, {this.state.user.username}! | <a href="#" onClick={this._logout.bind(this)}>Log Out</a></p>})
            }                
        });
    }

    _addTask(event) {
        event.preventDefault();

        $.ajax({                      
            method: 'POST',
            url: 'https://todo30-be-au.herokuapp.com/tasks',            
            data: {task: this._newTask.value, userId: this.state.user._id},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((response) => {
            this.setState({tasks: this.state.tasks.concat([response])});            
        });
        this._newTask.value = '';
    }

    _addByEnter(event) {        
        if (event.which === 13) {
            event.preventDefault();
            this._addTask(event);
        }
    }

    _removeSelected() {
        for (var i = (this.state.tasks.length)-1; i >= 0 ; i--) {
            if (this.state.tasks[i].done) {                             
                $.ajax({                    
                    method: 'DELETE',
                    url: 'https://todo30-be-au.herokuapp.com/tasks/' + this.state.tasks[i]._id                   
                });
                this._removeNotes(this.state.tasks[i]._id);
                const tasks = [...this.state.tasks];
                tasks.splice([i], 1);
                this.setState({tasks});   
            }
        }
    }

    _removeByCtrlD(event) {
        if (event.which === 68 && event.ctrlKey) {
            event.preventDefault();
            this._removeSelected();
        }
    };

    _selectedTask(task, id) {
        sessionStorage.setItem('task', JSON.stringify({'task': task, 'taskId': id}));
    }

    _updateTask(id, done) {
        $.ajax({                    
            method: 'PUT',
            url: 'https://todo30-be-au.herokuapp.com/tasks/' + id,
            data: {done: !done},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        const tasks = [...this.state.tasks];        
        function getIndex(value, arr, prop) {
            for(var i = 0; i < arr.length; i++) {
                if(arr[i][prop] === value) {
                    return i;
                }
            }
        }
        const index = getIndex(id, tasks, '_id');
        tasks[index].done = !done;
        this.forceUpdate();
    }

    _removeNotes(id) {
        $.ajax({                    
            method: 'DELETE',
            url: 'https://todo30-be-au.herokuapp.com/notes/' + id                   
        });
    }

    _sortByAlphabet() {
        const tasks = [...this.state.tasks];
        this.setState({sortAbc: false});
        this.setState({sortDate: true});

        if (this.state.sortAbcRev) {
            tasks.sort(function(a, b) {
                const taskA = a.task.toUpperCase();
                const taskB = b.task.toUpperCase();
                if (taskA < taskB) {
                return -1;
                } if (taskA > taskB) {
                return 1;
                }
            });
            this.setState({tasks});            
        } else {
            tasks.sort(function(a, b) {
                const taskA = a.task.toUpperCase();
                const taskB = b.task.toUpperCase();
                if (taskA < taskB) {
                return 1;
                } if (taskA > taskB) {
                return -1;
                }
            });
            this.setState({tasks});            
        }
        this.setState({sortAbcRev: !this.state.sortAbcRev})
    }

    _sortByDate() {
        const tasks = [...this.state.tasks];
        this.setState({sortAbc: true});
        this.setState({sortDate: false});

        if (this.state.sortDateRev) {
        tasks.sort(function(a,b) {
            if (a.date < b.date) {
                return -1;
            } if (a.date > b.date) {
                return 1;
            }
        });
        this.setState({tasks});
        } else {
            tasks.sort(function(a,b) {
                if (a.date < b.date) {
                    return 1;
                } if (a.date > b.date) {
                    return -1;
                }
            });
            this.setState({tasks});
        }
        this.setState({sortDateRev: !this.state.sortDateRev})
    }

    _logout() {
        $.ajax({
            method: 'GET',
            url: 'https://todo30-be-au.herokuapp.com/logout',
            xhrFields: {withCredentials: true}
        }).then(function(response) {
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('task');
            sessionStorage.setItem('message', response);
            window.location = '/login'; 
        });
    }

    _createList() {   
        return this.state.tasks.map((item) => {
            let taskClass = classNames('tooltip', {'done': item.done});
            let date = new Date(item.date).toLocaleString();
            return (
                <li key={item._id}>
                    <label className="label">
                        <input  className="label__checkbox" type="checkbox" onChange={this._updateTask.bind(this, item._id, item.done)} defaultChecked={item.done} />
                        <span className="label__text">
                            <span className="label__check">
                                <i className="fa fa-check icon"></i>
                            </span>
                        </span>
                    </label>                
                    <Link to="/notes" onClick={this._selectedTask.bind(this, item.task, item._id)} className={taskClass}>{item.task}<em> ({date})</em>
                    <span className="tooltiptext">Click to see task notes</span></Link>      
                </li>
                );
        });
    }
    
    render() {
        const taskList = this._createList();
        const btnClass1 = classNames('fa fa-angle-double-up', {'hidden': this.state.sortAbc}, {'reverse': this.state.sortAbcRev});
        const btnClass2 = classNames('fa fa-angle-double-up', {'hidden': this.state.sortDate}, {'reverse': this.state.sortDateRev});
        return(
            <div>
            <div id="header">                
                <h1>ToDo List 3.0</h1>
                {this.state.loggedUser}
            </div>
            <div id="form">
                <form name="submitTask" onSubmit={this._addTask.bind(this)}>
                    <h3>New Task</h3>
                    <textarea placeholder="Write a new task..." ref={(textarea) => this._newTask = textarea} onKeyPress={this._addByEnter.bind(this)}></textarea>
                    <input type="submit" value="Add" />
                </form>
            </div>   
        
            <div id="list">
                <h3>Your Personal Task List</h3>        
                <ul>
                    {taskList}
                </ul>
            </div>
            <div id="buttons">
                <div>
                    <button onClick={this._removeSelected.bind(this)}>Delete Completed (Ctrl+D)</button>
                </div>
                <div>
                    <button onClick={this._sortByAlphabet.bind(this)}>Sort by Alphabet
                        <i className={btnClass1}></i>
                    </button>            
                </div>
                <div>
                    <button onClick={this._sortByDate.bind(this)}>Sort by Date
                        <i className={btnClass2}></i>
                    </button>
                </div>
            </div>
        </div>
        );
    }
}