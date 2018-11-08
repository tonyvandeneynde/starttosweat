import React, { Component } from 'react'
import './Info.css';
import 'cubic-spline'

export default class Info extends Component {
    constructor(props) {
        super(props);

        this.state = {
            readOnly: true,
        }
        this.toggleReadOnly = this.toggleReadOnly.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.save = this.save.bind(this);
        this.deleteWeighing = this.deleteWeighing.bind(this);
        this.addWeighing = this.addWeighing.bind(this);
        this.onChangeTodaysWeight = this.onChangeTodaysWeight.bind(this);
        this.updateWeightGraph = this.updateWeightGraph.bind(this);
        this.updateWeightGraph();
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
        let currentWeight = 0;
        if (nextProps.user.weighings.length>0){
            currentWeight = nextProps.user.weighings[nextProps.user.weighings.length - 1].weight;
        }
        this.setState({
            readOnly: true,
            username: nextProps.user.username,
            dob: nextProps.user.dob,
            height: nextProps.user.height,
            weighings: nextProps.user.weighings,
            currentWeight: currentWeight
        })
    }

    componentDidMount() {
        let currentWeight = 0;
        if (this.props.user.weighings.length > 0) {
            currentWeight = this.props.user.weighings[this.props.user.weighings.length - 1].weight;
        }

        this.setState({
            username: this.props.user.username,
            dob: this.props.user.dob,
            height: this.props.user.height,
            weighings: this.props.user.weighings,
            currentWeight: currentWeight
        }, () => this.updateWeightGraph());
    }

    componentDidUpdate() {
        this.updateWeightGraph();
    }

    updateWeightGraph() {
        let canvas = document.querySelector('.weighingsCanvas');
        const weighings = this.state.weighings;

        if (canvas !== null) {
            canvas.width = 500;
            canvas.height = 500;

            let ctx = canvas.getContext('2d');
            ctx.scale(1, 1);
            ctx.lineWidth = 2;
            ctx.font = "30px Arial";
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'white';

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasPadding = Math.round(0.15 * canvasWidth);
            const yAxisHeight = canvasHeight - 2 * canvasPadding;
            const xAxisLength = canvasWidth - 2 * canvasPadding;

            const normalisedData = this.normaliseWeights(weighings, xAxisLength, yAxisHeight)

            // draw axises
            ctx.beginPath();
            ctx.moveTo(canvasPadding, canvasPadding);
            ctx.lineTo(canvasPadding, canvasHeight - canvasPadding);
            ctx.lineTo(canvasWidth - canvasPadding, canvasHeight - canvasPadding);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(canvasPadding + 5, canvasPadding);
            ctx.lineTo(canvasPadding - 5, canvasPadding);
            ctx.lineTo(canvasPadding, canvasPadding - 25);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(canvasPadding + xAxisLength, -canvasPadding + canvasHeight - 5);
            ctx.lineTo(canvasPadding + xAxisLength, -canvasPadding + canvasHeight + 5);
            ctx.lineTo(canvasPadding + xAxisLength + 25, -canvasPadding + canvasHeight);
            ctx.closePath();
            ctx.fill();

            // draw axis marks
            normalisedData.marks.forEach(mark => {
                console.log('mark', mark, canvasHeight)
                ctx.beginPath();
                ctx.moveTo(canvasPadding + 5, Math.round(canvasHeight - canvasPadding - mark[1][1]));
                ctx.lineTo(canvasPadding - 5, Math.round(canvasHeight - canvasPadding - mark[1][1]));
                ctx.stroke();
                ctx.fillText(mark[0], canvasPadding - 65, Math.round(canvasHeight - canvasPadding - mark[1][1]) + 10)
            });

            // draw weight curve
            ctx.strokeStyle = '#007E65';
            ctx.fillStyle = '#007E65';
            ctx.beginPath();
            ctx.moveTo(normalisedData.measurement[0][0], normalisedData.measurement[0][1]);
            for (let i = 1; i < normalisedData.measurement.length - 2; i++) {
                const point1 = normalisedData.measurement[i];
                const point2 = normalisedData.measurement[i + 1];
                const xc1 = canvasPadding + point1.normalisedDate;
                const yc1 = canvasHeight - canvasPadding - point1.normalisedWeight;
                const xc2 = canvasPadding + point2.normalisedDate;
                const yc2 = canvasHeight - canvasPadding - point2.normalisedWeight;
                ctx.quadraticCurveTo(xc1, yc1, (xc1 + xc2) / 2, (yc1 + yc2) / 2);
            }
            ctx.stroke();

            // draw weighing points
            normalisedData.measurement.forEach(point => {
                const pointSize = 12;
                const centerPoint = [[canvasPadding + point.normalisedDate], [canvasHeight - canvasPadding - point.normalisedWeight]]
                ctx.beginPath();
                ctx.arc(Math.round(centerPoint[0]), Math.round(centerPoint[1]), pointSize / 2, 0, 2 * Math.PI)
                ctx.fill();
            });
        }
    }

    getNormalisedWeightsAndDateArrays(normalisedWeights) {
        return normalisedWeights.reduce((weightsDates, normalisedData) => {
            weightsDates[0].push(normalisedData.normalisedWeight);
            weightsDates[1].push(normalisedData.normalisedDate);
            return weightsDates;
        }, [[], []])
    }

    normaliseWeights(weighings, xAxisLength, yAxisHeight) {
        const minMaxWeights = this.getMinMaxWeight(weighings);
        const weightRange = (minMaxWeights[1] - minMaxWeights[0]) * 1.4;
        const minMaxDates = this.getMinMaxDate(weighings);
        const dateRange = (minMaxDates[1] - minMaxDates[0]) * 1.4;

        const normalisedWeights = weighings.map(weighing => {
            // normalise weight
            const weight = weighing.weight;
            const normalisedWeight = yAxisHeight / weightRange * (weight - minMaxWeights[0] + (minMaxWeights[1] - minMaxWeights[0]) * 0.2);

            // normalise date
            const date = weighing.date;
            const dateInMs = this.dateToMs(date);
            const normalisedDate = xAxisLength / dateRange * (dateInMs - minMaxDates[0] + (minMaxDates[1] - minMaxDates[0]) * 0.2);

            return { weight: weight, normalisedWeight: normalisedWeight, date: date, normalisedDate: normalisedDate }
        })

        let normalisedMarks = [];
        const numberOfWeightMarks = minMaxWeights[minMaxWeights.length - 1] - minMaxWeights[0];
        const weightMarksStep = Math.ceil(numberOfWeightMarks / 6);
        for (let i = Math.floor(minMaxWeights[0]); i <= Math.ceil(minMaxWeights[1]); i++) {
            if (i % weightMarksStep === 0 && i <= minMaxWeights[1] && i >= minMaxWeights[0]) {
                normalisedMarks.push([i, [0, yAxisHeight / weightRange * (i - minMaxWeights[0] + (minMaxWeights[1] - minMaxWeights[0]) * 0.2)]])
            }
        }
        return { measurement: normalisedWeights, marks: normalisedMarks };
    }

    dateToMs(date) {
        return (new Date(date)).getTime();
    }

    getMinMaxDate(weighings) {
        const firstWeightDate = (new Date(weighings[0].date)).getTime();
        return weighings.reduce((minMax, weighing) => {
            const date = (new Date(weighing.date)).getTime();
            if (date < minMax[0]) {
                minMax[0] = date;
            }
            if (date > minMax[1]) {
                minMax[1] = date;
            }
            return minMax;
        }, [firstWeightDate, firstWeightDate]);
    }

    getMinMaxWeight(weighings) {
        return weighings.reduce((minMax, weighing) => {
            const weight = weighing.weight;
            if (weight < minMax[0]) {
                minMax[0] = weight;
            }
            if (weight > minMax[1]) {
                minMax[1] = weight;
            }
            return minMax;
        }, [weighings[0].weight, weighings[0].weight]);
    }

    toggleReadOnly() {
        if (this.state.readOnly) {
            this.setState({
                readOnly: false
            })
        }
        else {
            this.setState({
                readOnly: true,
                username: this.props.user.username,
                dob: this.props.user.dob,
                height: this.props.user.height,
                weighings: this.props.user.weighings
            })
        }
    }

    save() {
        const { username, dob, height, weighings } = this.state;
        this.props.save({ username, dob, height, weighings });
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value.toString()
        })
    }

    deleteWeighing(weighing) {
        const weighings = JSON.parse(JSON.stringify(this.state.weighings));
        const indexToDelete = weighings.findIndex(w => w.date === weighing.date);
        weighings.splice(indexToDelete, 1);
        this.setState({
            weighings: weighings
        })
    }

    addWeighing() {
        let weighings = JSON.parse(JSON.stringify(this.state.weighings));
        let today = new Date(Date.now());
        today = today.toISOString().slice(0, 10);
        let lastWeight = 0;
        if (weighings.length > 0) {
            lastWeight = weighings[weighings.length - 1].weight;
        }
        const indexOfTodaysWeighing = weighings.findIndex(w => w.date === today);
        if (indexOfTodaysWeighing === -1) {
            weighings.push({ date: today, weight: lastWeight });
            this.setState({
                weighings: weighings
            })
        }
    }

    onChangeTodaysWeight(evt) {
        let weighings = JSON.parse(JSON.stringify(this.state.weighings));
        let today = new Date(Date.now());
        today = today.toISOString().slice(0, 10);
        const newWeight = evt.target.value;

        weighings = weighings.map(weighing => {
            if (weighing.date === today) {
                weighing.weight = newWeight;
            }
            return weighing;
        })

        this.setState({
            weighings: weighings
        })
    }

    render() {
        console.log('render info')
        const { username = '', readOnly, weighings = [], currentWeight = '' } = this.state;
        let todaysMeasurement = false;
        let { dob, height } = this.state;
        let today = new Date(Date.now());
        today = today.toISOString().slice(0, 10);
        let age = 0;

        dob = (dob === null || dob === undefined) ? '' : dob;
        height = (height == null) ? '' : height;

        if (dob !== '') {
            age = Math.trunc((new Date(today) - new Date(dob)) / 1000 / 60 / 60 / 24 / 365);
        }

        let weighingsRender = ''
        if (weighings.length > 0) {
            weighingsRender = weighings.map((weighing, i) => {
                if (weighing.date === today) {
                    todaysMeasurement = true;
                }
                return (<div key={i} className='weighingPill'>
                    {weighing.date === today ?
                        <div>
                            <div>
                                Today's measurement
                        </div>
                            <input type='number' onChange={this.onChangeTodaysWeight} value={weighing.weight} /> kg
                    </div>
                        :
                        <div>
                            <div>
                                {weighing.date}
                            </div>
                            <div>
                                {weighing.weight} kg
                        </div>
                        </div>
                    }
                    <button className='deleteWeighingButton' onClick={() => this.deleteWeighing(weighing)}>x</button>
                </div>)
            })
        }

        return (
            <div className='personalInfo'>
                {readOnly ?
                    <div className='personalInfo'>
                        <div className='alignLeft'>
                            <div className='alignRight'>
                                <button className='defaultButton' onClick={this.toggleReadOnly}>
                                    edit
                        </button>
                                <button className='defaultButton' onClick={this.props.onBack}>
                                    back
                        </button>
                            </div>
                            <div className='margin20'>
                                <div>username</div>
                                <div className='marginLeft20'>{username}</div>
                            </div>
                            {age > 0 &&
                                <div className='margin20'>
                                    <div>age</div>
                                    <div className='marginLeft20'>{age}</div>
                                </div>
                            }
                            {height > 0 &&
                                <div className='margin20'>
                                    <div>height</div>
                                    <div className='marginLeft20'>{height} cm</div>
                                </div>
                            }
                            {currentWeight !== 0 &&
                                <div className='margin20'>
                                    <div>weight</div>
                                    <div className='marginLeft20'>{currentWeight} kg</div>
                                </div>
                            }
                        </div>
                        {weighings.length > 2 &&
                            <canvas className='weighingsCanvas'></canvas>
                        }

                    </div>
                    :
                    <div className='personalInfo'>
                        <div className='alignLeft'>
                            <div className='alignRight'>
                                <button onClick={this.save} className='defaultButton'>
                                    save
                            </button>
                                <button onClick={this.toggleReadOnly} className='defaultButton'>
                                    cancel
                            </button>
                            </div>
                            <div className='margin20'>
                                <div>username</div>
                                <div className='marginLeft20'>{username}</div>
                            </div>
                            <div className='margin20'>
                                <div>date of birth</div>
                                <input className='marginLeft20' name='dob' type='date' value={dob} onChange={this.handleInputChange} />
                            </div>
                            <div className='margin20'>
                                <div>height (cm)</div>
                                <div>
                                    <input className='marginLeft20' name='height' type='number' value={height} onChange={this.handleInputChange} />
                                </div>
                            </div>
                            <div>
                                {weighingsRender}
                                {!todaysMeasurement &&
                                    <div>
                                        <button className='defaultButton' onClick={this.addWeighing}>add weighing</button>
                                    </div>
                                }

                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}
