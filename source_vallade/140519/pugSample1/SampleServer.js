var pug = require('pug');
var express = require('express');
var app = express();
app.set('view engine', 'pug'); //on délègue le moteur de rendu à pug
// par défaut, les fichiers .pug sont placés dans le répertoire views

/// sinon il faut fixer le répertoire des vues : app.set('views', './views')

app.get('/', function (req, res) {
    res.render('index');
  })

  app.get('/pug1', function (req, res) {
    res.render('pug1');
  })

  app.get('/pug2', function (req, res) {
    res.render('pug2', { title: 'Salut', message: 'Les gars de la licence Pro'});
  });

  app.get('/pug3', function (req, res) {
    res.render('pug3');
  });

  app.get('/pug4', function (req, res) {
    res.render('pug4');
  });

  app.get('/pug5', function (req, res) {
    res.render('pug5');
  });

  app.get('/pug6', function (req, res) {
    res.render('pug6');
  });

  app.get('/pug7', function (req, res) {
    res.render('pug7');
  });
  app.listen(8080);