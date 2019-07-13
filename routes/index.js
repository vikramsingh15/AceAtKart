var express=require("express");

var User=require("../models/user.js");
var router=express.Router();
var middleware=require("../middleware");
var passport=require("passport");
var mongoose=require("mongoose");
var async=require("async"),
     nodemailer=require("nodemailer"),
     crypto=require("crypto");
     


var Unactivated=require("../models/unActivatedUser.js")


//*********************Sign up******************
router.get("/register",(req,res)=>{
    res.render("user/register.ejs");
});









router.post("/activateAccount",(req,res,next)=>{
    
     var newUser = {
    name:req.body.name,
    username:req.body.username,
    email:req.body.email,
    phone:req.body.phone,
    address:req.body.address,
    city:req.body.city,
    country:req.body.country
    };
    
    Unactivated.create(newUser,(err,user)=>{
        if(err){
            
            req.flash("error",err.message);
            res.redirect("/register");
        }else{
            
             async.waterfall([
        function(done){
            crypto.randomBytes(20,function(err,buf){
                
                var token=buf.toString('hex');
                done(err,token);
            });
        },
        function(token,done){
            var smtpTransport=nodemailer.createTransport({
                service:"Gmail",
                auth:{
                    user:"vikram.devops15@gmail.com",
                    pass:process.env.pw
                }
            });
            
            var mailOptions={
                to:newUser.email,
                from:"vikram.devops15@gmail.com",
                subject:"Confirm your account on AceAtKart",
                text:"Thanks for signing up with AceAtKart! You must follow this link to activate your account:\n\n"+
                
                'https://' + req.headers.host + '/activateAccount/' + token +"/"+user.id+ '\n\n' +
                "Have fun, and don't hesitate to contact us with your feedback.\n\n"+
                "https://AceAtKart.com"
            };
            
            smtpTransport.sendMail(mailOptions,function(err) {
                 req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions to activate your AceAtKart account.');
                 done(err, 'done');
            });
           
            
            
        }
        
        
        ],function(err){
            if(err) return next(err);
            res.redirect("/activateAccount");
        });
        
        res.render("user/activateAccountMessage.ejs",{email:newUser.email});
            
        }
        
        
        
    })
    
   
    
});

router.get("/activateAccount/:token/:id",(req,res)=>{
    
    Unactivated.findById(req.params.id,(err,user)=>{
        if(err){
             return req.flash("error",err.message);
        }else{
             res.render("user/activateAccount.ejs",{data:user});
        }
    });
  
});


router.post("/register",(req,res)=>{
    var newUser = new User({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email,
    phone:req.body.phone,
    address:req.body.address,
    city:req.body.city,
    country:req.body.country
    });
     
    if(req.body.password===req.body.confirm){
     
        User.register(newUser,req.body.password,(err,user)=>{
        if(err){
            req.flash("error",err.message);
            res.redirect("/register");
            
        }else{
          
              req.flash("success","Successfully signed up "+req.body.username+" now please login in your browser");
              res.redirect("/login");
       
        }
    });
    }else{
         req.flash("error", "Passwords do not match.");
            return res.redirect('back');
    }
    
});



//*************************************************************************************************

router.get("/login",(req,res)=>{
   res.render("user/login.ejs"); 
});


router.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash: true 
}),(req,res)=>{
    
});

router.get("/logout",(req,res)=>{
    req.logout();
     req.flash("success","You are logged out ");
    res.redirect("/"); 
    
});




//***************forgot password****************

router.get('/forgot', function(req, res) {
  res.render('user/forgot.ejs');
});


router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
        
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: "vikram.devops15@gmail.com",
          pass: process.env.pw
        }
      });
      var mailOptions = {
        to: user.email,
        from: "vikram.devops15@gmail.com",
        subject: 'AceAtKart Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});


router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('user/reset.ejs', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: "vikram.devops15@gmail.com",
          pass: process.env.pw
        }
      });
      var mailOptions = {
        to: user.email,
        from: "vikram.devops15@gmail.com",
        subject: 'Your password has been changed',
        text: 'Hello customer,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

//forgot password ********************************

module.exports=router;