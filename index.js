require("dotenv").config();
const express = require("express");
const app = express();
require("./src/db/mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const userRouter = require("./src/routers/user");
const postRouter = require("./src/routers/post");
const cookieParser = require("cookie-parser");
const auth = require("./src/middleware/auth");
const emailjs = require("emailjs-com");


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(cookieParser());



app.get("/",function(req,res)
{
    res.render("index.ejs", {USER_ID: process.env.USER_ID, SERVICE_ID: process.env.SERVICE_ID, TEMPLATE_ID: process.env.TEMPLATE_ID});
})

app.get("/login",function(req,res)
{
    res.render("login.ejs");
})

app.get("/profile", auth, function(req,res)
{
    res.render("dashboard/profile.ejs");
})

app.get("/goals", auth, function(req,res)
{
    res.render("dashboard/goals.ejs");
})

app.get("/track", auth, function(req,res)
{
    res.render("dashboard/track.ejs");
})

app.get("/stories", auth, function(req,res)
{
    res.render("dashboard/stories.ejs");
})

app.get("/settings", auth, function(req,res)
{
    res.render("dashboard/settings.ejs");
})

app.get("/allstories", auth, function(req,res)
{
    res.render("dashboard/allStories.ejs");
})

app.get("/fullstory", auth, function(req,res)
{
    res.render("dashboard/fullStory.ejs");
})

app.get("/yourstories", auth, function(req,res)
{
    res.render("dashboard/yourStories.ejs");
})
app.get("/team",function(req, res){
    res.render("team");
})
app.get("/bViewData", function(req,res){
    res.render("dashboard/viewDetails", {heading: "Breakfast"});
})
app.get("/lViewData", function(req,res){
    res.render("dashboard/viewDetails", {heading: "Lunch"});
})
app.get("/dViewData", function(req,res){
    res.render("dashboard/viewDetails", {heading: "Dinner"});
})
app.get("/forgot", (req,res)=>{
    res.render("forgot-password");
})
app.get("/reset", (req,res)=>{
    res.render("reset-password");
})

app.use(userRouter);
app.use(postRouter);


app.listen(3000,function(){
    console.log("server is running on port 3000");
})


