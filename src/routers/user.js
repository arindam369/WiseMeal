const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const emailjs = require("emailjs-com");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());





// create user=============================
router.post("/users", function (req, res) {
    console.log(req.body);
    const newuser = new User(req.body);
    newuser.save().then(function (result) {
        res.redirect("/login");
    }).catch(function (err) {
        res.render("warning");
    })

})

// read all users=====================================
// router.get("/users", auth, function (req, res) {
//     User.find({}).then(function (result) {
//         res.send(result);
//     }).catch((err) => {
//         res.send(err);
//     })
// })

// read a particular================================================
// router.get("/users/:id", (req, res) => {
//     var id = req.params.id;
//     User.find({ _id: id }).then(function (result) {

//         if (!result) {
//             res.send("User not found");
//         }
//         res.send(result);
//     }).catch((err) => {
//         res.send(err);
//     })

// })

// update===================================

router.patch("/users/:id", auth, async function (req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["fullname", "password", "phone", "gender", "dob", "activity", "height", "weight", "city", "targetWeight", "wholeInterval", "graphdata"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates!" });
    }
    try {
        const updatedUser = await User.findById(req.params.id);
        updates.forEach((update) => updatedUser[update] = req.body[update]);
        await updatedUser.save();

        if (!updatedUser) {
            res.send("User not found in database");
        }
        res.send(updatedUser);
    }
    catch (error) {
        res.status(400).send(error);
    }

})

// delete==============================================
router.delete("/users/:id", function (req, res) {
    var id = req.params.id;
    User.deleteOne({ _id: id }).then((res) => {
        // res.send(result);
    }).catch((err) => {
        res.send(err);
    })
})

// Login a user ======================================
router.post("/users/login", async (req, res) => {
    try {
        const authenticatedUser = await User.checkLoginCredentials(req.body.email, req.body.pass);
        const token = await authenticatedUser.generateAuthTokens();

        res.cookie("WiseMeal", token, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true
        })
        res.redirect("/profile");
    }
    catch (err) {
        res.render("authFail");
    }
})

// logout a user :
router.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token !== req.cookies.WiseMeal;
        })
        await req.user.save();
        res.clearCookie("WiseMeal");
        res.redirect("/logout");
    }
    catch (error) {
        res.status(400).send(error);
    }
})

//logout all
router.get("/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.clearCookie("WiseMeal");
        res.redirect("/login");
    }
    catch (error) {
        res.status(400).send(err);
    }
})




// Read my profile
router.get("/user/me", auth, async function (req, res) {
    res.send(req.user);
})

// checking current password in settings
router.post("/user/isOldUser", async (req, res) => {
    try {
        const isOldUser = await User.checkLoginCredentials(req.body.email, req.body.pass);
        console.log(isOldUser);
        if (isOldUser) {

            return res.send(isOldUser);
        }
        res.status(400).send("Current password mismatched");
    }
    catch (error) {
        res.status(400).send("Password Password mismatched");
    }
})



//  View all of my posts :
router.get("/post/me", auth, async (req, res) => {
    const me = req.user;
    await me.populate('posts')
    res.send(me.posts);
})

router.get("/apiquery", auth, async (req, res) => {
    try {
        const me = req.user;
        var ans = {
            bstring: me.bstring,
            lstring: me.lstring,
            dstring: me.dstring
        }
        console.log(ans);
        res.send(ans);
    } catch (err) {
        console.log(err);
    }
})

router.patch("/apiquery", auth, async (req, res) => {
    const me = req.user;
    if (me.bstring == undefined) {
        me.bstring = req.body.bstring;
    }
    else {
        me.bstring += ", " + req.body.bstring;
    }

    if (me.lstring == undefined) {
        me.lstring = req.body.lstring;
    }
    else {
        me.lstring += ", " + req.body.lstring;
    }

    if (me.dstring == undefined) {
        me.dstring = req.body.dstring;
    }
    else {
        me.dstring += ", " + req.body.dstring;
    }
    me.save();

})

router.delete("/apiquery/b", auth, async (req, res) => {
    try {
        const me = req.user;
        me.bstring = undefined,
            me.save();
        res.redirect("/track");
    } catch (err) {
        res.send(err);
    }
})
router.delete("/apiquery/l", auth, async (req, res) => {
    try {
        const me = req.user;
        me.lstring = undefined,
            me.save();
        res.redirect("/track");
    } catch (err) {
        res.send(err);
    }
})
router.delete("/apiquery/d", auth, async (req, res) => {
    const me = req.user;
    me.dstring = undefined,
    me.save().then((result) => {
        res.redirect("/track");
    }).catch((err) => {
        res.send(err);
    });
})




// Uploading Avatar :
const storage = multer.memoryStorage();
const upload = multer({
    limits: 1000000,
    fileFilter(req,file,cb){
        if( file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/) ){
            cb(undefined, true);
        }
        else{
            cb(new Error("Please upload only jpg, jpeg or png files"));
            cb(undefined, false);
        }
    },storage
});

// here we are uploading avatar in our mongodb database :
router.post("/user/me/avatar", auth, upload.single("Avatar"), async (req,res)=>{
    console.log(req.file.buffer);
    req.user.avatar = req.file.buffer;
    await req.user.save();
    console.log("Avatar saved");
    res.redirect("/profile");
},(error,req,res,next)=>{
    console.log("Error");
    res.status(400).send({error: error.message});
})
// this "(error,req,res,next)" call signature tells express that the function is set up to handle any uncaught errors


// Fetching avatar from database :
router.get("/users/:id/avatar", async (req,res)=>{
    try{
        const avatarUser = await User.findById(req.params.id);
        if(!avatarUser || !avatarUser.avatar){
            return 0;
        }
        res.set("Content-Type", "image/jpg");
        res.send(avatarUser.avatar);
    }
    catch(err){
        res.send("No Avatar Found");
    }
})



const JWT_SECRET = process.env.JWT_SECRET;
// Forgot password :
router.post("/forgot", async (req,res)=>{
    const {email} = req.body;
    // console.log(email);

    const forgotUser = User.find({email}).then((result)=>{
        if(result.length==0){
            res.status(400).send("User Not Found");
            return;
        }

        const SECRET = JWT_SECRET + result[0].password;
        const token = jwt.sign({_id:result[0]._id, email:result[0].email}, SECRET, {expiresIn: "5m"});

    //     emailjs.init(process.env.USER_ID);

    //     const params = {
    //         "email_id": email,
    //         "message" : `hello`
    //     }
    //     emailjs.send(process.env.SERVICE_ID, process.env.TEMPLATE_ID, params).then(function (res) {
    //         console.log(res);
    //         // alert("sent successfully");
    //     },
    //         reason => {
    //             // alert("Error occured");
    //             console.log("Error");
    //         })
    // })


        const link = `http://localhost:3000/reset/${result[0]._id}/${token}`;
        // console.log(`Link : http://localhost:3000/reset/${result[0]._id}/${token}`);
        // console.log(link);
        res.render("link", {LINK: link, EMAIL: email});
        
        // res.send("Reset link has been generated and has been sent to your associated email account...");

    })
})


router.get("/reset/:id/:token", (req,res)=>{
    const {id, token} = req.params;

    const forgotUser = User.find({_id: id}).then((result)=>{
        if(result.length==0){
            res.send("Invalid ID ...");
            return;
        }

        const SECRET = JWT_SECRET + result[0].password;
        const firstName = result[0].fullname.split(" ")[0];

        try{
            const payload = jwt.verify(token, SECRET);
            res.render("reset-password", {name: firstName, userId: result[0]._id});
        }catch(err){
            res.send(err);
        }
    })
})

router.post("/reset/:id/:token", (req,res)=>{
    const {id, token} = req.params;
    const {pass1, pass2} = req.body;

    const forgotUser = User.find({_id: id}).then((result)=>{
        if(result.length==0){
            res.send("Invalid ID ...");
        }
        result[0].password = pass1;
        result[0].save();
        res.redirect("/login");
        
    }).catch((err)=>{
        res.send(err);
    })

})


module.exports = router;