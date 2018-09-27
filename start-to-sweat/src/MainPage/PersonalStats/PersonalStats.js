import React, { Component } from 'react';
import { connect } from 'react-redux';
import Info from './Info/Info';

export class PersonalStats extends Component {
    constructor(props) {
        super(props);
        this.state={
            user:{}
        }
        this.saveUserInfo = this.saveUserInfo.bind(this);
    }
    render() {
        return (
            <Info user={this.state.user} save={this.saveUserInfo} onBack={this.props.onBack}/>
        )
    }
    componentDidMount(){
        fetch('http://localhost:8888/user/'+this.props.username)
        .then(res => { return res.json() })
        .then(user =>{
            this.setState({
                user: user
            })
        })
    }

    saveUserInfo(user){
        fetch(`http://localhost:8888/user`, {
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
