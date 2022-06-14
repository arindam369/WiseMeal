const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET;
const auth = async (req,res,next)=>{
    try{
        const token = req.cookies.WiseMeal;
        const decoded = jwt.verify(token, JWT_SECRET);

        const authUser = await User.findOne({_id: decoded._id, "tokens.token": token});

        if(!authUser){
            throw new Error("Please Authenticate!... You are not logged in");
        }
        
        req.user = authUser;
        next();
    }
    catch(err){
        res.redirect("/login");
    }
}

module.exports = auth;