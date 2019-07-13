var Comment=require("../models/comment.js");
var Order=require("../models/orders.js");

var middleware={};

middleware.commentOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.commentId,(err,comment)=>{
            if(err){
                res.redirect("back");
            }else{
               if( comment.author.id.equals(req.user._id)|| (req.user && req.user.isAdmin)){
                   next();
               }else{
                   res.redirect("back");
               }
            }
        });
    }else{
        res.redirect("back");
    }
}


middleware.orderOwnership = function(req,res,next){
    if(req.isAuthenticated){
        Order.findById(req.params.id,(err,order)=>{
            if(err){
                res.redirect("back");
            }else{
                if(req.user._id.equals(order.userId) || (req.user && req.user.isAdmin)){
                    next();
                }else{
                    res.redirect("back");
                }
            }
        });
        
        
    }
    
    
    
}

middleware.isLoggedIn= function(req,res,next){
    if(req.isAuthenticated()){
       return  next();
        
    }
    req.flash("error","Please login first!!!");
    res.redirect("/login");
}

middleware.isAuthor= function(req,res,next){
    if(req.user.isAdmin){
        return next();
    }
     req.flash("error","Please login with admin id first!!!!");
    res.redirect("/login");
};



module.exports=middleware;