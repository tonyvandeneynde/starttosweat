import React, { Component } from 'react';
import './ActionsEditor.css';
import ActionsBrowser from '../../ActionsBrowser/ActionsBrowser';
import ActionParameter from '../../ActionParameter/ActionParameter';
import ActionDetail from '../../ActionDetail/ActionDetail';

class ActionsEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            browser: 'none',
            actions: this.props.actions,
            actionDefinitions: null,
            actionDetail:null
        }
        this.handleActionParameterChange = this.handleActionParameterChange.bind(this);
        this.addAction = this.addAction.bind(this);
        this.setActionBrowser = this.setActionBrowser.bind(this);
        this.removeDetail = this.removeDetail.bind(this);
    }

    componentDidMount() {
        fetch(`${process.env.REACT_APP_API_URL}/actions`)
            .then(res => { return res.json() })
            .then(actionDefinitions => {
                this.setState(Object.assign({}, this.state, { actionDefinitions: actionDefinitions }))
            })
    }

    componentWillReceiveProps(newProps) {
        this.setState({ actions: newProps.actions });
    }

    setActionBrowser(browser) {
        this.setState(Object.assign({}, this.state, { browser: browser }));
    }

    addAction(actionName) {
        let action = { name: actionName };
        action.time = '00:00:00';
        action.weight = 0;
        action.reps = 0;
        action.speed = 0;
        action.level = 0;
        action.kw = 0;
        action.program = 0;
        let actions = this.state.actions;
        if (!actions) {
            action.number = 1;
            actions = [action];
            this.updateActions(actions, 'none');
        }
        else {
            action.number = this.state.actions.length + 1;
            actions.push(action);
            this.updateActions(actions, 'none');
        }

    }

    handleActionParameterChange(number, parameter, value) {
        let actions = this.state.actions;
        actions = actions.map(action => {
            if (action.number === number) {
                action[parameter] = value;
            }
            return action;
        })
        this.updateActions(actions);
    }

    deleteAction(numberToDelete) {
        let newNumber = 1;
        let actions = this.state.actions;
        actions = actions.filter(action => {
            if (action.number !== numberToDelete) {
                action.number = newNumber++;
                return true;
            }
            else {
                return false;
            }
        })
        this.updateActions(actions);
    }

    move(numberToMove, direction = 'up') {
        let actions = this.state.actions;
        let from, to;
        from = numberToMove - 1;
        if (direction === 'up') {
            to = from - 1;
        }
        else {
            to = from + 1;
        }

        if (to >= actions.length || to < 0) {
            return
        }
        actions = this.arrayMove(actions, from, to);
        actions = this.renumberActions(actions);
        this.updateActions(actions);
    }

    renumberActions(actions) {
        const newActions = actions.map((action, i) => {
            action.number = i + 1;
            return action;
        })
        return newActions;
    }

    arrayMove(arr, fromIndex, toIndex) {
        let element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
        return arr;
    }

    updateActions(actions, setBrowerAction = null) {
        this.setState(Object.assign({}, this.state, { actions: actions }), () => {
            this.props.updateExercise(this.state.actions);
            if (setBrowerAction) {
                this.setActionBrowser(setBrowerAction);
            }
        });
    }

    setActionDetail(action){
        if(this.props.readOnly && action.name !== 'rest'){
            this.setState({actionDetail: action});
            document.getElementsByTagName('body')[0].style.overflow='hidden';
        }
    }

    removeDetail(){
        this.setState({actionDetail: null});
        document.getElementsByTagName('body')[0].style.overflow='unset';
    }

    render() {
        const { browser, actions, actionDefinitions, actionDetail } = this.state;
        const { readOnly } = this.props;
        let actionsList = '';

        if (actionDefinitions && actions) {
            actionsList = actions.map((action, i) => {
                const { weight = 0, reps = 0, speed = 0, level = 0, kw = 0, program = 0, time = '00:00:00' } = action;
                action.weight = weight;
                action.reps = reps;
                action.speed = speed;
                action.level = level;
                action.kw = kw;
                action.program = program;
                action.time = time;

                let temptags = [];
                const name = action.name;
                const definition = actionDefinitions.find(a => a.name === name);

                if (definition['weight']) {
                    temptags.push(<ActionParameter label='weight' key='weight' value={action.weight} onChange={evt => this.handleActionParameterChange(action.number, 'weight', evt.target.value)} readOnly={readOnly} />);
                }
                if (definition['reps']) {
                    temptags.push(<ActionParameter label='reps' key='reps' value={action.reps} onChange={evt => this.handleActionParameterChange(action.number, 'reps', evt.target.value)} readOnly={readOnly} />);
                }
                if (definition['speed']) {
                    temptags.push(<ActionParameter label='speed' key='speed' value={action.speed} onChange={evt => this.handleActionParameterChange(action.number, 'speed', evt.target.value)} readOnly={readOnly} />);
                }
                if (definition['level']) {
                    temptags.push(<ActionParameter label='level' key='level' value={action.level} onChange={evt => this.handleActionParameterChange(action.number, 'level', evt.target.value)} readOnly={readOnly} />);
                }
                if (definition['kw']) {
                    temptags.push(<ActionParameter label='kw' key='kw' value={action.kw} onChange={evt => this.handleActionParameterChange(action.number, 'kw', evt.target.value)} readOnly={readOnly} />);
                }
                if (definition['program']) {
                    temptags.push(<ActionParameter label='program' key='program' value={action.program} onChange={evt => this.handleActionParameterChange(action.number, 'program', evt.target.value)} readOnly={readOnly} />);
                }
                if (definition['time']) {
                    temptags.push(
                        <div className='parameterMaginLR' key='time'>
                            <div className='parameterName'>
                                time
                            </div>
                            {readOnly ?
                                <div>{action.time}</div>
                                :
                                <input type='time' step='1' value={action.time} onChange={evt => this.handleActionParameterChange(action.number, 'time', evt.target.value)} />
                            }
                        </div>);
                }
                let className = 'actionSettings ' + name;

                return (
                    <div onClick= {() => { this.setActionDetail(definition) }} className={className} key={i}>
                        <div className='parameterContainer'>
                            <div className='name' key={'name'}>{name}</div>
                            <div className='flex'>
                                {temptags}
                            </div>

                        </div>
                        {!readOnly &&
                            <div className='actionButtons'>
                                <div className='orderButtons'>
                                    <div className='move' onClick={() => this.move(action.number, 'up')}>
                                        up
                                </div>
                                    <div className='move' onClick={() => this.move(action.number, 'down')}>
                                        down
                                </div>
                                </div>
                                <div className='delete' onClick={() => this.deleteAction(action.number)}>
                                    X
                            </div>
                            </div>
                        }
                    </div>);
            })
        }

        return (
            <div className='actionsEditor' >
                {actionDetail &&
                    <div className='backgroundGrey'>
                        <button type='button' className='btn-full removeDetailButton' onClick={this.removeDetail}>x</button>
                        <div className='actionDetailContainer'>
                            <ActionDetail action={actionDetail} buttons={false}/>
                        </div>
                    </div>
                }
                <div className='actionsTitle'>Actions</div>
                <div>
                    <div>
                        {actionsList}
                    </div>
                    {(!readOnly && actionDefinitions) &&
                        <div>
                            <button className='defaultButton' type='button' onClick={() => this.setActionBrowser('actions')}>Add action</button>
                            <button className='defaultButton' type='button' onClick={() => this.addAction('rest')}>Add rest</button>
                        </div>
                    }

                </div>
                {browser === 'actions' &&
                    <div>
                        <ActionsBrowser actionsDefinitions={actionDefinitions} onAddAction={this.addAction} onCancel={this.setActionBrowser} />
                    </div>
                }
            </div>
        )
    }
}

export default ActionsEditor;