import React, { Component } from 'react';
import './RunAction.css';

export default class RunAction extends Component {   
    constructor(props) {
        super(props);
        this.timeRunningOut = '';
    }

    formatTime(timeInSeconds){
        let date = new Date(null);
        date.setSeconds(timeInSeconds);
        return date.toISOString().substr(11, 8);
    }

    render() {
        const { name, timeLeft, onNextAction, exerciseName, parameters, nextAction, onFinished } = this.props;
        let params = parameters;
        let parametersHtml = [];
        if ((name === 'rest' || name==='initial') && nextAction) {
            params = nextAction.parameters;
        }
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const parameterValue = params[key];
                parametersHtml.push(<div className='raParameters' key={key}><div>{key}</div><div>{parameterValue}</div></div>)
            }
        }
        
        if (timeLeft <= 5 && name !== 'initial'){
            if (this.timeRunningOut === ' timeRunningOut'){
                this.timeRunningOut = ' timeRunningOut2'
            }
            else{
                this.timeRunningOut = ' timeRunningOut'
            }
        }
        else{
            this.timeRunningOut = ''
        }

        const formattedTime = this.formatTime(timeLeft);
        console.log(formattedTime);

        return (
            <div className={'runAction ra' + name + this.timeRunningOut}>
                <div className='raExName'>{exerciseName}</div>
                <div className='raName'>{name}</div>

                {(name === 'rest') ?
                    <div>
                        {(timeLeft !== 0) &&
                            <div className='raTimer'>{formattedTime}</div>
                        }
                        {nextAction &&
                            <div className='raNextUp'>
                                <div className='raNextUpLabel'>Next up</div>
                                <div className='raName'>{nextAction.name}</div>
                                <div>{parametersHtml}</div>
                            </div>
                        }

                    </div>
                    :
                    <div>
                        {(name === 'finished') &&
                            <div className='raParameters'><div>Congradulations!<br/>You have finished your exercise</div></div>
                        }
                        {(name === 'initial' && nextAction) ?
                            <div className='raNextUp'>
                                <div className='raNextUpLabel'>Next up</div>
                                <div className='raName'>{nextAction.name}</div>
                                <div>{parametersHtml}</div>
                            </div>
                            :
                            <div>
                                {parametersHtml}
                                {(timeLeft !== 0) &&
                                    <div className='raTimer'>{formattedTime}</div>
                                }
                            </div>
                        }
                    </div>

                }

                {nextAction ?
                    <button className='defaultButton' onClick={onNextAction}>continue</button>
                    :
                    <button className='defaultButton' onClick={onFinished}>back</button>
                }

            </div>
        )
    }
}
