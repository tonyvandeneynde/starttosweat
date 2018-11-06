import React, { Component } from 'react'
import BrowserButton from '../BrowserButton/BrowserButton';
import { connect } from 'react-redux';
import { setWorkouts } from '../../Actions/index';
import NewWorkout from './NewWorkout/NewWorkout';
import RunMain from './RunWorkout/RunMain/RunMain';
import './MyWorkouts.css';

const mapState = (state) => {
  return {
    workouts: state.user.workouts
  }
}

const mapDispatch = (dispatch) => {
  return {
    setWorkouts: (workouts) => {
      dispatch(setWorkouts(workouts))
    }
  }
}

class MyWorkouts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subRoute: 'main',
      currentWorkout: {}
    }
    this.addWorkout = this.addWorkout.bind(this);
    this.updateWorkout = this.updateWorkout.bind(this);
  }

  addWorkout(workout) {
    let workouts = this.props.workouts;
    const workoutIndex = workouts.findIndex(w => w.id === workout.id);
    if (workoutIndex > -1) {
      workouts.splice(workoutIndex, 1);
    }
    workouts.push(workout);
    this.updateWorkouts(workouts);
  }

  deleteWorkout(workoutId) {
    let workouts = this.props.workouts;
    workouts = workouts.filter(workout => {
      if (workoutId !== workout.id) {
        return true;
      }
      return false;
    })
    this.updateWorkouts(workouts);
    this.setState({
      subRoute: 'main',
      currentWorkout: {}
    });
  }

  updateWorkout(workout){
    let workouts = this.props.workouts;
    workouts = workouts.map(w=>{
      if(workout.id === w.id && workout.number === w.number){
        return workout;
      }
      else{
        return w;
      }
    })
    this.updateWorkouts(workouts);
  }

  updateWorkouts(workouts) {
    this.props.setWorkouts(workouts);
    this.forceUpdate();
  }

  setSubRoute(newRoute) {
    this.setState(Object.assign({}, this.state, { subRoute: newRoute }));
  }

  setWorkoutDetail(workout) {
    this.setState({
      subRoute: 'workoutDetail',
      currentWorkout: workout
    })
  }

  render() {
    const { subRoute, currentWorkout } = this.state;
    const { workouts, onBack } = this.props;
    let backgroundColor = '';
    let workoutsJsx = '';

    if (workouts!==undefined){
      workoutsJsx = workouts.map((workout, i) => {
        return <BrowserButton key={i} text={workout.name} onClick={() => this.setWorkoutDetail(workout)} />
      })
    }

    if (subRoute === 'runWorkout') {
      backgroundColor = 'dark';
    }
    return (
      <div className={'workoutsContainer ' + backgroundColor}>
        <div className='workouts'>
          {subRoute === 'main' &&
            <div>
              <button className='backButton defaultButton' onClick={onBack}>back</button>
              <div className='grid'>
                <BrowserButton text='add new workout' onClick={() => this.setSubRoute('newWorkout')} full={false} />
                {workoutsJsx}
              </div>
            </div>
          }
          {subRoute === 'newWorkout' &&
            <NewWorkout title='Add Workout' 
            workout={{ exercises: [] }}
            updateWorkouts={this.addWorkout}
            onCancel={() => this.setSubRoute('main')}
            readOnly={false}
            />
          }
          {subRoute === 'workoutDetail' &&
            <NewWorkout
              title='Workout'
              workout={currentWorkout}
              updateWorkouts={this.addWorkout}
              onWorkoutDeleted={() => this.deleteWorkout(currentWorkout.id)}
              onCancel={() => this.setSubRoute('main')}
              onStartWorkout={() => this.setSubRoute('runWorkout')}
              readOnly={true} />
          }
          {subRoute === 'runWorkout' &&
            <RunMain workout={currentWorkout} onCancel={() => this.setSubRoute('main')} onUpdateWorkouts={this.updateWorkout}/>
          }
        </div>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(MyWorkouts);