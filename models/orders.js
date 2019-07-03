var mongoose=require("mongoose");


var orderSchema = new mongoose.Schema({
    userId:String,
    cart:{},
    address:String,
    city:String,
    created:{type:Date,default:Date.now},
    name:String
 
    
});
module.exports=mongoose.model("order",orderSchema);
