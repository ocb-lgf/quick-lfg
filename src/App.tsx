import React, { useState } from 'react';
import './App.css';
import { Link, Redirect, Route, Router, Switch } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import { createBrowserHistory } from 'history';
// import firebase from 'firebase/app';

import NewPost from './NewPost';
import RoomList from './RoomList';
import Settings from './Settings';
import { User } from './types';
import Login from './Login';

const history = createBrowserHistory();

function App() {
    const [user, setUser] = useState<User>();
    const [docId, setDocId] = useState<string>();

    return (
        <Router history={history}>
            <div className="App">
                <header className="App-header">
                    <Navbar variant="dark" className="justify-content-center">
                        <Navbar.Brand className="text-white" >LFG</Navbar.Brand>
                        <Nav>
                            <Nav.Item>
                                <Nav.Link as={Link} to='/list'>
                                    LFG List
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link as={Link} to='/new-post'>
                                    Room
                                </Nav.Link>
                            </Nav.Item>
                            {user ?
                                <Nav.Item>
                                    <Nav.Link as={Link} to='/settings'>
                                        Settings
                                    </Nav.Link>
                                </Nav.Item>
                                :
                                <Nav.Item>
                                    <Nav.Link as={Link} to='/login'>
                                        Sign in
                                    </Nav.Link>
                                </Nav.Item>
                            }
                        </Nav>
                    </Navbar>
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
                                <Settings user={user} docId={docId} />
                            }
                        </Route>
                        <Route path='/login'>
                            <Login setUser={setUser} setDocId={setDocId} />
                        </Route>
                    </Switch>
                </main>
            </div>
        </Router>
    );
}

export default App;
