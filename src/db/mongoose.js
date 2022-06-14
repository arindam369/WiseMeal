require("dotenv").config();
const mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost:27017/wisemeal-api", {useNewUrlParser:true, useUnifiedTopology:true, autoIndex:true});

mongoose.connect(`mongodb+srv://wisemeal369:${process.env.MONGOOSE_PASS}@cluster0.ktkyasz.mongodb.net/wisemeal-api?retryWrites=true&w=majority`, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})