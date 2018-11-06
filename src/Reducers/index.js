import { combineReducers } from 'redux'

const initialStateUser = {
  userName: '',
  loggedIn: false,
  exercises: [],
  workouts: []
}

function user(state = initialStateUser, action = {}) {
  console.log(action);
  switch (action.type) {
    case 'LOGIN':
      return Object.assign({}, state, {
        username: action.username,
        loggedIn: true
      });
    case 'LOGOUT':
      return Object.assign({}, state, { userName: '', loggedIn: false });
    case 'SET_EXERCISES':
      return Object.assign({}, state, { exercises: action.exercises });
    case 'SET_WORKOUTS':
      return Object.assign({}, state, { workouts: action.workouts });
    default:
      return state;
  }
}

const reducers = combineReducers({
  user
})

export default reducers;