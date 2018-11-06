import React, { Component } from 'react';
import './ActionDetail.css';

class ActionDetail extends Component {
    render() {
        const { action, buttons = true } = this.props;
        const muscleGroups = action.muscle_groups.map((muscle, i) => {
            if (i === 0) {
                return muscle;
            }
            else {
                return `, ${muscle}`
            }
        })
        const primaryMuscles = action.primary_muscles.map((muscle, i) => {
            if (i === 0) {
                return muscle;
            }
            else {
                return `, ${muscle}`
            }
        })
        const secondaryMuscles = action.secondary_muscles.map((muscle, i) => {
            if (i === 0) {
                return muscle;
            }
            else {
                return `, ${muscle}`
            }
        })
        return (
            <div className='actionDetail'>
                <div className='actionName'>
                    {buttons &&
                        <div className='detailButtons'>
                            <button className='btn-full' type='button' onClick={this.props.onAddAction}>add</button>
                            <button className='btn-full' type='button' onClick={this.props.onBack}>back</button>
                        </div>
                    }
                    <div className='actionNameText'>{action.name}</div>
                </div>
                <div className='actionInfoContainer'>
                    <div className='actionParameters'>
                        <div className='parameter'>
                            <div className='parameterName'>Muscle groups:</div>
                            <div className='parameterValue'>{muscleGroups}</div>
                        </div>
                        <div className='parameter'>
                            <div className='parameterName'>Primary muscles:</div>
                            <div className='parameterValue'>{primaryMuscles}</div>
                        </div>
                        <div className='parameter'>
                            <div className='parameterName'>Secondary muscles:</div>
                            <div className='parameterValue'>{secondaryMuscles}</div>
                        </div>
                        <div className='parameter'>
                            <div className='parameterName'>Description:</div>
                            <div className='parameterValue'>{action.description}</div>
                        </div>
                    </div>
                    <div className='actionImage'><img src={require(`./../../../images/${action.image}`)} alt='action.name' /></div>
                </div>
            </div>
        )
    }
}

export default ActionDetail;