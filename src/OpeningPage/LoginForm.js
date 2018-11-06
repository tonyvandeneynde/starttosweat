import React, { Component } from 'react';
import './LoginForm.css';

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        }
        this.onLogin = this.onLogin.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        })
    }

    onLogin() {
        console.log('on login');
        fetch(`$https://mysterious-shelf-79717.herokuapp.com/login`, {
            method: 'post',
            headers: {
                'content-type': 'text/plain',
            },
            body: JSON.stringify({ username: this.state.username, password: this.state.password })
        }).then((res, err)=>{
            if (res.ok) {
                this.props.onLoggedIn(this.state.username);
            }
            else{
                window.alert('foute email of paswoord');
            }
        })
    }

    render() {
        return (
            <main className='loginform'>
                <form >
                    <fieldset id="sign_up">
                        <div className='legend'>Sign In</div>
                        <div className='credentials'>
                            <label htmlFor="email-address">Email</label>
                            <input
                                type="username"
                                name="username"
                                id="username"
                                autoComplete='username'
                                onChange={this.handleInputChange}
                            />
                        </div>
                        <div className='credentials'>
                            <label htmlFor="password">Password</label>
                            <input
                                className='alignRight'
                                type="password"
                                name="password"
                                id="password"
                                autoComplete='current-password'
                                onChange={this.handleInputChange}
                            />
                        </div>
                    </fieldset>
                    <div className='toCenter'>
                        <input className='btn-full signinButton' onClick={this.onLogin} type="button" value="Sign in" />
                        <input className='btn-empty signinButton' onClick={this.props.onCancel} type="button" value="Cancel" />
                    </div>
                    <div className='toRight'>
                        <div className='links' onClick={() => {this.props.onregister()}}>Sign up</div>
                    </div>
                </form>
            </main>
        );
    }
}

export default LoginForm;