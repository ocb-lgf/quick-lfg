import React, { useEffect, useState } from 'react';
import './App.css';
import { NavLink, Redirect, Route, Router, Switch } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import { createBrowserHistory } from 'history';
import firebase from 'firebase/app';

import NewPost from './NewPost';
import RoomList from './RoomList';
import Settings from './Settings';
import { User } from './types';
import Login from './Login';
import useWindowSize from './useWindowSize';

const history = createBrowserHistory();

function App() {
    const [user, setUser] = useState<User>();
    const [docId, setDocId] = useState<string>();
    const { width } = useWindowSize();

    useEffect(() => {
        firebase.auth().onAuthStateChanged(u => {
            if (u) {
                const collection = firebase.firestore().collection('users');
                collection.where('uid', '==', u.uid).get()
                    .then(qSnapshot => {
                        qSnapshot.forEach(doc => {
                            const id = doc.id;
                            setDocId(id);
                            const user: User = {
                                uid: u.uid,
                                ...doc.data()
                            };
                            setUser(user);
                        });
                    });
            }
            else {
                setUser(undefined);
                history.push('/');
            }
        });
    }, []);

    const navBar = (
        <Navbar
            fixed={width > 576 ? 'top' : 'bottom'}
            sticky={width > 576 ? 'top' : 'bottom'}
            bg="dark"
            variant="dark"
            className="justify-content-center">
            <Navbar.Brand className="text-white" >LFG</Navbar.Brand>
            <Nav variant="pills">
                <Nav.Item>
                    <Nav.Link as={NavLink} to='/list' activeClassName="active">
                        List
                        </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to='/new-post' activeClassName="active">
                        Room
                        </Nav.Link>
                </Nav.Item>
                {user ?
                    <>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to='/settings' activeClassName="active">
                                Settings
                        </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link onClick={() => firebase.auth().signOut()}>
                                Log out
                        </Nav.Link>
                        </Nav.Item>
                    </>
                    :
                    <Nav.Item>
                        <Nav.Link as={NavLink} to='/login' activeClassName="active">
                            Log in
                        </Nav.Link>
                    </Nav.Item>
                }
            </Nav>
        </Navbar>
    );

    return (
        <Router history={history}>
            <div className="App">
                {navBar}
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
