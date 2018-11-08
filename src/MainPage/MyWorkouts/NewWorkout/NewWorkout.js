import React, { Component } from 'react';
import './NewWorkout.css';
import { connect } from 'react-redux';
import ExercisesEditor from '../ExercisesEditor/ExercisesEditor';

const mapState = (state) => {
    return {
        username: state.user.username,
        userExercises: state.user.exercises
    }
}

class NewWorkout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            workout: JSON.parse(JSON.stringify(this.props.workout)),
            readOnly: this.props.readOnly,
            title: this.props.title
        }
        this.updateExercises = this.updateExercises.bind(this);
        this.saveWorkout = this.saveWorkout.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
    }

    onValueChange(evt) {
        const value = evt.target.value;
        const name = evt.target.name;

        this.setState({
            workout: Object.assign({}, this.state.workout, {
                [name]: value
            })
        })

    }

    updateExercises(exercises) {
        this.setState({ workout: Object.assign({}, this.state.workout, { exercises: exercises }) }, this.forceUpdate());
    }

    saveWorkout() {
        const workout = this.state.workout;
        const username = this.props.username;

        if (workout.exercises.length === 0) {
            alert('add at least one exercise');
            return;
        }

        let method = 'put';
        if (!workout.id) {
            workout.owner = username;
            method = 'post'
        }
        fetch(`https://mysterious-shelf-79717.herokuapp.com/workout`, {
            method: method,
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(workout)
        }).then(res => {
            if (res.ok) {
                window.alert('workout saved');
                return res.json();
            }
            else {
                window.alert('there was a problem saving your workout')
                return false;
            }
        }).then(res => {
            this.props.onCancel();
            if (res) {
                this.props.updateWorkouts(res);
            }
        })
    }

    onDelete() {
        const workoutId = this.state.workout.id;
        fetch(`https://mysterious-shelf-79717.herokuapp.com/workout/${workoutId}`, {
            method: 'delete',
            headers: {
                'content-type': 'application/json',
            }
        }).then(res => {
            if (res.ok) {
                window.alert('workout deleted');
                return true;
            }
            else {
                window.alert('there was a problem deleting your workout')
                return false;
            }
        }).then(res => {
            if (res) {
                this.props.onWorkoutDeleted();
            }
        })
    }

    onCancel() {
        this.setState({
            workout: this.props.workout
        }, () => {
            this.props.onCancel()
        })
    }

    toggleEdit() {
        if (this.state.readOnly) {
            this.setState({
                readOnly: false,
                title: 'Edit workout'
            });
        }
        else {
            this.setState({
                readOnly: true,
                workout: JSON.parse(JSON.stringify(this.props.workout)),
                title: 'Workout'
            })
        }
    }

    render() {
        const { onStartWorkout, userExercises} = this.props;
        const { readOnly, title } = this.state;
        const { id = null, name = '', exercises } = this.state.workout;
        const duration = this.state.workout.duration ? this.state.workout.duration : '00:00:00';
        return (
            <div className='newExercise' >
                {userExercises.length === 0 ?
                    <div>
                        <div>First create exercises before creating a workout</div>
                        <button className='defaultButton' onClick={this.onCancel}>Back</button>
                    </div>
                    :
                    <div>
                        {id ?
                            <div>
                                {readOnly ?
                                    (<div className='buttonGroup'>
                                        <button className='defaultButton' onClick={onStartWorkout}>Start</button>
                                        <button className='defaultButton' onClick={this.toggleEdit}>Edit</button>
                                        <button className='defaultButton' onClick={this.onCancel}>Back</button>
                                    </div>)
                                    :
                                    (<div className='buttonGroup'>
                                        <button className='defaultButton' onClick={this.saveWorkout}>Save</button>
                                        <button className='defaultButton' onClick={this.toggleEdit}>cancel</button>
                                        <button className='defaultButton deleteExerciseButton' onClick={this.onDelete}>Delete</button>
                                    </div>)
                                }
                            </div>
                            :
                            <div>
                                <button className='defaultButton' onClick={this.saveWorkout}>Save</button>
                                <button className='defaultButton' onClick={this.onCancel}>Cancel</button>
                            </div>
                        }
                        <div className='titleBar'>
                            <div className='title'>{title}</div>
                        </div>
                        <div className='alignLeft'>
                            <div className='detailContainer'>
                                <div>Name</div>
                                {readOnly ?
                                    <div className='margin20'>{name}</div>
                                    :
                                    <input className='margin20' name='name' value={name} onChange={this.onValueChange}></input>
                                }
                            </div>
                            <div className='detailContainer'>
                                <div>Duration</div>
                                {readOnly ?
                                    <div className='margin20' name='duration'>{duration}</div>
                                    :
                                    <input className='margin20' name='duration' type='time' value={duration} onChange={this.onValueChange} />
                                }
                            </div>
                        </div>
                        <ExercisesEditor exercises={exercises} onAddExercise={this.updateExercises} readOnly={this.state.readOnly} />
                    </div>
                }
            </div>
        )
    }
}

export default connect(mapState)(NewWorkout);