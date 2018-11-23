import React, { Component } from 'react';
import ActionParameter from '../../MyExercises/ActionParameter/ActionParameter';
import ActionDetail from '../../MyExercises/ActionDetail/ActionDetail';
import './ActionsTable.css';

class ActionsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            actionDefinitions: null,
            actionDetail: null
        }
        this.removeDetail = this.removeDetail.bind(this);
    }

    componentDidMount() {
        fetch(`${process.env.REACT_APP_API_URL}/actions`)
            .then(res => { return res.json() })
            .then(actionDefinitions => {
                this.setState(Object.assign({}, this.state, { actionDefinitions: actionDefinitions }));
            })
    }

    setActionDetail(action) {
        if (action.name !== 'rest'){
            this.setState({ actionDetail: action });
            document.getElementsByTagName('body')[0].style.overflow='hidden';
        }
    }

    removeDetail(){
        this.setState({actionDetail: false})
        document.getElementsByTagName('body')[0].style.overflow='unset';
    }

    render() {
        const { actionDefinitions, actionDetail } = this.state;
        const { actions } = this.props;
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
                    temptags.push(<ActionParameter label='weight' key='weight' value={action.weight} readOnly={true} />);
                }
                if (definition['reps']) {
                    temptags.push(<ActionParameter label='reps' key='reps' value={action.reps} readOnly={true} />);
                }
                if (definition['speed']) {
                    temptags.push(<ActionParameter label='speed' key='speed' value={action.speed} readOnly={true} />);
                }
                if (definition['level']) {
                    temptags.push(<ActionParameter label='level' key='level' value={action.level} readOnly={true} />);
                }
                if (definition['kw']) {
                    temptags.push(<ActionParameter label='kw' key='kw' value={action.kw} readOnly={true} />);
                }
                if (definition['program']) {
                    temptags.push(<ActionParameter label='program' key='program' value={action.program} readOnly={true} />);
                }
                if (definition['time']) {
                    temptags.push(<div key='time'>
                        <div className='parameterName'>
                            time
                        </div>
                        <div>{action.time}</div>
                    </div>);
                }
                let className = 'actionSettings flex ' + name;
                return <div onClick={() => { this.setActionDetail(definition) }} className={className} key={i}>
                    <div className='name' key={'name'}>{name}</div>
                    <div className='flexRight flex'>
                        {temptags}
                    </div>
                </div>;
            })
        }

        return (
            <div>
                {actionDetail &&
                    <div className='backgroundGrey'>
                        <button type='button' className='btn-full removeDetailButton' onClick={this.removeDetail}>x</button>
                        <div className='actionDetailContainer'>
                            <ActionDetail action={actionDetail} buttons={false}/>
                        </div>
                    </div>
                }
                <div className='actionsEditor'>
                    <div className='actionsTitle'>Actions</div>
                    <div>
                        <div>
                            {actionsList}
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}

export default ActionsTable;