var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cors = require('cors'); //pour que le client Swagger fonctionne en cross domain
var jwt = require('jsonwebtoken');
var app = express();
var http = require('http');


app.use(bodyParser.json()); // pour supporter json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //  pour supporter  encoded url
app.use(cors());
var idSession;

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "capchat",
    port: "3306"
});

app.post('/TryLogin', function(req, res){
    // Tentative de login (appelé par login.html)
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    obj = JSON.parse(JSON.stringify(req.body, null, "  "));
    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT * FROM artiste where nom = ? AND pass = ?",  [obj.nom,
                obj.pass],
            function (err, rows, fields) {
                if (err) throw err;
                var user = {nom:obj.nom};
                var token = jwt.sign({exp:Math.floor(Date.now()/1000+(60*60)), data :user}, 'MysecretKey');
                idSession = rows[0].id;
                console.log(token, user);
                if (err) throw err;
                console.log(idSession);
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token:  token
                });
            });
    });
});

//création Artiste, (registrate)
app.post('/registration', function(req, res){
//Enregistrement base de données
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    obj = JSON.parse(JSON.stringify(req.body, null, "  "));
    con.connect(function(err) {
        if (err) throw err;
        con.query("Insert into artiste (nom,prenom,pass) VALUES (?,?,?)",  [obj.nom,
                obj.prenom, obj.pass],
            function (err, rows, fields) {
                if (err) throw err;
                console.log("1 record inserted");
            });
    });
    res.status(200).end('Artiste créé' );

});

//tous les artistes de capchat
app.get('/artistes', function(req, res) {
    var artistes;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    con.connect(function(err) {
        if (err) throw err;
        con.query("select * from artiste",
            function (err, rows, fields) {
                if (err) throw err;
                res.json(rows);
            });
    });
    res.render('test.ejs', {artistes: rows});

});

// Supprime un artiste
app.delete('/artistes/:id', function (req, res) {
    res.setHeader("Content-Type","application/json; charset=utf8");
    let id = req.params.id;
    con.connect(function (err) {
        if(err) throw err;
        let sql = mysql.format("DELETE FROM artiste WHERE id = ?",id);
        con.query(sql,function (err, result,fields) {
            if(err) throw err;
            res.status(200).end("Nombre de lignes supprimée : " + result.affectedRows);
        });
    });
});

//Modifie un artiste créateur
app.put('/artistes/:id',function (req,res) {
    res.setHeader("Content-Type","application/json; charset=utf8");
    obj = JSON.parse(JSON.stringify(req.body,null," "));
    let id = req.params.id;

    con.connect(function (err) {
        if(err) throw  err;
        console.log(id);
        console.log(obj);
        let sql = mysql.format("UPDATE artiste SET nom = ?, prenom = ? where id = ?",[obj.nom, obj.prenom, id]);
        con.query(sql,function (err, result) {
            if(err) throw err;
            res.status(200).end("Nombre de lignes modifiés: " + result.affectedRows);
        })
    })
});

//tous les themes de capchat
app.get('/themes', function(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    con.connect(function(err) {
        if (err) throw err;
        con.query("select * from theme",
            function (err, rows, fields) {
                if (err) throw err;
                res.json(rows);
            });
    });
});

app.use(express.static('forms'));
app.use('/static', express.static('public'));

app.use(function(req, res, next){
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(404).send('Lieu inconnu :'+req.originalUrl);
});
app.listen(8083);