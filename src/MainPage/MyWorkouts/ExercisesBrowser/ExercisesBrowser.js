import React, { Component } from 'react';
import BrowserButton from '../../BrowserButton/BrowserButton';
import { connect } from 'react-redux';
import ExerciseDetail from '../ExerciseDetail/ExerciseDetail';

const mapState = (state) => {
    return {
        exercises: state.user.exercises,
    }
}

class ExercisesBrowser extends Component {
    constructor(props){
        super(props);
        this.state = {
            route: 'main',
            currentExercise: null
        }
        this.removeDetail = this.removeDetail.bind(this);
    }

    setRoute(newRoute) {
        this.setState(Object.assign({}, this.state.route, { route: newRoute }));
    }

    goToExerciseDetail(exercise){
        this.setState({
            route: 'detail',
            currentExercise: exercise
        })
    }

    removeDetail(){
        this.setState({
            route: 'main',
            currentExercise: null
        })
    }

    render() {
        const { exercises } = this.props;
        const { route, currentExercise } = this.state;
        const filteredHtml = exercises.map((exercise, i) => {
            return <BrowserButton key={i} text={exercise.name} onClick={() => this.goToExerciseDetail(exercise)} />
        })

        return (
            <div className='background'>
                <div className='actionsBrowser'>
                    <div className='actionsFilters'>
                        <button className='defaultButton' onClick={this.props.onCancel}>Cancel</button>
                    </div>
                    <div className='detailContainer'>
                        {route === 'detail' ?
                            <ExerciseDetail exercise={currentExercise} onAddExercise={() => this.props.onAddExercise(currentExercise.id)} onBack={this.removeDetail} />
                            :
                            <div className='grid'>
                                {filteredHtml}
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(mapState)(ExercisesBrowser);