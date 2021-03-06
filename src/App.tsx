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
    document.title = "Quick LFG";

    useEffect(() => {
        firebase.auth().onAuthStateChanged(u => {
            if (u) {
                const collection = firebase.firestore().collection('users');
                collection.doc(u.uid).onSnapshot(s => {
                    const theUser: User = s.data() as User;
                    setUser(theUser);
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
                <Navbar.Brand className="text-white">Quick LFG</Navbar.Brand>
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
                                Post
                        </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to='/settings' activeClassName="active">
                                Settings
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
                            <Instance />
                        </Route>
                        <Route path='/settings'>
                            {user &&
                                <Settings user={user} />
                            }
                        </Route>
                        <Route path='/login'>
                            <Login />
                        </Route>
                    </Switch>
                </main>
            </div>
        </Router>
    );
}

export default App;
