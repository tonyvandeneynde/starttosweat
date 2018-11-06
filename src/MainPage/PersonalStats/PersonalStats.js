import React, { Component } from 'react';
import { connect } from 'react-redux';
import Info from './Info/Info';

export class PersonalStats extends Component {
    constructor(props) {
        super(props);
        this.state={
            user:{},
            userLoaded:false
        }
        this.saveUserInfo = this.saveUserInfo.bind(this);
    }
    render() {
        console.log(this.state.userLoaded)
        return (
            <div>
            {this.state.userLoaded &&
                <Info user={this.state.user} save={this.saveUserInfo} onBack={this.props.onBack}/>
            }
            </div>
        )
    }
    componentDidMount(){
        fetch(`https://mysterious-shelf-79717.herokuapp.com/user/`+this.props.username)
        .then(res => { return res.json() })
        .then(user =>{
            this.setState({
                user: user,
                userLoaded:true
            })
        })
    }

    saveUserInfo(user){
        fetch(`https://mysterious-shelf-79717.herokuapp.com/user`, {
            method: 'put',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(user)
        }).then(res => {return res.json()})
        .then(user => {
            this.setState({
                user:user
            })
        })
    }
}

const mapStateToProps = (state) => ({
    username: state.user.username,
})

export default connect(mapStateToProps)(PersonalStats)
