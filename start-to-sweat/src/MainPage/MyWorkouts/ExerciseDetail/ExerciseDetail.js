import React, { Component } from 'react';
import './ExerciseDetail.css';
import ActionsTable from '../ActionsTable/ActionsTable';

class ExerciseDetail extends Component {
    render() {
        const { exercise, onBack, onAddExercise, addButton=true} = this.props;
        const { name = '', type = '', duration = '00:00:00', actions = null } = exercise;
        return (
            <div className='exerciseDetail' >
                <form className='alignLeft'>
                <div className='exerciseButtons'>
                {addButton &&
                    <button className='defaultButton' onClick={onAddExercise}>Add exercise</button>
                }
                    <button type='button' className='defaultButton' onClick={onBack}>Back</button>
                </div>
                    <div>Name</div>
                    <div className='margin20'>{name}</div>
                    <div>Type</div>
                    <div className='margin20'>{type}</div>
                    <div>Duration</div>
                    <div className='margin20'>{duration}</div>
                    {<ActionsTable actions={actions} />}
                </form>
            </div>
        )
    }
}

export default ExerciseDetail;