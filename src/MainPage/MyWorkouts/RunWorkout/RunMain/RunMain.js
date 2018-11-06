import React, { Component } from 'react'
import { connect } from 'react-redux'
import './RunMain.css';
import RunExercise from '../RunExercise/RunExercise';

export class RunMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subRoute: 'main',
            exercises: this.props.workout.exercises,
            exerciseToStart: null,
            numberToStart: 0
        }
        this.setSubRoute = this.setSubRoute.bind(this);
        this.onReset = this.onReset.bind(this);
    }

    resetExerciseStatusses(){
        let exercises = this.state.exercises;
        exercises = exercises.map(exercise => {
            exercise.status = 'not started';
            return exercise;
        })
        this.setState({
            exercises: exercises
        });
    }

    getExerciseById(id) {
        let returnExercise = null;
        this.props.userExercises.forEach(exercise => {
            if (exercise.id.toString() === id.toString()) {
                returnExercise = exercise;
            }
        });
        return returnExercise;
    }

    start(exercise, number) {
        this.setState({
            exerciseToStart: exercise,
            numberToStart: number,
            subRoute: 'runExercise',
        })
    }

    setSubRoute(newRoute){
        this.setState({
            subRoute: newRoute
        });
    }

    onFinished(){
        let workout = this.props.workout;
        let exercises = this.state.exercises;
        exercises = exercises.map(e => {
            if (e.number === this.state.numberToStart){
                e.finished = true;
            }
            return e;
        })
        workout.exercises = exercises;
        this.updateWorkout(workout);
    }

    updateWorkout(workout){
        const exercises = workout.exercises;
        fetch(`${process.env.REACT_APP_API_URL}/workout`, {
            method: 'put',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(workout)
        }).then(res => {
            this.setState({
                exercises: exercises,
                subRoute: 'main'
            }, ()=>{
                this.props.onUpdateWorkouts(workout);
            });
        })
    }

    onReset(){
        let workout = this.props.workout;
        let exercises = this.state.exercises;
        exercises = exercises.map(e => {
                e.finished = false;
            return e;
        })
        workout.exercises = exercises;
        this.updateWorkout(workout);
    }

    render() {
        const { workout, onCancel } = this.props;
        const { exercises, subRoute, exerciseToStart } = this.state;

        let exercisesList = '';

        if (exercises) {
            exercisesList = exercises.map((exerciseIdNumberStatus, i) => {
                const { id, finished, number } = exerciseIdNumberStatus;
                const exercise = this.getExerciseById(id);
                const { name, duration } = exercise;
                let temptags = [];
                temptags.push(<div className='name exerciseProperty' key='name'>{name}</div>)
                temptags.push(<div className='duration exerciseProperty' key='duration'>{duration}</div>)
                if (!finished) {
                    temptags.push(<button className='buttonStartExercise status' key='status' onClick={() => this.start(exercise, number)}>start</button>)
                }
                if (finished){
                    temptags.push(<div className='status' key='status'>Finished</div>)
                }

                let status = '';
                if (finished){
                    status = 'finished';
                }
                let className = 'exercisePil ' + name + ' ' + status;
                return <div className={className} key={i}>
                    <div className='exerciseProperties'>
                        {temptags}
                    </div>
                </div>;
            })
        }
        return (
            <div className='RunMain fullHeight'>
                {subRoute === 'main' &&

                    <div>
                        <div className='cancelButtonContainer'>
                            <button className='defaultButton' onClick={onCancel}>back</button>
                            <button className='defaultButton' onClick={this.onReset}>reset</button>
                        </div>
                        <div className='title'>{workout.name}</div>
                        <div className='exercises'>
                            {exercisesList}
                        </div>
                    </div>
                }
                {subRoute === 'runExercise' &&
                    <div>
                        <div className='cancelButtonContainer'>
                            <button className='defaultButton' onClick={() => this.setSubRoute('main')}>cancel</button>
                        </div>
                        <RunExercise exercise={exerciseToStart} onFinished={() => this.onFinished()}/>
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    userExercises: state.user.exercises
})

export default connect(mapStateToProps)(RunMain)
