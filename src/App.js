import React, { Component } from 'react';
import './App.css';
import { connect } from 'react-redux';
import OpeningPage from './OpeningPage/OpeningPage';
import MainPage from './MainPage/MainPage';

const mapState = (state) => {
  return {
    loggedIn: state.user.loggedIn
  }
}

class App extends Component {
  render() {
    const { loggedIn } = this.props;
    return (
      <div className="App">
        <header className="App-header">
        </header>
        {!loggedIn &&
          <OpeningPage />
        }
        {loggedIn &&
          <MainPage />
        }
      </div>
    );
  }
}

export default connect(mapState)(App);
