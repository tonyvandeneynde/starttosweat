import React, { Component } from 'react';
import './LoginForm.css';

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        }
        this.updateUsername = this.updateUsername.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.onRegister = this.onRegister.bind(this);
    }
    updateUsername(e) {
        this.setState({
            username: e.target.value
        }
        )
    }
    updatePassword(e) {
        this.setState({
            password: e.target.value
        }
        )
    }

    onRegister() {
        fetch('http://localhost:8888/user', {
            method: 'post',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ username: this.state.username, password: this.state.password })
        }).then((res) => {
            if (res.ok) {
                this.props.onRegistered();
            }
        })
    }

    render() {
        return (
            <main className='loginform'>
                <form>
                    <fieldset id="register">
                        <div className='legend'>Register</div>
                        <div className='credentials'>
                            <label htmlFor="username">Username</label>
                            <input
                                type="username"
                                name="username"
                                id="username"
                                autoComplete='username'
                                onChange={this.updateUsername}
                            />
                        </div>
                        <div className='credentials'>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                autoComplete='current-password'
                                onChange={this.updatePassword}
                            />
                        </div>
                    </fieldset>
                    <div className="toCenter">
                        <input className='btn-full' onClick={this.onRegister} type="button" value="Register" />
                        <input className='btn-empty' onClick={this.props.onCancel} type="button" value="Cancel" />
                    </div>
                </form>
            </main>
        );
    }
}

export default Register;