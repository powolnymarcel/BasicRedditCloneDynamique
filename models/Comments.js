var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    body: String,
    auteur: String,
    votePositifs: {type: Number, default: 0},
    voteNegatifs: {type: Number, default: 0},
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});

mongoose.model('Comment', CommentSchema);

