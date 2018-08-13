var express = require('express');
var app = express();
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser'); // with this we can parse the post params by req.body.MY_PARAM
var SERVER_PORT = 8081;
var sqlConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'dbContacts'

};

var mysqlConnection = mysql.createConnection(sqlConfig);

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

app.use('/api', router);

router.get('/', function (req, res) {
    res.json({
        message: 'This is the main API route. use /api/ACTION'
    });
});

router.get('/ping', function (req, res) {
    res.end("PONG");
});

router.post('/contact/:id', function (req, res) { // get contact
    var sql = 'SELECT * FROM contacts WHERE Id = ' + req.body.id;

    mysqlConnection.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.end(JSON.stringify(result));
    });
});

router.post('/all', function (req, res) { // get all contacts
    var sql = 'SELECT * FROM Contacts;';

    mysqlConnection.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.end(JSON.stringify(result));
    });
});

router.post('/add', function (req, res) {
    var contact = [];
    var sqlId = "SELECT MAX(id) as maxid FROM Contacts";
    var sqlInsert = "INSERT INTO Contacts (id,fname,lname,phone,email,base64) VALUES ?";
    var records = [];
    mysqlConnection.query(sqlId, [records], function (err, result) {
        if (err) throw err;

        var newId = result[0].maxid ? result[0].maxid + 1 : 1;

        contact.push(newId.toString());
        contact.push(req.body.fname);
        contact.push(req.body.lname);
        contact.push(req.body.phone);
        contact.push(req.body.email);
        contact.push(req.body.base64);

        records.push(contact);

        mysqlConnection.query(sqlInsert, [records], function (err, result) {
            console.log("record inserted for " + req.body.fname + " " + req.body.lname);
            req.body.id = newId;
            res.json(req.body).end();
        });

    });
});

app.listen(SERVER_PORT, function () {
    console.log('Server running at http://127.0.0.1:' + SERVER_PORT + '/');
});

mysqlConnection.connect(function (error) {
    if (error) {
        console.log('Error connecting to DB');
        return;
    }
    console.log('Connection established to mysql server !');
});
