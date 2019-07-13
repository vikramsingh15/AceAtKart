var express=require("express");
var Order=require("../models/orders.js");
var Product=require("../models/products.js");
var User=require("../models/user.js");
var router=express.Router();
var middleware=require("../middleware");
var nodemailer=require("nodemailer");
var PlacedOrder=require("../models/placedOrder");




router.get("/buy/:id",middleware.isLoggedIn,(req,res)=>{
    var qty;
    Product.findById(req.params.id,(err,product)=>{
       if(err){
           req.flash('error', err.message);
            return  res.redirect('back'); 
       }
       if(req.query.qty){
            res.render("buy/index.ejs",{product:product,qty:req.query.qty});
       }
       else{
            res.render("buy/index.ejs",{product:product,qty:1});
       }
      
       
    });
});


router.get("/orderPlaced/:productId/:qty",middleware.isLoggedIn,  (req,res)=>{
                let productId=req.params.productId;
                Product.findById(productId,function(err,product){
                    let price=req.params.qty*product.price;
                    let order=new Order({userId:req.user.id,
                        cart:{[productId]:{item:product,price:price,qty:req.params.qty}},
                        address:req.user.address,
                        city:req.user.city,
                        name:req.user.name});
	                   
                    
                    let smtpTransport = nodemailer.createTransport(
                          {
                            service:"Gmail",
                            auth: {
                              user: 'vikram.devops15@gmail.com',
                              pass: process.env.pw
                            }
                          }

                      );
                    let mailOptions={
                      to: req.user.email,
                      from: "vikram.devops15@gmail.com",
                      subject: 'Your Order '+product.name +" has been confirmed on AceAtKart",
                      text: 'Thank you for shopping with us. \n\n'+ 
                      "Your estimated delivery is with in 2 days of order placement\n\n"+
                      "If you would like to view the status of your order or make any changes to it,\n\n"+
                      "please visit Your Orders on"+' http://' + req.headers.host 
                      
                    }
                      smtpTransport.sendMail(mailOptions, function(err) {

                        if(err){
                         req.flash("error",
                           "Dear customer your order has been placed successfully but we have problem in email "+ 
                           "service plese directly contact our team!!");   
                        }
                      });

                    req.flash("success",
                    "Dear customer your order has been placed successfully!!");


                    
                    product.stock=  product.stock-req.params.qty;

                    product.save();
                    order.save((err,data)=>{
                      if(err){
                        return req.flash("error",err.message);
                      }else{
                      req.user.orderId.push(data.id);

                    }
                    });
                    
                    
                    req.user.save()
                    res.redirect("/");
                    });

          })
            
      

 
router.get("/console",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{
   Order.find({},(err,data)=>{
       if(err){
           req.flash('error', err.message);
            return  res.redirect('back'); 
       }

       
       res.render("buy/orders.ejs",{data:data});
   })
   }) 








router.delete("/console/:id",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{
    Order.findByIdAndDelete(req.params.id, (err,data)=>{
        if(err){
            req.flash('error', err.message);
            return  res.redirect('back'); 
        }
        User.findById(data.userId,(err,user)=>{
            if(err){
                req.flash('error', err.message);
                return  res.redirect('back'); 
            }else{

           const placedOrder={
            userId:user.id,
            cart:data.cart,
            address:data.address,
            city:data.city,
            name:data.name,

           }   
            
        PlacedOrder.create(placedOrder,(err)=>{

          if(err){
              req.flash("error",err.message)
              return res.redirect("back");
          }
        

          var removeOrder = {id:req.params.id};
          user.orderId = user.orderId.filter(function(item){
              return item!=removeOrder;
          });
        
              user.save();
              req.flash('success', "Ordered Placed successfully!!!");
              res.redirect("back");
        })
            
                
            
            }
        })
        
    });
});




router.get("/myorder",middleware.isLoggedIn,(req,res)=>{
   
        Order.find({userId:req.user.id},(err,data)=>{
          if(err){
          req.flash('error', err.message);
          return  res.redirect('back'); 
        }else{
            
             res.render("myorder.ejs",{data:data});
            
        }
            })
           
       
});


router.get("/deliveredOrder",middleware.isLoggedIn,(req,res)=>{
   PlacedOrder.find({userId:req.user._id},(err,data)=>{
       if(err){
           req.flash("error",err.message);
            return  res.redirect('back'); 
       }else{
           
           res.render("user/deliveredOrder",{data,title:"Placed-orders"})
           
           
       }
   }) ;
    
});






router.delete("/cancelOrder/:id",middleware.isLoggedIn,middleware.orderOwnership,(req,res)=>{ 
    User.findById(req.user.id,(err,user)=>{
        if(err){
            req.flash('error', err.message);
            return  res.redirect('back'); 
        }else{
           
            
            var removeOrder = {id:req.params.id};
            user.orderId = user.orderId.filter(function(item){
                return item!=removeOrder;
            });
            user.save();
            
            Order.findByIdAndDelete(req.params.id,(err,order)=>{
            if(err){
                req.flash('error', err.message);
                return  res.redirect('back'); 
            }

            let arr=[];
            for(pId in order.cart){
              arr.push(pId);
            } 

           Product.find({'_id':{$in:arr}},(err,data)=>{
            if(err){
                req.flash('error', err.message);
                return  res.redirect('back'); 
            }
            
            data.forEach(product=>{
              product.stock+=Number(order.cart[product._id].qty);
              product.save();
            })
               
                req.flash('success', "Ordered Cancelled successfully!!!");
                 res.redirect("back");
            })
            
    })
        }
    })
})


module.exports=router;


