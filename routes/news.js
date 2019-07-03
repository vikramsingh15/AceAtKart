var express=require("express");
var News=require("../models/news.js");
var router=express.Router();
var middleware=require("../middleware");



router.get("/news",(req,res)=>{
    
    var noMatch=null;
    if(req.query.search){
    
        var regex=new RegExp(escapeRegex(req.query.search),'gi');
        News.find({title:regex},(err,search)=>{
            if(err){
                console.log(err);
            }else{
            if(search.length<1){
                noMatch=" :( News not found please try again.......";
            }
              res.render("news/index.ejs",{datas:search,noMatch:noMatch});   
            }
        });
        
    }else{
    News.find({},(err,foundNews)=>{
        if(err){
            console.log(err.message);
        }else{
            res.render("news/index.ejs",{datas:foundNews,noMatch:noMatch});
        }
    });
    }
});

router.get("/news/new",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{
    
   res.render("news/new.ejs"); 
    
});

router.post("/news",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{
   
    
    News.create(req.body.news,(err,data)=>{
       if(err){
           console.log(err.message);
       } else{
          req.flash('success', "Successfully created !!!");
           res.redirect("/news");
       }
        
    });
});

router.get("/news/:id",(req,res)=>{
    
    News.findById(req.params.id).populate("comment").exec((err,news)=>{
        if(err){
            console.log(err.message);
        }else{
            res.render("news/show.ejs",{data:news});
        }
        
    });
    
});

router.get("/news/:id/edit",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{
    News.findById(req.params.id,(err,news)=>{
        if(err){
            console.log(err.message);
        }else{
             res.render("news/edit.ejs",{data:news}) ;
        }
    });

});

router.put("/news/:id",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{
    
   News.findByIdAndUpdate(req.params.id,req.body.news,(err,news)=>{
       if(err){
            console.log(err.message);
        }else{
            req.flash('success', "Successfully updated !!!");
             res.redirect("/news/"+req.params.id);
        }
   }); 
});

router.delete("/news/:id",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{
   News.findByIdAndDelete(req.params.id,(err)=>{
       if(err){
           console.log(err.message);
       }else{
           req.flash('success', "Successfully deleted !!!");
           res.redirect("/news");
       }
   }); 
});



function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    
}


module.exports=router;
