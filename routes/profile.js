var express=require("express");

var User=require("../models/user.js");
var router=express.Router();
var middleware=require("../middleware");


router.get("/profile",middleware.isLoggedIn,(req,res)=>{
  res.render("user/profile.ejs");  
})

router.get("/editProfile",middleware.isLoggedIn,function(req,res){
    res.render("user/editProfile.ejs");
    
})

router.put('/editProfile', middleware.isLoggedIn, function(req, res){

    User.findById(req.user.id, function (err, user) {

        // todo: don't forget to handle err

        if (!user) {
            req.flash('error', 'No account found');
            return res.redirect('/editProfile');
        }

        // good idea to trim 
        
         user.phone = req.body.phone.trim();
         user.name = req.body.name.trim();
         user.address=req.body.address.trim();
         user.city=req.body.city.trim();
         user.country=req.body.country.trim();

     
        // don't forget to save!
        user.save(function (err) {
            if(err){
                req.flash("error","Your profile could not be updated please try again...")
                return res.redirect("/profile")
            }
            // todo: don't forget to handle err
            
            req.flash("success",user.name+" your profile updated succesfully!!");
            res.redirect('/profile/');
        });
    });
});

module.exports=router;