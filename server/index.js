const express = require('express');
const app = express();
const bodyParser = require('body-parser')
//const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());

let db = require('knex')({
    client: 'pg',
    version: '10.4',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'T@nzot666',
        database: 'start-to-sweat'
    }
});

db.on('query', function (queryData) {
    //console.log(queryData);
});

app.post('/user', (req, res) => {
    console.log("Request handler 'user' POST was called.");
    const { username, password } = req.body;
    bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
            res.write('register failed');
            res.status('400');
            res.end();
        }
        else {
            db('login').insert({
                username: username,
                password: hash
            }).then(dbResponse => {
                return db('users').insert({
                    username: username
                })
            }).then(dbResponse => {
                res.write('user created');
                res.end();
            }).catch(error => {
                res.status('400');
                res.write('register failed');
                res.end();
            });
        }
    });
})

app.post('/login', (req, res) => {
    console.log("Request handler 'login' was called.");
    console.log(req.body)
    const { username, password } = JSON.parse(req.body);
    db.select('password').from('login').where({ username: username }).then(rows => {
        if (rows[0]) {
            return rows[0].password;
        }
        else {
            res.status('400');
            res.write('login failed');
            res.end();
            return Promise.reject(err);
        }
    }).then((hash) => {
        bcrypt.compare(password, hash).then(function (correct) {
            if (correct) {
                res.end();
            }
            else {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.write('login failed');
                res.end();
            }
        });
    })
})

app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    getUserPromise(username)
    .then(user=>{
        res.write(JSON.stringify(user));
        res.end();
    })
})

app.put('/user', (req, res) => {
    console.log("Request handler PUT /user was called.");
    const { username, dob=null, height=null, weighings=[] } = req.body;

    db('users').where('username', username).update({
        dob: dob,
        height: height
    }).then(()=>{
        return db('weighings').where('username', username).del()
    }).then(()=>{
        const insertWeighingsPromises = weighings.map(weighing => {
            const {date, weight=null, fatpercentage=null} = weighing;
            return db('weighings').insert({
                username:username,
                date:date,
                weight:weight,
                fatpercentage:fatpercentage
            })
        })
        return Promise.all(insertWeighingsPromises);
    })
    .then(()=>{
        return getUserPromise(username)
    })
    .then((user)=>{
        res.write(JSON.stringify(user));
        res.end();
    })
})

app.get('/exercises/:owner', (req, res) => {
    const owner = req.params.owner;
    console.log(`Request handler GET /exercises was called with owner ${owner}`);
    getExercisesOfOwnerPromise(owner).then(exercises => {
        res.write(JSON.stringify(exercises));
        res.end();
    })
})

app.post('/exercise', (req, res) => {
    console.log("Request handler POST /exercise was called.");
    const { name, type, owner, actions=[], duration } = req.body;
    let id;
    db('exercises').insert({
        name: name,
        owner: owner,
        type: type,
        duration: duration ? duration : null
    }).returning('id').then(rows => {
        id = rows[0];
        const actionPromises = actions.map(action => {
            return db('exercise_actions').insert({
                exercise_id: id,
                action: action.name,
                number: action.number,
                weight: action.weight,
                reps: action.reps,
                time: action.time,
                speed: action.speed,
                kw: action.kw,
                level: action.level,
                program: action.program
            })
        })
        return Promise.all(actionPromises);
    })
        .then(promiseRes => {
            return getExerciseByIdPromise(id);
        })
        .then(exercise => {
            res.write(JSON.stringify(exercise[0]));
            res.end();
        })
})

app.put('/exercise', (req, res) => {
    console.log("Request handler PUT /exercise was called.");
    const { id, name = '', type = null, owner = null, actions = [], duration = null } = req.body;

    db('exercises').where('id', id).update({
        name: name,
        owner: owner,
        type: type,
        duration: duration
    }).then(dbResponse => {
        const updateActionsPromises = actions.map(action => {
            // update existing actions
            const { number = null, name = null, weight = null, reps = null, time = null, speed = null, kw = null, level = null, program = null } = action;
            return db('exercise_actions').where('exercise_id', id).andWhere('number', action.number).update({
                action: name,
                weight: weight,
                reps: reps,
                time: time,
                speed: speed,
                kw: kw,
                level: level,
                program: program
            }).then(dbResponse => {
                // add new actions
                rawStr = `INSERT INTO exercise_actions (exercise_id, number, action, weight, reps, time, speed, kw, level, program)
                        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                        WHERE NOT EXISTS (SELECT 1 FROM exercise_actions WHERE exercise_id=? AND number=?)`

                return db.raw(rawStr, [id, number, name, weight, reps, time, speed, kw, level, program, id, number])
            })
        })
        return Promise.all(updateActionsPromises);
    }).then(() => {
        // remove unused actions
        const lastActionNumber = actions[actions.length - 1].number;
        return db('exercise_actions').where('exercise_id', id).andWhere('number', '>', lastActionNumber).del();
    }).then(() => {
        return getExerciseByIdPromise(id);
    }).then(exercise => {
        res.write(JSON.stringify(exercise[0]));
        res.end();
    })

    /*UPDATE exercise_actions SET exercise_id='1', action='rest', number='4', speed='700' WHERE exercise_id='1' AND number='2';
    INSERT INTO exercise_actions (exercise_id, action, number, speed)
           SELECT '1', 'rest', '4', '600'
           WHERE NOT EXISTS (SELECT 1 FROM exercise_actions WHERE exercise_id='1' AND number='4');*/

})

app.delete('/exercise/:id', (req, res) => {
    console.log("Request handler DELETE /exercise was called.");
    const exerciseId = req.params.id;
    db('exercises').where('id', exerciseId).del()
        .then(dbResponse => {
            res.write('exercise deleted');
            res.end();
        })
})

app.get('/machines', (req, res) => {
    db('machines')
        .then(dbResponse => {
            res.write(JSON.stringify(dbResponse));
            res.end();
        })
})

app.get('/actions', (req, res) => {
    db('actions')
        .then(dbResponse => {
            res.write(JSON.stringify(dbResponse));
            res.end();
        })
})

app.get('/types', (req, res) => {
    db('exercise_types')
        .then(dbResponse => {
            res.write(JSON.stringify(dbResponse));
            res.end();
        })
})

app.post('/workout', (req, res) => {
    console.log("Request handler POST /workout was called.");
    const { name, owner, duration = null, exercises } = req.body;
    let workoutId;
    db('workouts').insert({
        name: name,
        owner: owner,
        duration: duration ? duration : null
    }).returning('id').then(rows => {
        workoutId = rows[0];
        const insertExercisesPromises = exercises.map(exercise => {
            const { id, number, finished=false } = exercise;
            return db('workout_exercises').insert({
                workout_id: workoutId,
                exercise_id: id,
                exercise_number: number,
                finished: finished
            })
        })
        return Promise.all(insertExercisesPromises);
    }).then(dbRes => {
        getWorkoutByIdPromise(workoutId)
            .then(workouts => {
                res.write(JSON.stringify(workouts[0]));
                res.end();
            })
    })
})

app.get('/workout/:id', (req, res) => {
    const workoutId = req.params.id;
    console.log("Request handler GET /workout was called.");
    getWorkoutByIdPromise(workoutId)
        .then(workouts => {
            res.write(JSON.stringify(workouts[0]));
            res.end();
            console.log(workouts[0]);
        })
})

app.get('/workouts/:owner', (req, res) => {
    const owner = req.params.owner;
    console.log("Request handler GET /workout was called.");
    getWorkoutsByOwnerPromise(owner)
        .then(workouts => {
            res.write(JSON.stringify(workouts));
            res.end();
            console.log(workouts[0]);
        })
})

app.delete('/workout/:id', (req, res) => {
    console.log("Request handler DELETE /workout was called.");
    const id = req.params.id;
    db('workouts').where({ id: id }).del()
        .then(dbResponse => {
            res.write('workout deleted');
            res.end();
        })
})

app.put('/workout', (req, res) => {
    console.log("Request handler PUT /workout was called.");
    let { id, name, owner, duration, exercises } = req.body;
    const workoutId = id;
    db('workout_exercises').where('workout_id', workoutId).del()
    .then(()=>{
        return db('workouts').where('id', workoutId).update({
            name: name,
            owner: owner,
            duration: duration ? duration : null
        })
    }).then(() => {
        const insertExercisesPromises = exercises.map(exercise => {
            const { id, number, finished } = exercise;
            return db('workout_exercises').insert({
                workout_id: workoutId,
                exercise_id: id,
                exercise_number: number,
                finished: finished
            })
        })
        return Promise.all(insertExercisesPromises);
    }).then(dbRes => {
        getWorkoutByIdPromise(id)
            .then(workouts => {
                res.write(JSON.stringify(workouts[0]));
                res.end();
            })
    })

})

getUserPromise = (username) =>{
    let user, weighings;

    const userPromise = db('users').where('username', username)
    .then(dbResponse => {
        user = dbResponse[0];
    })

    const weighingsPromise = db('weighings').where('username', username).orderBy('date').select(['date', 'weight', 'fatpercentage'])
    .then(dbResponse =>{
        weighings = dbResponse;
    })

    return new Promise((resolve)=>{
        Promise.all([userPromise, weighingsPromise]).then(()=>{
            user.weighings = weighings;
            resolve(user);
        })
    })
}

getWorkoutByIdPromise = (id) => {
    return getWorkoutPromiseWhere({ 'workouts.id': id });
}

getWorkoutsByOwnerPromise = (owner) => {
    return getWorkoutPromiseWhere({ 'workouts.owner': owner });
}

getWorkoutPromiseWhere = (whereClause) => {
    workoutsPromise = new Promise((resolve, reject) => {
        db.from('workouts').join('workout_exercises', 'workouts.id', '=', 'workout_exercises.workout_id').where(whereClause).orderByRaw('id, exercise_number')
            .then(dbResponse => {
                let workouts = [];
                dbResponse.forEach(row => {
                    const exercise = { number: row.exercise_number, id: row.exercise_id, finished: row.finished }
                    let workout = workouts.find(w => w.id === row.id);
                    if (workout === undefined) {
                        // create new workout object
                        workout = { name: row.name, id: row.id, owner: row.owner, duration: row.duration, exercises: [] }
                        workouts.push(workout);
                    }
                    workout.exercises.push(exercise);
                });
                resolve(workouts);
            })
    })
    return workoutsPromise;
}

getExercisesOfOwnerPromise = (owner) => {
    return getExercisePromise({ 'exercises.owner': owner })
}

getExerciseByIdPromise = (id) => {
    return getExercisePromise({ 'exercises.id': id })
}

parseDbExercisesPromise = (exerciseRows) => {
    return new Promise((resolve, reject) => {
        const exercises = exerciseRows.reduce((exercises, row) => {
            let exercise = exercises.find(e => e.id === row.exercise_id);
            if (!exercise) {
                // exercise is not yet in array
                let newExercise = {};
                newExercise.id = row.exercise_id;
                newExercise.name = row.name;
                newExercise.owner = row.owner;
                newExercise.type = row.type;
                newExercise.duration = row.duration;
                newExercise.actions = [];
                exercise = newExercise;
                exercises.push(exercise);
            }
            let newAction = {};
            newAction.number = row.action_number;
            newAction.name = row.action_name;
            newAction.machine = row.action_machine;
            newAction.weight = row.action_weight;
            newAction.reps = row.action_reps;
            newAction.time = row.action_time;
            newAction.speed = row.action_speed;
            newAction.kw = row.action_kw;
            newAction.level = row.action_level;
            newAction.program = row.action_program;
            exercise.actions.push(newAction);
            return exercises;
        }, []);
        resolve(exercises);
    });
}

getExercisePromise = (whereClause) => {
    return db.select('exercise_id', 'exercises.name', 'owner', 'type', 'duration',
        'action as action_name',
        'number as action_number',
        'machine as action_machine',
        'exercise_actions.weight as action_weight',
        'exercise_actions.reps as action_reps',
        'exercise_actions.time as action_time',
        'exercise_actions.speed as action_speed',
        'exercise_actions.kw as action_kw',
        'exercise_actions.level as action_level',
        'exercise_actions.program as action_program')
        .from('exercises')
        .join('exercise_actions', 'exercises.id', '=', 'exercise_actions.exercise_id')
        .join('actions', 'exercise_actions.action', '=', 'actions.name')
        .orderByRaw('exercise_id, number')
        .where(whereClause)
        .then(exercises => {
            return parseDbExercisesPromise(exercises)
        })
}



app.listen(8888, function () {
    console.log('recipe server listening on port 8888!');
});