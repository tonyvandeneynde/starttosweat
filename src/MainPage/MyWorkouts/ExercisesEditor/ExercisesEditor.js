import React, { Component } from 'react';
import ExercisesBrowser from '../ExercisesBrowser/ExercisesBrowser';
import { connect } from 'react-redux';
import './ExercisesEditor.css';
import ExerciseDetail from '../ExerciseDetail/ExerciseDetail';
import './ExercisesEditor.css';

const mapState = (state) => {
    return {
        userExercises: state.user.exercises,
    }
}

class ExercisesEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            browser: 'none',
            exercises: this.props.exercises,
        }
        this.setExercisesBrowser = this.setExercisesBrowser.bind(this);
        this.addExercise = this.addExercise.bind(this);
        this.onBack = this.onBack.bind(this);
    }

    componentWillReceiveProps(newProps) {
        this.setState({ exercises: newProps.exercises });
    }

    setExercisesBrowser(browser) {
        this.setState(Object.assign({}, this.state, { browser: browser }));
    }

    addExercise(exerciseId) {
        let exercises = this.state.exercises;
        const exerciseNumber = exercises.length + 1;
        exercises.push({ id: exerciseId, number: exerciseNumber });
        this.props.onAddExercise(exercises);
        this.setState({ browser: 'none' })
    }

    deleteExercise(numberToDelete) {
        let newNumber = 1;
        let exercises = this.state.exercises;
        exercises = exercises.filter(exercise => {
            if (exercise.number.toString() !== numberToDelete.toString()) {
                exercise.number = newNumber++;
                return true;
            }
            else {
                return false;
            }
        })
        console.log('exercises after delete', exercises)
        this.props.onAddExercise(exercises);
    }

    move(numberToMove, direction = 'up') {
        let exercises = this.state.exercises;
        let from, to;
        from = numberToMove - 1;
        if (direction === 'up') {
            to = from - 1;
        }
        else {
            to = from + 1;
        }

        if (to >= exercises.length || to < 0) {
            return
        }
        exercises = this.arrayMove(exercises, from, to);
        exercises = this.renumberExercises(exercises);
        this.props.onAddExercise(exercises);
    }

    renumberExercises(exercises) {
        const newExercise = exercises.map((exercise, i) => {
            exercise.number = i + 1;
            return exercise;
        })
        return newExercise;
    }

    arrayMove(arr, fromIndex, toIndex) {
        let element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
        return arr;
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

    goToExerciseDetail(exercise) {
        this.setState({
            exerciseDetail: exercise,
            browser: 'detail'
        })
        document.getElementsByTagName('body')[0].style.overflow='hidden';
    }

    onBack() {
        this.setState({
            exerciseDetail: null,
            browser: 'none'
        })
        document.getElementsByTagName('body')[0].style.overflow='unset';
    }

    render() {
        const { readOnly } = this.props;
        const { browser, exercises, exerciseDetail } = this.state;
        let exercisesList = '';

        if (exercises) {
            exercisesList = exercises.map((exerciseIdNumber, i) => {
                const { id, number } = exerciseIdNumber;
                const exercise = this.getExerciseById(id);
                const { name, duration } = exercise;
                let temptags = [];

                temptags.push(<div className='duration name' key='duration'>{duration}</div>)

                let className = 'actionSettings ' + name;
                return (
                    <div className={className} key={i}>
                        <div className='parameterContainer exerciseDetailButton' onClick={() => this.goToExerciseDetail(exercise)}>
                            <div className='name' key='name'>{name}</div>
                            {temptags}
                        </div>
                        {!readOnly &&
                            <div className='actionButtons'>
                                <div className='orderButtons'>
                                    <div className='move' onClick={() => this.move(number, 'up')}>
                                        up
                                </div>
                                    <div className='move' onClick={() => this.move(number, 'down')}>
                                        down
                                </div>
                                </div>
                                <div className='delete' onClick={() => this.deleteExercise(number)}>
                                    X
                            </div>
                            </div>
                        }

                    </div>);
            })
        }

        return (
            <div className='actionsEditor' >
                <div className='actionsTitle'>Exercises</div>
                <div>
                    <div>
                        {exercisesList}
                    </div>
                    {!readOnly &&
                        <button className='defaultButton' onClick={() => this.setExercisesBrowser('exercises')}>Add exercise</button>
                    }
                </div>
                {browser === 'exercises' &&
                    <div>
                        {<ExercisesBrowser onAddExercise={this.addExercise} onCancel={this.setExercisesBrowser} />}
                    </div>
                }
                {browser === 'detail' &&
                    <div className='background'>
                        <div className='actionsBrowser'>
                            <div className='detailContainer height98Percent'>
                                <ExerciseDetail exercise={exerciseDetail} onBack={this.onBack} addButton={false} />
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default connect(mapState)(ExercisesEditor);