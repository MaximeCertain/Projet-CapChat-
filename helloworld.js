var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();

var _getAllFilesFromFolder = function(dir) {
    var filesystem = require("fs");
    var results = [];
    filesystem.readdirSync(dir).forEach(function(file) {
        file = dir+'/'+file;
        var stat = filesystem.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);
    });
    return results;
};
var singuliers = (_getAllFilesFromFolder("Capchat/singuliers"));
var neutres = (_getAllFilesFromFolder("Capchat/neutres"));

var createImage = function(src, title) {
    var img = new Image;
    img.src   = src;
    img.alt   = title;
    img.title = title;
    return img; 
  };

var imagesCapChat = [];
//ajout image singulières
var rand = singuliers[Math.floor(Math.random() * singuliers.length)];
imagesCapChat.push(rand);
//ajout images neutres 
var tableauQuestions  = new Array(
    'Saurez vous reconnaître un chat amoureux ?',
    'Mon chat est une fausse blonde',
    'Ce chat là a fait une croix sur son oeil',
    'C\'est encore le chat qui porte le chapeau',
    'Saurez-vous reconnaître le chat de Thomas Pesquet ?',
    'Ce chat n a qu un oeil',
    'Ne confondons pas une salicorne et un chat-licorne !',
    'Ce chat là a oublié de se faire vacciner contre la grippe',
    'Quel type de chat se cache derrière ses moustaches  ?',
    'Chaussez vos lunettes et montrez-moi le chat myope ?',
    'Après la fiancée du pirate, voici le chat du corsaire',
    'Chat du grand bleu',
    'C\'est la reine d\'Angleterre qui a perdu son chat',
    'Après les gilets jaunes, voici les foulards rouges'
    );

for(var i =0; i<=6; i++){
    var rand = neutres[Math.floor(Math.random() * neutres.length)];
    console.log(rand);
    imagesCapChat.push(rand);
    var index = neutres.indexOf(rand);
    neutres.splice(index, 1 )
}  
console.log(imagesCapChat);
console.log(neutres[5]);

let handleRequest =(request, response) => {
    response.writeHead(200, { 'Content-Type' : 'text/html'});
//requete asynchrone
fs.readFile('Capchat/index.html', null, function(error, data) {
    if(error) {
        response.writeHead(404);
        response.write('error 405');
    }
    else {
        response.write(data);
    }
        response.end();
});
};
http.createServer(handleRequest).listen(8080);
