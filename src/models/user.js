const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const userSchema = mongoose.Schema(
    {
        
        fullname: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        gender: {
            type: String,
            required: true
        },
        dob: {
            type: String,
            required: true
        },
        activity: {
            type: String,
            required: true
        },
        
        height: {
            type: Number,
            required: true
        },
        weight: {
            type: Number,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        avatar: Buffer,
        city: String,
        targetWeight: Number,
        wholeInterval: Number,
        tokens: [
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ],
        graphdata: [
            {
                currdate: String,
                calorieintake: Number,
                caloriebudget: Number
                    
                
            }
        ],
        bstring: String,
        lstring: String,
        dstring: String
        
    }
);

// We have the reference between the user and the post on a virtual.. It is not stored in the database
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
})


// Generate Auth tokens after every login of a user
const JWT_SECRET = process.env.JWT_SECRET;
userSchema.methods.generateAuthTokens = async function(){
    const authenticatedUser = this;
    const token = jwt.sign({_id: authenticatedUser._id.toString()}, JWT_SECRET, {expiresIn: "1 day"} );
    
    authenticatedUser.tokens = authenticatedUser.tokens.concat({token});
    await authenticatedUser.save();

    return token;
}


userSchema.statics.checkLoginCredentials = async (email,pass)=> {
    const registeredUser = await User.findOne({email : email});
    if(!registeredUser){
        throw new Error("Authentication Failed... User not registered");
    }
    const isMatch = await bcrypt.compare(pass, registeredUser.password);

    if(!isMatch){
        throw new Error("Authentication failed... Password mismatched");
    }

    return registeredUser;
}


// hashing password before saving user in db
userSchema.pre("save", async function(next){
    const user = this;

    if(user.isModified("password")){    // if user creates an account or change their password..only that time the pass should be hashed
        user.password = await bcrypt.hash(user.password, 8);    // salting round = 8
    }

    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;