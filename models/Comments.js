var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    body: String,
    auteur: String,
    votePositifs: {type: Number, default: 0},
    voteNegatifs: {type: Number, default: 0},
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});



PostSchema.methods.plus = function(cb) {
    this.votePositifs += 1;
    this.save(cb);
};

PostSchema.methods.moins = function(cb) {
    this.voteNegatifs -= 1;
    this.save(cb);
};
mongoose.model('Comment', CommentSchema);

