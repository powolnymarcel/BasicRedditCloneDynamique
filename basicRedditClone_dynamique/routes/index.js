var express = require('express');
var router = express.Router();

/* Voir l'accueil ICI on charge le EJs index  qui contient une balise ng-view les templates seront placés dans public/templates   Et les routes communiqueront avec le javascripts>AngularPublicApp.js*/
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
