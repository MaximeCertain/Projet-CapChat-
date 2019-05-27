var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cors = require('cors'); //pour que le client Swagger fonctionne en cross domain
var jwt = require('jsonwebtoken');
var app = express();
var http = require('http');
var pug = require('pug');
var upload = require('express-fileupload');
var unzip = require('unzip');
var fs = require('fs');
var multer=require('multer');   // a module for saving file from form.
var AdmZip = require('adm-zip'); // a module for extracting files
var uri = require('uri');
var stream = require('unzip-stream');
var request = require('request'),
    zlib = require('zlib'),
    out = fs.createWriteStream('out');
var session = require("express-session");


app.set('view engine', 'pug');
app.use(upload()); // configure middleware
app.use(session({ secret:"capchat", resave : false, saveUninitialized: false, cookie: { sessionDuration : 6000}}));

app.use(bodyParser.json()); // pour supporter json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); //  pour supporter  encoded url
app.use(cors());
var idSession = 0;
var sess;
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "capchat",
    port: "8889"
});

app.get('/login', function (req, res) {
    res.render('login');
});
app.get('/logout', function (req, res) {
    if(req.session)
    {
        req.session.destroy((err) => {
            console.log("exit");
            res.redirect('/login');
        })
    }});
app.post('/TryLogin', function(req, res){
    // Tentative de login (appelé par login.html)
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    obj = JSON.parse(JSON.stringify(req.body, null, " "));

        con.query("SELECT * FROM artiste where mail = ? AND pass = ?",  [obj.nom,
                obj.pass],
            function (err, rows, fields) {
                if (err) throw err;
                var user = {nom:obj.nom};
                var token = jwt.sign({exp:Math.floor(Date.now()/1000+(60*60)), data :user}, 'MysecretKey');
                console.log(rows[0]);
                idSession = rows[0].id;
                console.log (token, user);
                if (err) throw err;
                console.log(idSession);
                res.setHeader('token', token);
                req.session.token = token;

                res.status(200).redirect('/artistes');
    });
 });

app.get('/register', function (req, res) {
   res.render('register');
});
app.post('/register', function (req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    obj = JSON.parse(JSON.stringify(req.body, null, "  "));
    console.log(obj);
    con.query("Insert into artiste (nom,prenom,mail, pass) VALUES (?,?,?,?)",  [obj.nom,
            obj.prenom, obj.email, obj.pass],
        function (err, rows, fields) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    res.redirect('artistes');});

//création Artiste, (registrate)
app.post('/registration', function(req, res){
//Enregistrement base de données
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    obj = JSON.parse(JSON.stringify(req.body, null, "  "));
    console.log(obj);
        con.query("Insert into artiste (nom,prenom,mail, pass) VALUES (?,?,?,?)",  [obj.nom,
                obj.prenom, obj.email, "1234"],
            function (err, rows, fields) {
                if (err) throw err;
                console.log("1 record inserted");
            });
    res.redirect('artistes');
});
// Supprime un artiste
app.delete('/artistes/:id', function (req, res) {
    res.setHeader("Content-Type","application/json; charset=utf8");
    let id = req.params.id;

        let sql = mysql.format("DELETE FROM artiste WHERE id = ?",id);
        con.query(sql,function (err, result,fields) {
            if(err) throw err;
            res.status(200).end("Nombre de lignes supprimée : " + result.affectedRows);
    });
});

//Modifie un artiste créateur
app.put('/artistes/:id',function (req,res) {
    console.log("oui pere");
    obj = JSON.parse(JSON.stringify(req.body,null," "));
    let id = req.params.id;
        console.log(id);
        console.log(obj);
        let sql = mysql.format("UPDATE artiste SET nom = ?, prenom = ? where id = ?",[obj.nom, obj.prenom, id]);
        con.query(sql,function (err, result) {
            if(err) throw err;
            res.status(200).end("Nombre de lignes modifiés: " + result.affectedRows);
        })
});

app.get('/addartiste', function(req, res) {
    res.render('add_artiste');
});

/*//tous les themes de capchat
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
});*/
app.get('/upload', function (req, res) {
    con.query('SELECT *  FROM theme ', (err, rows, fields) => {
        if (err) {
            return next(err);
        }
        console.log(rows);
        res.render('upload', { themes: rows });
    });
});

app.get('/artistes/:id', function (req, res) {
    console.log(34);
    con.query('SELECT *  FROM artiste where id = ?', [req.params.id], (err, rows, fields) => {
        console.log(rows[0]);
        if (err) {
            return next(err);
        }
        res.render('login');
       // res.render('liste_artistes', { artistes: rows });
    });
});


var up = multer({ dest: 'uploads' });

app.get('/uploadFiles',function(req,res){
 /*   console.log(req.files);
    if (!req.files)
        return res.send('Please upload a file');
    console.log(req.files.filetoupload.name);
   // console.log('The file uploaded to:' + req.file.path);
    var zip = new AdmZip(req.files.filetoupload.name);
  //  zip.extractAllTo( "/");*/
//    request('http://google.com/doodle.png').pipe(fs.createWriteStream('file.zip'));
  // fs.createReadStream('file.zip').pipe(unzip.Extract({ path: '' }));


//fs.createReadStream('file.zip').pipe(unzip.Extract({ path: '' }));

//    request('file.zip').pipe(unzip.Extract({ path: '' }));

});


app.get('/themes', function (req, res) {
    sess = req.session.token;
    if(req.session.token){
        con.query('SELECT *  FROM theme ', (err, rows, fields) => {
            if (err) {
                return next(err);
            }
            console.log(rows);
            res.render('liste_themes', { themes: rows });
        });
    }else{
        res.redirect('logout');
    }
});

app.get('/artistes', function (req, res) {
    sess = req.session.token;
    if(req.session.token){
        con.query('SELECT *  FROM artiste ', (err, rows, fields) => {
            if (err) {
                return next(err);
            }
            console.log(rows);
            res.render('liste_artistes', { artistes: rows });
        });
    }else{
        res.redirect('logout');
    }

});

app.get('/capchats', function (req, res) {
    sess = req.session.token;
    if(req.session.token){
    con.query('SELECT nom, url, theme.libelle as tLibelle, jeu_image.libelle as jLibelle' +
        '  FROM jeu_image inner join theme on themeId = theme.id inner join artiste on artisteId = artiste.id ', (err, rows, fields) => {
        if (err) {
            return next(err);
        }
        console.log(rows);
        res.render('liste_capchat', { jeux: rows });
    });
    }else{
        res.redirect('logout');
    }
});

app.use(express.static('forms'));
app.use(express.static('public'));

app.use(function(req, res, next){
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(404).send('Lieu inconnu :'+req.originalUrl);
});
app.listen(8083);

//Plan de démo
//Inscrire un utilisateur
//Page de Login avec envoi de token
//Liste des Artistes
//Liste des jeux d'image + modifier
//Upload un zip et choisir le theme associé
//nommer le jeu d'image, voir les images uploadés, cocher les images singulières et les neutres
//choisir la question pour les singulières
//passer l'url en paramètre et accèder au capchat concerné

//dans chaque requête récupérer le header (token) si y'en a pas => vire
//