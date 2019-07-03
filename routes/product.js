var express=require("express");
var Product=require("../models/products.js");

var router=express.Router();
var middleware=require("../middleware");

//*************multer******************************

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dxkrfrwzc', 
  api_key: 665587122729671, 
  api_secret: process.env.api_secret
});

//multer****************************





router.get("/products",(req,res)=>{
    
    var noMatch=null;
    if(req.query.search){
    
        var regex=new RegExp(escapeRegex(req.query.search),'gi');
        Product.find({searchQuery:regex},(err,searchProduct)=>{
            if(err){
                console.log(err);
            }else{
            if(searchProduct.length<1){
                noMatch=" :( Product not found please try again.......";
            }
              res.render("products/index.ejs",{products:searchProduct,noMatch:noMatch});   
            }
        });
        
        
    }else{
        Product.find({},(err,allProducts)=>{
        if(err){
            req.flash("error","Oops something went wrong");
            return res.redirect("back");
        }
             
        res.render("products/index.ejs",{products:allProducts,noMatch:noMatch});
        
    });
    }
   
});




router.get("/products/new",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{

        res.render("products/new.ejs");
});










router.post("/products",upload.array("image",2),middleware.isLoggedIn,middleware.isAuthor,async (req,res)=>{
    var x=[];

    
   try{
        
         for(let i=0;i<=1;i++){
        
             await cloudinary.v2.uploader.upload(req.files[i].path,function(err,result){
              x.push({url:result.secure_url,id:result.public_id});
                 
                 
             });
        }
    
    }catch(err){
         req.flash('error', err.message);
        return  res.redirect('back'); 
    }
    req.body.products.image=x;
   req.body.products.customerSaving=req.body.products.mrp-req.body.products.price;
   req.body.products.discountPercent=(req.body.products.customerSaving/req.body.products.mrp)*100;
  Product.create(req.body.products, function(err, product) {
    if (err) {
      req.flash('error', err.message);
       res.redirect('back');
    }else{
     res.redirect("/products/"+product.id);   
    }
    
  });
 
    
 
    
});






router.get("/products/:id",(req,res)=>{
    let noMatch=false;

   Product.findById(req.params.id,(err,data)=>{
       if(err){
          req.flash('error', err.message);
        res.redirect('back'); 
       }else{
        
        if(data.otherProduct){
             var regex=new RegExp(escapeRegex(data.otherProduct),'gi');
             Product.find({searchQuery:regex},(err,otherProduct)=>{
                  
                 if(err){
                     console.log(err);
                 }else{

                 if(otherProduct.length>0){
                     noMatch=true;
                 }
                   res.render("products/show.ejs",{otherProduct:otherProduct,
                    noMatch:noMatch,
                    data:data,
                    title:data.name,
                    description:data.description,
                    image:data.image[0].url});   
                 }
             });   
        
       }else{
            res.render("products/show.ejs",{noMatch:noMatch,data:data})
            }
                   
       }
   }) 
});


router.get("/products/:id/edit",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{
   Product.findById(req.params.id,(err,data)=>{
       if(err){
          req.flash('error', err.message);
           return  res.redirect('back'); 
       }

       res.render("products/edit.ejs",{data:data});
   }) ;
});

router.put("/products/:id",upload.array('image'),middleware.isLoggedIn,middleware.isAuthor, function(req,res){
    
    var x=[];
    Product.findById(req.params.id, async function(err,product){
       if(err){
            req.flash('error', err.message);
           return  res.redirect('back'); 
       }
       
       if(req.files[0] && req.files[1]){
           for(let i=0;i<=1;i++){
                       try{
                           
                           await cloudinary.v2.uploader.destroy(product.image[i].id);
                           var result = await cloudinary.v2.uploader.upload(req.files[i].path);
                           x.push({url:result.secure_url,id:result.public_id});
                           req.body.products.image=x;

                          
                       }catch(err){
                        
                           req.flash('error', "something went wrong..");
                         return  res.redirect('back'); 
                       }
                       
           }
       }
       
      req.body.products.customerSaving=req.body.products.mrp-req.body.products.price;
      req.body.products.discountPercent=(req.body.products.customerSaving/req.body.products.mrp)*100;
      Product.findByIdAndUpdate(req.params.id,req.body.products,(err,data)=>{
       if(err){
          req.flash('error', err.message);
          
          return  res.redirect('back'); 
       }
       req.flash("success","product updated successfully...")
       res.redirect("/products/"+req.params.id);
   });
       
   }); 
   
});


router.delete("/products/:id",middleware.isLoggedIn,middleware.isAuthor,(req,res)=>{
    Product.findByIdAndDelete(req.params.id,async function(err,data){
        if(err){
            req.flash('error', err.message);
             return  res.redirect('back'); 
        }
        try{
            for(var i=0;i<=1;i++){
                await cloudinary.v2.uploader.destroy(data.image[i].id);
            }
            
            
        }
        catch(err){
            req.flash('error', err.message);
             return  res.redirect('back'); 
        }
        
        req.flash("success","Product deleted successfully!!!");
        res.redirect("/");
        
        
    });
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    
}


module.exports=router;