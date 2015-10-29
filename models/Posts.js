var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    titre: String,
    lien: String,
    description: String,
    votePositifs: {type: Number, default: 0},
    voteNegatifs: {type: Number, default: 0},
    date :  {type: Date, default: Date.now},
    comments: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});


PostSchema.methods.plus = function(cb) {
    this.votePositifs += 1;
    this.save(cb);
};

PostSchema.methods.moins = function(cb) {
    this.voteNegatifs += 1;
    this.save(cb);
};
mongoose.model('Post', PostSchema);
