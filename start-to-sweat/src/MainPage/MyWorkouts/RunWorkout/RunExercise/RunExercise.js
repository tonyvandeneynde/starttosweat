import React, { Component } from 'react'
import RunAction from '../RunAction/RunAction';

export class RunExercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [],
      currentActionIndex: -1,
      timeLeft: 0
    }
    this.onNextAction = this.onNextAction.bind(this);
    this.decrementTimer = this.decrementTimer.bind(this);
    this.timer = { running: false, timeLeft: 0, intervalTrigger: {} }
  }

  componentDidMount() {
    fetch(`http://localhost:8888/actions`)
      .then(res => { return res.json() })
      .then(actionDefinitions => {
        const { actions } = this.props.exercise;
        const actionsWithParameters = actions.map(a => {
          let action = { name: a.name, parameters: [] };
          const definition = actionDefinitions.find(d => d.name === a.name);

          for (const key in definition) {
            if (definition.hasOwnProperty(key)) {
              if (typeof definition[key] === 'boolean' && definition[key] === true) {
                action.parameters[key] = a[key];
              }
            }
          }
          return action
        })
        if (actionsWithParameters[0].parameters.time) {
          actionsWithParameters.unshift({ name: 'initial', parameters: [] });
        }
        actionsWithParameters.push({name:'finished', parameters:[]});
        this.setState({
          actions: actionsWithParameters,
          currentActionIndex: 0
        });
      })
  }

  onNextAction() {
    const currentAction = this.state.actions[this.state.currentActionIndex + 1];
    if (currentAction) {
      let timeLeft = 0;
      this.stopTimer();
      if (currentAction.parameters.time) {
        timeLeft = getTimeInSeconds(currentAction.parameters.time);
        this.startTimer(timeLeft);
      }
      this.setState({
        timeLeft: timeLeft,
        currentActionIndex: this.state.currentActionIndex + 1
      })
    }
  }

  startTimer(time) {
    if (!this.timer.running) {
      this.timer.running = true;
      this.timer.timeLeft = time;
      this.timer.intervalTrigger = setInterval(this.decrementTimer, 1000);
    }
  }

  decrementTimer() {
    if (this.timer.timeLeft <= 1) {
      this.stopTimer();
      this.onNextAction();
    }
    else {
      this.timer.timeLeft--;
      this.setState({
        timeLeft: this.timer.timeLeft
      })
    }
  }

  stopTimer() {
    if (this.timer.running) {
      this.timer.running = false;
      clearInterval(this.timer.intervalTrigger);
      this.setState({
        timeLeft: 0
      })
    }
  }

  render() {
    const {onFinished} = this.props;
    const { name } = this.props.exercise;
    const { actions, currentActionIndex, timeLeft } = this.state;
    const currentAction = actions[currentActionIndex];
    const nextAction = actions[currentActionIndex + 1];
    let content = '';

    if (currentAction) {
      content = <RunAction exerciseName={name} name={currentAction.name} onNextAction={this.onNextAction} timeLeft={timeLeft} nextAction={nextAction} parameters={currentAction.parameters} onFinished={onFinished}/>
    }

    return (
      <div>
        {content}
      </div>
    )
  }
}

function getTimeInSeconds(time) {
  let seconds = time.slice(6, 8);
  let minutes = time.slice(3, 5);
  let hours = time.slice(0, 2);
  return Number(seconds) + Number(minutes) * 60 + Number(hours) * 3600;
}

export default RunExercise
