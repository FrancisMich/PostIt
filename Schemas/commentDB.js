const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema ({
    body: {
        type: String,
        required: true
    },
    posts:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
}, {timestamps: true});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;