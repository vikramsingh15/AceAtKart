module.exports=function(oldCart){
this.items=oldCart.items||{};
this.totalPrice=oldCart.totalPrice||0;
this.totalQty=oldCart.totalQty||0;


this.add =function(item,id){
	let storedItem = this.items[id] ;
	if(!storedItem){
		storedItem=this.items[id]={item:item,price:0,qty:0}
	}
	
	storedItem.qty++;
	storedItem.price=item.price*storedItem.qty;

	this.totalPrice+=item.price;
	this.totalQty++;
}

this.reduceByOne=function(id){

	this.items[id].qty--;
	this.items[id].price-=this.items[id].item.price;
	this.totalPrice-=this.items[id].item.price;
	this.totalQty--;
	if(this.items[id].qty<=0){
		delete this.items[id];
	}

}

this.remove=function(id){
	this.totalPrice-=this.items[id].price;
	this.totalQty-=this.items[id].qty;
	delete this.items[id];
}

this.orderPlaced=function(){
	this.totalPrice=0;
	this.totalQty=0
	this.items={}
}





}