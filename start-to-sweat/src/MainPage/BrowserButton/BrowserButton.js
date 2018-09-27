import React, { Component } from 'react';
import './BrowserButton.css';

class BrowserButton extends Component{
    render(){
        const {text, onClick, full=true, image=null} = this.props;

        const className = full ? 'browserButton full' : 'browserButton'
        return(
            <div className={className} onClick={onClick}>
                <div className='browserButton-container'>
                {image &&
                    <img src={require( `./../../images/${image}`)} alt={text}/>
                }
                {text && 
                    text
                }
                </div>
            </div>
        )
    }
}

export default BrowserButton;