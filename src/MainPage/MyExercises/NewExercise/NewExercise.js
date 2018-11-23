import React, { Component } from 'react';
import './NewExercise.css';
import ActionsEditor from './ActionsEditor/ActionsEditor';
import { connect } from 'react-redux';

const mapState = (state) => {
    return {
        username: state.user.username
    }
}

class NewExercise extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exercise: JSON.parse(JSON.stringify(this.props.exercise)),
            types: [],
            readOnly: this.props.readOnly,
            title: this.props.title
        }
        this.updateActions = this.updateActions.bind(this);
        this.saveExercise = this.saveExercise.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.toggleReadOnly = this.toggleReadOnly.bind(this);
    }

    onValueChange(evt) {
        const value = evt.target.value;
        const name = evt.target.name;

        this.setState({
            exercise: Object.assign({}, this.state.exercise, {
                [name]: value
            })
        })
    }

    componentDidMount() {
        fetch(`${process.env.REACT_APP_API_URL}/types`)
            .then((res) => {
                return res.json();
            }).then((rows) => {
                const types = rows.map(row => {
                    return row.name
                })
                console.log(types);
                this.setState({
                    types: types
                })
            })
    }

    updateActions(actions) {
        this.setState({ exercise: Object.assign({}, this.state.exercise, { actions: actions }) });
    }

    saveExercise() {
        const exercise = this.state.exercise;
        const username = this.props.username;

        if (!exercise.type) {
            exercise.type = 'cardio'
        }
        if (!exercise.duration) {
            exercise.duration = '00:00:00'
        }
        if (!exercise.actions) {
            alert('Add at least one action.');
            return;
        }
        let method = 'put';

        if (!exercise.id) {
            exercise.owner = username;
            method = 'post'
        }
        fetch(`${process.env.REACT_APP_API_URL}/exercise`, {
            method: method,
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(exercise)
        }).then(res => {
            if (res.ok) {
                window.alert('exercise saved');
                return res.json();
            }
            else {
                window.alert('there was a problem saving the exercise')
                return false;
            }
        }).then(res => {
            this.props.onCancel();
            if (res) {
                this.props.updateExercises(res);
            }
        })
    }

    onDelete() {
        const exerciseId = this.state.exercise.id;
        fetch(`${process.env.REACT_APP_API_URL}/exercise/${exerciseId}`, {
            method: 'delete',
            headers: {
                'content-type': 'application/json',
            }
        }).then(res => {
            if (res.ok) {
                window.alert('exercise deleted');
                return true;
            }
            else {
                window.alert('there was a problem deleting the exercise')
                return false;
            }
        }).then(res => {
            if (res) {
                this.props.updateExercises(this.state.exercise, true);
            }
        })
    }

    toggleReadOnly() {
        if (this.state.readOnly) {
            this.setState({
                readOnly: false,
                title: 'Edit exercise'
            })
        }
        else {
            this.setState({
                readOnly: true,
                exercise: JSON.parse(JSON.stringify(this.props.exercise)),
                title: 'Exercise'
            })
        }
    }

    render() {
        const { onCancel } = this.props;
        const { readOnly, exercise, types, title } = this.state;
        let { id = null, type = 'cardio', name = '', duration = '00:00:00', actions = null } = exercise;
        if (duration === null) {
            duration = '00:00:00';
        }
        const typeOptions = types.map((type, i) => {
            return <option value={type} key={i}>{type}</option>
        })
        return (
            <div className='newExercise' >
                <div>
                    {id ?
                        <div>
                            {(!readOnly) ?
                                <div className='buttonGroup'>
                                    <button className='defaultButton' type='button' onClick={this.saveExercise}>Save</button>
                                    <button className='defaultButton' onClick={this.toggleReadOnly}>cancel</button>
                                    <button className='defaultButton deleteExerciseButton' onClick={this.onDelete}>Delete</button>
                                </div>
                                :
                                <div className='buttonGroup'>
                                    <button className='defaultButton' onClick={this.toggleReadOnly}>Edit</button>
                                    <button className='defaultButton' onClick={onCancel}>Back</button>
                                </div>
                            }
                        </div>
                        :
                        <div>
                            <button className='defaultButton' onClick={this.saveExercise}>Save</button>
                            <button className='defaultButton' onClick={onCancel}>Cancel</button>
                        </div>
                    }
                    <div className='titleBar'><div className='title'>{title}</div>
                    </div>
                    <form>
                        {readOnly ?
                            <div>
                                <div className='margin20'>
                                    <div>Name</div>
                                    <div className='parameterMaginLR'>{name}</div>
                                </div>
                                <div className='margin20'>
                                    <div>Type</div>
                                    <div className='parameterMaginLR'>{type}</div>
                                </div>
                                <div className='margin20'>
                                    <div>Duration</div>
                                    <div className='parameterMaginLR'>{duration}</div>
                                </div>
                            </div>
                            :
                            <div>
                                <div>Name</div>
                                <input name='name' value={name} onChange={this.onValueChange}></input>
                                <div>Type</div>
                                <select name='type' value={type} onChange={this.onValueChange}>
                                    {typeOptions}
                                </select>
                                <div>Duration</div>
                                <input name='duration' type='time' value={duration} onChange={this.onValueChange} />
                            </div>
                        }
                        <ActionsEditor actions={actions} updateExercise={this.updateActions} readOnly={readOnly} />
                    </form>
                </div>
            </div>
        )
    }
}

export default connect(mapState)(NewExercise);