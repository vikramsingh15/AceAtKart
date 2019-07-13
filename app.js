require("dotenv").config();
var express=require("express"),
     app=express(),
     bodyParser=require("body-parser"),
     methodOverride  = require("method-override"),
     flash=require("connect-flash"),
     passport=require("passport"),
     localStrategy=require("passport-local"),
     passportLocalMongoose=require("passport-local-mongoose"),
     session=require("express-session"),   
    MongoStore = require('connect-mongo')(session),
     async=require("async"),
     nodemailer=require("nodemailer"),
     crypto=require("crypto"),
     User=require("./models/user.js"),
     mongoose = require("mongoose");

     
     var    newsRoute           =   require("./routes/news.js"),
            commentRoute        =   require("./routes/comment.js"),
            productRoute        =   require("./routes/product.js"),
            buyRoute            =   require("./routes/buy.js"),
            profileRoute        =   require("./routes/profile.js"),
            indexRoute          =   require("./routes/index.js"),
            homeRoute           =   require("./routes/home.js");
            cartRoute           =   require("./routes/cart.js");


     
     
app.use(flash());
app.use(methodOverride("_method"));
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

app.locals.moment=require("moment");


var url=process.env.databaseUrl || "mongodb://localhost:27017/ecommerce";

mongoose.connect(url,{useNewUrlParser:true});


app.set("view engine","ejs");
mongoose.set('useCreateIndex', true);


/********************Oauth************************/

app.use(session({
    secret:"Ecom",
    resave:false,
    signed:true,
    saveUninitialized: false,
    store:new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie:{maxAge:180*60*1000}
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/********************Oauth************************/



app.use(function(req,res,next){
    res.locals.currentUser=req.user;
   res.locals.error= req.flash("error");
   res.locals.success=req.flash("success");
   res.locals.title="AceAtKart";
   res.locals.description="AceAtKart is an Indian e-commerce website, vending gadget supplies. It strives to provide gadget supplies like headphones, customised USB cables and many more. Supplies are affordable and of good quality. Also, Imparting you hassle free delivery to your doorstep.";
   res.locals.image=null;
   if(req.user&&req.user.cart){
        res.locals.cartQty=req.user.cart.totalQty||0;
    }else{
        res.locals.cartQty=0;
    }

   next();
});




app.use(newsRoute);
app.use(commentRoute);
app.use(productRoute);
app.use(buyRoute);
app.use(profileRoute);
app.use(indexRoute);
app.use(homeRoute);
app.use(cartRoute);




app.get("/privacy",(req,res)=>{
    res.render("privacy.ejs");
    
});



var https = require("https");
setInterval(function() {
    https.get("https://evening-plateau-48245.herokuapp.com/");
}, 900000); // every 15 minutes (900000)



app.listen(process.env.PORT, function(){
    console.log("Server has started!!! ",process.env.Port);
});

