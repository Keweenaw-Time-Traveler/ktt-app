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
import clusters from './pages/home';
import heatmap from './pages/heatmap';
import simon from './pages/simon';
import login from './pages/login';
import signup from './pages/signup';
import markers from './pages/markers';
import Rest from './pages/rest';
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
            <Route exact path="/" component={Rest} />
            <Route exact path="/feature-service" component={markers} />
            <Route exact path="/heatmap" component={heatmap} />
            <Route exact path="/clusters" component={clusters} />
            <Route exact path="/simon" component={simon} />
            <Route exact path="/login" component={login} />
            <Route exact path="/signup" component={signup} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
