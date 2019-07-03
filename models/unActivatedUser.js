var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var unActivatedUserSchema=new mongoose.Schema({
    name:String,
    username:{type:String,unique:true,required:true},
    email:{type:String,unique:true,required:true},
    phone:String,
    address:String,
    city:String,
    country:String
    
    
    
});

unActivatedUserSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("unActivatedUser",unActivatedUserSchema);