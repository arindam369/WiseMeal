const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = new express.Router();
const auth = require("../middleware/auth");
const Post = require("./../models/post");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Create a post :
router.post("/posts", auth, (req, res) => {
    const newPost = new Post({
        ...req.body,
        author: req.user._id
    });
    newPost.save().then((result) => {
        res.redirect("/stories");
    }).catch((err) => {
        res.send(err);
    })
})

// view all others' stories :
router.get("/posts", auth, async (req,res)=>{
    var allOtherPosts;
    var allPosts = await Post.find({}).then((result)=>{
        allOtherPosts = result;
    }).catch((err)=>{
        res.send(err);
    })
    
    // await console.log(allOtherPosts);

    for(let i=0; i<allOtherPosts.length; i++){
        var post = allOtherPosts[i];
        await post.populate('author');
        if(post.author === req.user){
            console.log("Arindam created");
            allPosts.slice(i,1);
        }
    }
    await res.send(allOtherPosts);
})



// view story in full size
router.get("/posts/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        await post.populate('author');
        res.render("dashboard/fullStory", { sub: post.subject, desc: post.story, author: post.author.fullname }); 
    }
    catch (err) {
        res.send(err);
    }
})



// Delete a particular post :
router.delete("/posts/:id", function (req, res) {
    var id = req.params.id;
    Post.deleteOne({ _id: id }).then((res) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    })
})


module.exports = router;