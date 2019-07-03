var mongoose=require("mongoose");
var mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');
 
var productSchema = new mongoose.Schema({
    
   name:String,
   image:[{
      url:String,
      id:String
   },{
      url:String,
      id:String
   }],
   mrp:Number,
   price:Number,
   deliveryPrice:String,
   customerSaving:Number,
   description:String,
   technicalDetails:String,
   additionalInfo:String,
   discountPercent:Number,
   stock:Number,
   searchQuery:String,
   otherProduct:String
   
   
});
productSchema.plugin(mongoose_fuzzy_searching, {fields: ['name']});

module.exports=mongoose.model("product",productSchema);