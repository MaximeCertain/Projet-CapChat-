var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
var test = require('./Capchat/tableau'); // Fait appel à test.js (même dossier)
app.use( express.static( "public" ) );
var mysql = require('mysql');

var questions = test.tableauQuestions;

//Récupérer tous les fichiers d'un dossier
var _getAllFilesFromFolder = function(dir) {
    var filesystem = require("fs");
    var results = [];
    filesystem.readdirSync(dir).forEach(function(file) {
        file = dir+'/'+file;
        var stat = filesystem.statSync(file); 
        var res = file.substr(7, file.length);
        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
           
        } else results.push(res);
    });
    return results;
};

var mySqlClient = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
    database : "capchat"
  });
/*  var selectQuery = 'SELECT * FROM artiste';

  mySqlClient.query(
    selectQuery,
    function select(error, results, fields) {
      if (error) {
        console.log(error);
        mySqlClient.end();
        return;
      }
        
      if ( results.length > 0 )  { 
        //var firstResult = results[ 0 ];
        for(result in results)
        {
        console.log('id: ' + results[result]['id']);
        console.log('label: ' + results[result]['prenom']);
        console.log('valeur: ' + results[result]['nom']);
        }
        
      } else {
        console.log("Pas de données");
      }
      mySqlClient.end();
    }
  );*/

var imagesCapChat = [];
var question;
var singuliers =[];
    var neutres = [];
var imagesSingulieres = [];
var maxWidth =1000;

function load()
{
    imagesCapChat.splice(0, imagesCapChat.length);
    console.log(imagesCapChat);
   /* singuliers.splice(0, singuliers.length);
    neutres.splice(0, neutres.length);
imagesSingulieres.splice(0, imagesSingulieres.length);*/
 singuliers = (_getAllFilesFromFolder("public/singuliers"));
 neutres = (_getAllFilesFromFolder("public/neutres"));

var cpt =0;
singuliers.forEach(element => {
      imagesSingulieres.push([element, questions[cpt]]);
      cpt++;
});

//ajout image singulières
var rand = imagesSingulieres[Math.floor(Math.random() * imagesSingulieres.length)];

imagesCapChat.push(rand);
//ajout images neutres 

for(var i =0; i<=6; i++){
    var rand = neutres[Math.floor(Math.random() * neutres.length)];
    imagesCapChat.push([rand, ""]);
    var index = neutres.indexOf(rand);
    neutres.splice(index, 1 )
} 
imagesCapChat.sort(function(){return 0.5-Math.random();});
for(i=0;i<imagesCapChat.length;i++) {
    if(imagesCapChat[i][1] != "")
    {
        question =imagesCapChat[i][1];
    }
     };
     console.log(question);

    }
app.get('/rate', function(req, res) { 
    maxWidth = maxWidth -5;
    load();  
    res.render('test.ejs', {imagesCapChat: imagesCapChat, question : question, maxWidth:maxWidth});
});

app.get('/success', function(req, res) { 
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send('Le CapChat est validé .... Quelle performance ... ');
});

app.get('/ban', function(req, res) { 
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send('Vous êtes banni à vie');
});

app.get('/init', function(req, res) {
    maxWidth =100;
    console.log(maxWidth);
    load();
    res.render('test.ejs', {imagesCapChat: imagesCapChat, question : question, maxWidth:maxWidth});
});
app.listen(8081);