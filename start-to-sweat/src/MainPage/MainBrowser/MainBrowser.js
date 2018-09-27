import React, { Component } from 'react';
import './MainBrowser.css';
import BrowserButton from '../BrowserButton/BrowserButton';

class MainBrowser extends Component{
    render(){
        const {setRoute} = this.props;
        return(
            <div className='mainBrowser'>
                <div className='grid'>
                    <BrowserButton text='personal stats' onClick={() => setRoute('personal')}/>
                    <BrowserButton text='my workouts' onClick={() => setRoute('workouts')}/>
                    <BrowserButton text='my exercises' onClick={() => setRoute('exercises')}/>
                </div>
            </div>
        )
    }
}

export default MainBrowser;