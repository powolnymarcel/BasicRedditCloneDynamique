var express = require('express');
var router = express.Router();


var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* Voir l'accueil ICI on charge le EJs index  qui contient une balise ng-view les templates seront placés dans public/templates   Et les routes communiqueront avec le javascripts>AngularPublicApp.js*/
router.get('/', function(req, res, next) {
  res.render('index');
});



router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

//One thing you might notice about the remaining routes we need to implement is that they all
//require us to load a post object by ID. Rather than replicating the same code across several different
//request handler functions, we can use Express's param() function to automatically load an object.
//
//On va sur mongoDB chercher un post via ID

//In this example we are using mongoose's query interface which simply provides a more flexible way of interacting with the database.
//Now when we define a route URL with :post in it, this function will be run first. Assuming the :post parameter contains an ID, our function
//will retrieve the post object from the database and attach it to the req object after which the route handler function will be called.
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);
  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});
//ON va chercher via cette route là ;)
router.get('/posts/:post', function(req, res) {
  //La res(respond) va tout droit au client
  res.json(req.post);
});


// Via cette route on fait un +1 pour le post
router.put('/posts/:post/votePositifs', function(req, res, next) {
  req.post.plus(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});


// Via cette route on fait un +1 pour le post
router.put('/posts/:post/voteNegatifs', function(req, res, next) {
  req.post.moins(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});



























module.exports = router;