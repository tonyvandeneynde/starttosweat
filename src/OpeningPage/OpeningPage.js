import React, { Component } from 'react';
import LoginForm from './LoginForm';
import Register from './Register';
import { logIn } from '../Actions/index';
import { connect } from 'react-redux';
import './OpeningPage.css';

const mapState = (state) => {
    return {
        username: state.user.username
    }
}

const mapDispatch = (dispatch) => {
    return {
        logIn: (username) => {
            dispatch(logIn(username))
        }
    }
}

class OpeningPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            route: 'openingPage'
        }
    }

    setRoute = (newRoute) => {
        this.setState(Object.assign({}, this.state, { route: newRoute }));
    }

    onLoggedIn = (username) => {
        this.props.logIn(username);
    }

    render() {
        const { route } = this.state;
        return (
            <div className='backgroundBlack'>
                <div className='openingPage'>
                    {route === 'openingPage' &&
                        <section className='title-container'>
                            <h1 className='title'>
                                Good things come to those who<br />SWEAT!
                    </h1>
                            <button onClick={() => this.setRoute('signInPage')} className='btn-full'>
                                Sign in
                     </button>
                        </section>
                    }
                    {route === 'signInPage' &&
                        <LoginForm
                            onLoggedIn={this.onLoggedIn}
                            onCancel={() => this.setRoute('openingPage')}
                            onregister={() => this.setRoute('register')}
                        />
                    }
                    {route === 'register' &&
                        <Register onRegistered={() => this.setRoute('signInPage')} onCancel={() => this.setRoute('signInPage')} />
                    }
                </div>
            </div>
        )
    }
}

export default connect(mapState, mapDispatch)(OpeningPage);