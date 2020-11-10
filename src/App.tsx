import React, { useState } from 'react';
import './App.css';
import { NavLink, Redirect, Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
// import firebase from 'firebase/app';

import NewPost from './NewPost';
import RoomList from './RoomList';
import Settings from './Settings';
import { User } from './types';
import Login from './Login';

function App() {
    const history = createBrowserHistory();
    const [user, setUser] = useState<User>();

    return (
        <Router history={history}>
            <div className="App">
                <header className="App-header">
                    <nav>
                        <ul>
                            <li>
                                <NavLink to='/list'>
                                    View Lists
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to='/new-post'>
                                    Room
                                </NavLink>
                            </li>
                            {user ?
                                (<li>
                                    <NavLink to='/settings'>
                                        Settings
                                </NavLink>
                                </li>) : (<li>
                                    <NavLink to='/login'>
                                        Sign in
                                    </NavLink>
                                </li>)}
                        </ul>
                    </nav>
                </header>
                <main>
                    <Switch>
                        <Route exact path='/'>
                            <Redirect to='/list' />
                        </Route>
                        <Route path='/list'>
                            <RoomList />
                        </Route>
                        <Route path='/new-post'>
                            <NewPost />
                        </Route>
                        <Route path='/settings'>
                            {user &&
                                <Settings user={user} />
                            }
                        </Route>
                        <Route path='/login'>
                            <Login setUser={setUser} />
                        </Route>
                    </Switch>
                </main>
            </div>
        </Router>
    );
}

export default App;
