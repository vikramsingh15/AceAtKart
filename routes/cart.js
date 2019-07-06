var express=require("express");
var Order=require("../models/orders.js");
var Product=require("../models/products.js");
var User=require("../models/user.js");
var Cart=require("../models/cart.js");
var router=express.Router();
var middleware=require("../middleware");
var nodemailer=require("nodemailer")


router.get("/cart",middleware.isLoggedIn,(req,res)=>{
	if(!req.user.cart){
		return res.render("buy/cart.ejs",{title:"Cart"})	
	}
	res.render("buy/cart.ejs",{cart:req.user.cart,title:"Cart"})
})

router.get("/add-to-cart/:p_id",middleware.isLoggedIn,(req,res)=>{

  let p_id=req.params.p_id;
	let cart=new Cart(req.user.cart ? req.user.cart:{})
	Product.findById(req.params.p_id,(err,product)=>{
		if(err){
			req.flash("error",err.message);
			return res.redirect("back");
		}else if(req.user.cart.items[p_id]){
    if(req.user.cart.items[p_id].qty>=req.user.cart.items[p_id].item.stock){
      req.flash("error",product.name+" could not be added to the cart exceeded maximum stock avalable !!!!!!!!");
      return res.redirect("back");
    }
  }

		cart.add(product,product.id);
		req.user.cart=cart;
		req.user.save();
		req.flash("success",product.name+" added to the cart !!!!!!!!");
		res.redirect("back");


	});

});

router.get("/reduce-by-one/:p_id",middleware.isLoggedIn,(req,res)=>{
	if(!req.user|| !req.user.cart){
		return res.redirect("back");
	}
	let cart=new Cart(req.user.cart ? req.user.cart:{});
	cart.reduceByOne(req.params.p_id);
	req.user.cart=cart;
	req.user.save();

	res.redirect("back");

})


router.get("/remove/:p_id",middleware.isLoggedIn,(req,res)=>{
	if(!req.user|| !req.user.cart){
		return res.redirect("back");
	}
	let cart=new Cart(req.user.cart ? req.user.cart:{});
	cart.remove(req.params.p_id);
	req.user.cart=cart;
	req.user.save();

	res.redirect("back");

});

router.get("/cart-order",middleware.isLoggedIn,  async (req,res)=>{
			
                    let order=new Order({userId:req.user.id,
                        cart:req.user.cart.items,
                        address:req.user.address,
                        city:req.user.city,
                        name:req.user.name});



					let arr=[];
					for(pId in order.cart){
						arr.push(pId);
					}	

					Product.find({'_id':{$in:arr}},(err,data)=>{

						data.forEach(product=>{
							product.stock-=order.cart[product._id].qty;
							product.save();
						})

					});


	                   
                    
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
                      from: 'Doodadofficial@gmail.com',
                      subject: 'Your Order '+"Cart" +" has been confirmed on AceAtKart",
                      text: 'Thank you for shopping with us. \n\n'+ 
                      "Your estimated delivery is with in 2 days of order placement\n\n"+
                      "If you would like to view the status of your order or make any changes to it,\n\n"+
                      "please visit Your Orders on"+'http://' + req.headers.host 
                      
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

                    
                   

                    
                    order.save((err,data)=>{
                      if(err){
                        return req.flash("error",err.message);
                      }else{
                      req.user.orderId.push(data.id);
                      
                    }
                    });

                    
                    let cart = new Cart(req.user.cart ? req.user.cart:{});
                    cart.orderPlaced();
                    req.user.cart=cart;
                    req.user.save()
                    res.redirect("/");
                   

          })
            






module.exports=router;