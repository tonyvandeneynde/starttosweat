import React, { Component } from 'react';
import './ActionsBrowser.css';
import BrowserButton from '../../BrowserButton/BrowserButton';
import ActionDetail from '../ActionDetail/ActionDetail';

class ActionsBrowser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            actions: this.props.actionsDefinitions,
            route: 'actions',
            filters: { machine: '', muscleGroup: '' },
            machines: [],
            muscleGroups: [],
            detail:{}
        }
        this.removeDetail = this.removeDetail.bind(this);
    }

    componentDidMount() {
        const { actions } = this.state;
        let machines = [], muscleGroups = [];

        if(actions){
            fetch(`${process.env.REACT_APP_API_URL}/machines`)
            .then(res => { return res.json() })
            .then(resJson => {
                resJson.forEach(machine => {
                    if (actions.find(a=> a.machine === machine.name)){
                        machines.push({name:machine.name, image:machine.image});
                    }
                })
                actions.forEach(action => {
                    if (action.name !== 'rest') {
                        action.muscle_groups.forEach(muscleGroup => {
                            if (!muscleGroups.includes(muscleGroup)) {
                                muscleGroups.push(muscleGroup);
                            }
                        });
                    }
                });
                this.setState(Object.assign({}, this.state, { machines: machines, muscleGroups: muscleGroups }));
            })
        }
    }

    setFilters(machine = '', muscleGroup = '') {
        this.setState(Object.assign({}, this.state, { filters: { machine: machine, muscleGroup: muscleGroup } }), () => {
            this.setRoute('actions');
        })
    }

    setRoute(newRoute, clearFilters = false) {
        if (clearFilters) {
            const filters = { machine: '', muscleGroup: '' };
            this.setState(Object.assign({}, this.state, { filters: filters }));
        }
        this.setState(Object.assign({}, this.state.route, { route: newRoute }));
    }

    setDetail(action){
        this.setState(Object.assign({}, this.state, {detail: action}), () => {
            this.setRoute('detail');
        })
    }

    removeDetail(){
        this.setRoute('actions', false);
    }

    render() {
        const { route, actions, filters, machines, muscleGroups, detail} = this.state;
        let filteredHtml;
        if (route === 'actions' && actions) {
            filteredHtml = actions.map((action, i) => {
                if (action.name !== 'rest' && (filters.machine === '' || action.machine === filters.machine) && (filters.muscleGroup === '' || action.muscle_groups.includes(filters.muscleGroup))) {
                    return <BrowserButton key={i} text={action.name} image={action.thumbnail} onClick={() => this.setDetail(action)} />
                }
                else
                    return '';
            })
        }
        if (route === 'machines' && machines) {
            filteredHtml = machines.map((machine, i) => {
                return <BrowserButton key={i} text={machine.name} image={machine.image} onClick={() => this.setFilters(machine.name, '')} />
            })
        }
        if (route === 'muscleGroups' && muscleGroups) {
            filteredHtml = muscleGroups.map((muscleGroup, i) => {
                return <BrowserButton key={i} text={muscleGroup} onClick={() => this.setFilters('', muscleGroup)} />
            })
        }

        return (
            <div className='background'>
                <div className='actionsBrowser'>
                    <div className='actionsFilters'>
                        <button type='button' className='filterButton' onClick={() => this.setRoute('actions', true)}>all</button>
                        <button type='button' className='filterButton' onClick={() => this.setRoute('machines', true)}>by machine</button>
                        <button type='button' className='filterButton' onClick={() => this.setRoute('muscleGroups', true)}>by muscle group</button>
                        <button type='button' className='filterButton' onClick={this.props.onCancel}>cancel</button>
                    </div>
                    <div className='detailContainer'>
                        {route === 'detail' ?
                            <ActionDetail action={detail} onAddAction={() => this.props.onAddAction(detail.name)} onBack={this.removeDetail}/>
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

export default ActionsBrowser