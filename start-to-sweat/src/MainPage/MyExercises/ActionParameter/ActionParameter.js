import React, { Component } from 'react';

class ActionParameter extends Component {
    render() {
        const {label, value, onChange, type='', step='', readOnly=false} = this.props;
        return (
            <div className='parameterMaginLR' key={label}>
                <div className='parameterName'>
                    {label}
                </div>
                { readOnly ?
                    <div>{value}</div>
                    :
                    <input type={type} step={step} value={value} onChange={onChange} />
                }
            </div>
        )
    }
}

export default ActionParameter