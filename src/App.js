//React
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
//Redux
import { useSelector } from 'react-redux';
import {
  selectShowLanding,
  selectRemoveLanding,
} from './redux/reducers/landingSlice';
import { selectShowMap } from './redux/reducers/mapSlice';
//Components
import Landing from './components/Landing';
import Navbar from './components/NavBar';
import FilterBar from './components/FilterBar';
//Pages
import Explorer from './pages/Explorer';
import Login from './pages/Login';
import Signup from './pages/Signup';
//Styles
import './App.scss';

function App() {
  //Note: the landing component is not removed only hidden,
  //otherwise will cause error with event listeners in the Map component
  const showLanding = useSelector(selectShowLanding);
  const showMap = useSelector(selectShowMap);
  return (
    <div className="App">
      <Router>
        <Landing show={showLanding} />
        <Navbar show={showMap} />
        <FilterBar show={showMap} />
        <div className={`page-content ${showMap ? 'show' : 'hide'}`}>
          <Switch>
            <Route exact path="/" component={Explorer} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
