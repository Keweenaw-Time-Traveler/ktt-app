import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';

//Components
import Navbar from './components/NavBar';

//Pages
import clusters from './pages/home';
import heatmap from './pages/heatmap';
import simon from './pages/simon';
import login from './pages/login';
import signup from './pages/signup';
import markers from './pages/markers';
import rest from './pages/rest';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <div className="container">
          <Switch>
            <Route exact path="/" component={markers} />
            <Route exact path="/rest" component={rest} />
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
