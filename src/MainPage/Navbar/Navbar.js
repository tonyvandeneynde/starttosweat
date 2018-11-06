import React, { Component } from 'react';
import './Navbar.css';

class Navbar extends Component{
    render(){
        const {username} = this.props;
        return (
            <div className='navbar'>
                {username}
            </div>
        )
    }
}

export default Navbar;