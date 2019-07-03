var mongoose=require("mongoose");


var newsSchema = new mongoose.Schema({
    image:String,
    
    imageUrl:String,
    title:String,
    subtitle:String,
    author:String,
    body:String,

    created:{type:Date,default:Date.now},
    comment:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"comment"
        }
        ],
        meta:String
    
    
    
});
module.exports=mongoose.model("news",newsSchema);
