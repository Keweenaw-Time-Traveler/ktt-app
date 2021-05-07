//React
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
//Redux
import { useDispatch } from 'react-redux';
import { loadMarkersAsync } from './redux/reducers/markersSlice';
//Components
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
  return (
    <div className="App">
      <Router>
        <Navbar />
        <FilterBar />
        <div className="page-content">
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
