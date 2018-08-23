const express = require('express');
const app = express();
const bodyParser = require('body-parser')
//const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let db = require('knex')({
    client: 'pg',
    version: '10.4',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'T@nzot666',
        database: 'recipes'
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
            }).then((dbResponse) => {
                res.write('user created');
                res.end();
            }).catch((error) => {
                res.status('400');
                res.write('register failed');
                res.end();
            });
        }
    });
})

app.post('/login', (req, res) => {
    console.log("Request handler 'login' was called.");
    const { email, password } = req.body;
    db.select('password').from('login').where({ username: username }).then((rows) => {
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

app.listen(8888, function () {
    console.log('recipe server listening on port 8888!');
});