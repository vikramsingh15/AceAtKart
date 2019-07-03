var express=require("express");
var Comment=require("../models/comment.js");
var News=require("../models/news.js");
var router=express.Router();
var middleware=require("../middleware");


router.post("/news/:id/comment",middleware.isLoggedIn,(req,res)=>{
   News.findById(req.params.id,(err,newsData)=>{
       if(err){
           console.log(err);
       }else{
            Comment.create(req.body.comment,(err,commentData)=>{
                if(err){
                    console.log(err);
                }else{
                    commentData.author.id       =   req.user._id;
                    commentData.author.username =   req.user.username;
                    commentData.save();
                    newsData.comment.push(commentData);
                    newsData.save();
                    res.redirect("/news/"+req.params.id);
                }
            });
       }
   }) ;
});



//Create comment route
router.put("/news/:id/comment/:commentId",middleware.commentOwnership,(req,res)=>{
   Comment.findByIdAndUpdate(req.params.commentId,req.body.comment,(err,data)=>{
       if(err){
           req.flash("error",err.message);
           res.redirect("back");
       }else{
           req.flash("success","COMMENT UPDATED SUCCESSFULLY!!");
           res.redirect("/news/"+req.params.id);
       }
   }) ;
});

//Delete comment route
router.delete("/news/:id/comment/:commentId",middleware.commentOwnership,(req,res)=>{
   Comment.findByIdAndRemove(req.params.commentId,(err)=>{
       if(err){
           req.flash("error",err.message);
           res.redirect("back");
       }else{
           req.flash("success","COMMENT DELETED SUCCESSFULLY!!");
            res.redirect("/news/"+req.params.id);    
       }
   }) ;
});


module.exports=router;