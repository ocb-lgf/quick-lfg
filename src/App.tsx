import React from 'react';
import './App.css';
import { NavLink, Redirect, Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import NewPost from './NewPost';
import RoomList from './RoomList';

function App() {
  const history = createBrowserHistory();
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
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
