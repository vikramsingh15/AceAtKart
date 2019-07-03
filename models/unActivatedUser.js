var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var unActivatedUserSchema=new mongoose.Schema({
   name:String,
   username:{type:String,unique:true,required:true},
   password:String,
   email:{type:String,unique:true,required:true},
   phone:String,
   address:String,
   city:String,
   country:String,
   resetPasswordToken:String,
   resetPasswordExpires:Date,
   isAdmin:{type:Boolean,default:false},
   orderId:[{
   
           type:mongoose.Schema.Types.ObjectId,
           ref:"order"
   }],
   cart:{}
});

unActivatedUserSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("unActivatedUser",unActivatedUserSchema);