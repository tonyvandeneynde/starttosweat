import React, { Component } from 'react';
import Navbar from './Navbar/Navbar';
import MainBrowser from './MainBrowser/MainBrowser';
import MyExercises from './MyExercises/MyExercises';
import MyWorkouts from './MyWorkouts/MyWorkouts';
import './MainPage.css';
import { connect } from 'react-redux';
import { setExercises, setWorkouts} from '../Actions/index';
import PersonalStats from './PersonalStats/PersonalStats';

const mapState = (state) => {
    return {
        username: state.user.username,
        exercises: state.user.exercises
    }
}

const mapDispatch = (dispatch) => {
    return {
        setExercises: (exercises) => {
            dispatch(setExercises(exercises))
        },
        setWorkouts: (workouts)=> {
            dispatch(setWorkouts(workouts))
        }
    }
}

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            route: 'mainBrowser',
            previousRoute: 'mainBrowser'
        }
        this.setRoute = this.setRoute.bind(this);
    }

    componentDidMount(){
        console.log('componentDidMount')
        fetch(`http://localhost:8888/exercises/${this.props.username}`)
        .then(res => { return res.json() })
        .then(exercises => {
            this.props.setExercises(exercises);
            this.forceUpdate();
        })
        fetch(`http://localhost:8888/workouts/${this.props.username}`)
        .then(res => { return res.json() })
        .then(workouts => {
            this.props.setWorkouts(workouts);
            this.forceUpdate();
        })
    }

    setRoute(newRoute) {
        const previousRoute = this.state.previousRoute;
        this.setState(Object.assign({}, this.state, { route: newRoute, previousRoute: previousRoute }));
    }

    render() {
        const { username } = this.props;
        const {route} = this.state;
        return (
            <div className='mainPage'>
                <Navbar username={username} />
                {
                    route === 'mainBrowser' &&
                    <MainBrowser setRoute={this.setRoute}/>
                }
                {
                    route === 'exercises' &&
                    <MyExercises setRoute={this.setRoute} onBack={()=> this.setRoute('mainBrowser')}/>
                }
                {
                    route === 'workouts' &&
                    <MyWorkouts setRoute={this.setRoute} onBack={()=> this.setRoute('mainBrowser')}/>
                }
                {
                    route === 'personal' &&
                    <PersonalStats onBack={()=> this.setRoute('mainBrowser')}/>
                }
            </div>
        )
    }
}

export default connect(mapState, mapDispatch)(MainPage);