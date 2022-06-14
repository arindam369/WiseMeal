const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    subject:{
        type: String,
        required: true
    },
    story:{
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'     // Creating a relationship with User model
    }
})

const Post = mongoose.model("Post", postSchema);


module.exports = Post;