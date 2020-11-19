import React, { useEffect, useState } from 'react';
import './App.css';
import { NavLink, Redirect, Route, Router, Switch, Link } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import { createBrowserHistory } from 'history';
import firebase from 'firebase/app';
import NewPost from './NewPost';
import RoomList from './RoomList';
import Settings from './Settings';
import { User } from './types';
import Login from './Login';
import useWindowSize from './useWindowSize';
import Instance from './Instance';

const history = createBrowserHistory();

function App() {
    const { width } = useWindowSize();
    const [user, setUser] = useState<User>();
    const [userDocId, setUserDocId] = useState<string>();
    document.title = "Fast LFG";

    useEffect(() => {
        firebase.auth().onAuthStateChanged(u => {
            if (u) {
                const collection = firebase.firestore().collection('users');
                collection.doc(u.uid).get().then(s => {
                    const user: User = {
                        uid: u.uid,
                        displayName: u.displayName,
                        games: [],
                        blockedPlayers: [],
                        ...s.data()
                    };

                    setUser(user);
                });
            } else {
                setUser(undefined);
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
            <Link to="/list">
                <Navbar.Brand className="text-white">Fast LFG</Navbar.Brand>
            </Link>
            <Nav variant="pills">
                <Nav.Item>
                    <Nav.Link as={NavLink} to='/list' activeClassName="active">
                        List
                        </Nav.Link>
                </Nav.Item>
                {user ?
                    <>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to='/new-post' activeClassName="active">
                                Post New
                        </Nav.Link>
                        </Nav.Item>
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
                            {user &&
                                <NewPost user={user} />
                            }
                        </Route>
                        <Route path='/instance/:id'>
                            <Instance user={user} />
                        </Route>
                        <Route path='/settings'>
                            {user &&
                                <Settings user={user} docId={userDocId} />
                            }
                        </Route>
                        <Route path='/login'>
                            <Login setDocId={setUserDocId} />
                        </Route>
                    </Switch>
                </main>
            </div>
        </Router>
    );
}

export default App;
