export const logIn = username => (
  {
    type: 'LOGIN',
    username: username
  })

export const logOut = () => (
  {
    type: 'LOGOUT'
  })

export const setCurrentExercise = () => (
  {
    type: 'SET_CURRENT_EXERCISE'
  }
)

export const setExercises = exercises => (
  {
    type: 'SET_EXERCISES',
    exercises: exercises
  }
)

export const setWorkouts = workouts => (
  {
    type: 'SET_WORKOUTS',
    workouts: workouts
  }
)