const express = require("express"),
	  Product=require("../models/products.js"),
	  News  = require("../models/news.js"),
	  router=express.Router();



router.get("/",(req,res)=>{
News.find({}, function(err, news) {
    if(err){
        req.flash("error","Something went wrong");

    }else{
            
            var regexDeal=new RegExp(escapeRegex("deal"),'gi');
            var regexSale=new RegExp(escapeRegex("sale"),'gi');
            Product.find({searchQuery:regexDeal},(err,deals)=>{
                    if(err){
                                req.flash("error","Something went wrong");
                    }else{
                           Product.find({searchQuery:regexSale},(err,sales)=>{

                               if(err){
                                       req.flash("error","Something went wrong");                 
                                }else{
                                res.render("home/index.ejs",{deals,sales }); 
                                }
                           });                 
                    }
            });
            
   		 }
  
	});
    
});

router.get("/sale",(req,res)=>{
	var regexSale=new RegExp(escapeRegex("sale"),'gi');
	Product.find({searchQuery:regexSale},(err,sales)=>{
		if(err){
			req.flash("error","Something went wrong");
		}else{
				res.render("home/sale.ejs",{sales:sales});
		}

	});
});



router.get("/deal",(req,res)=>{
	var regexDeal=new RegExp(escapeRegex("deal"),'gi');
	Product.find({searchQuery:regexDeal},(err,deals)=>{
		if(err){
			req.flash("error","Something went wrong");
		}else{
				res.render("home/deal.ejs",{deals:deals});
		}

	})
})








function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    
}

module.exports  = router;