import React, { Component } from 'react';
import BrowserButton from '../BrowserButton/BrowserButton';
import NewExercise from './NewExercise/NewExercise';
import { connect } from 'react-redux';
import { setExercises } from '../../Actions/index';
import './MyExercises.css';

const mapState = (state) => {
    return {
        exercises: state.user.exercises
    }
}

const mapDispatch = (dispatch) => {
    return {
        setExercises: (exercises) => {
            dispatch(setExercises(exercises))
        }
    }
}

class MyExercises extends Component {
    constructor() {
        super();
        this.state = {
            subRoute: 'main',
            currentExercise: {}
        }
        this.updateExercises = this.updateExercises.bind(this);
    }

    setSubRoute(newRoute) {
        this.setState(Object.assign({}, this.state, { subRoute: newRoute }));
    }

    goToDetail(exercise) {
        this.setState(Object.assign({}, this.state, {
            subRoute: 'exerciseDetail',
            currentExercise: exercise
        }))
    }

    updateExercises(exerciseToUpdate, deleteExercise = false) {
        let exercises = this.props.exercises;
        let exerciseIndex = exercises.findIndex(e => e.id === exerciseToUpdate.id);

        if (deleteExercise) {
            exercises.splice(exerciseIndex, 1);
        }
        else {
            if (exerciseIndex === -1) {
                exercises.push(exerciseToUpdate);
            }
            else {
                exercises[exerciseIndex] = exerciseToUpdate;
            }
        }
        this.props.setExercises(exercises);
        this.setSubRoute('main');
    }

    render() {
        const { subRoute, currentExercise } = this.state;
        const { exercises, onBack } = this.props;
        let exerciseJsx = [];

        if (exercises) {
            exerciseJsx = exercises.map((exercise, i) => {
                return <BrowserButton key={i} text={exercise.name} onClick={() => this.goToDetail(exercise)} />
            })
        }
        return (
            <div className='exercises'>
                {subRoute === 'main' &&
                    <div>
                        <button className='backButton defaultButton' onClick={onBack}>back</button>
                        <div className='grid'>

                            <BrowserButton text='add new exercise' onClick={() => this.setSubRoute('newExercise')} full={false}/>
                            {exerciseJsx}
                        </div>
                    </div>
                }
                {subRoute === 'newExercise' &&
                    <NewExercise title='Add Exercise' exercise={{}} updateExercises={this.updateExercises} onCancel={() => this.setSubRoute('main')} readOnly={false}/>
                }
                {subRoute === 'exerciseDetail' &&
                    <NewExercise title='Exercise' exercise={currentExercise} updateExercises={this.updateExercises} onCancel={() => this.setSubRoute('main')} readOnly={true}/>
                }
            </div>
        )
    }
}

export default connect(mapState, mapDispatch)(MyExercises);