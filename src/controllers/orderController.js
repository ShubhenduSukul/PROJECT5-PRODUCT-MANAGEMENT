const orderModel = require('../models/orderModel')
const cartModel = require('../models/cartModel')
const userModel = require("../models/userModel")
const ObjectId = require('mongoose').Types.ObjectId

const createOrder = async function(req,res){ // input cancelable and status
    try{
        // validation of Objectid in params
        if(!ObjectId.isValid(req.params.userId)) return res.status(400).send({status:false,msg:'enter a valid objectId in params'})
        let user = await userModel.findById(req.params.userId);
        // !  status code doubt
        if(!user) return res.status(404).send({status:false,msg:'no user found'}) 

    
        // check authorisation of the user
        if(req.userId != req.params.userId) return res.status(403).send({status:false,msg:'you are not authorized'})

    //check body is empty or not
        if(Object.keys(req.body).length == 0 ) return res.status(400).send({status:false,msg:"enter the order details"})
        let cartId = req.body.cartId;

        if(!ObjectId.isValid(cartId)) return res.status(400).send({status:false,msg:"cartId is not valid"})

        let cart = await cartModel.findById(cartId)
        if(!cart) return res.status(404).send({status:false,msg:"unable to find the cart"})

        if(cart.userId.toString() !== req.params.userId) return res.status(403).send({status:false,msg:'you are not authorized to create order for this cart'})

        let totalQuantity = cart.items.reduce((a,b)=> a.quantity + b.quantity);
        console.log(totalQuantity)

        let data = {userId:cart.userId,items:cart.items,totalItems:cart.totalItems,totalPrice:cart.totalPrice, totalQuantity:totalQuantity}
        let order = await orderModel.create(data)
        return res.status(201).send({status:true,msg:"order created successfully", data : order})

    }catch(error){
        console.log(error)
        return res.status(500).send({status:false,msg:error.message})
    }
}

const updateOrder = async function(req,res){
    try{
        // validation of Objectid in params
        if(!ObjectId.isValid(req.params.userId)) return res.status(400).send({status:false,msg:'enter a valid objectId in params'})

        let user = await userModel.findById(req.userId);
        // !  status code doubt
        if(!user) return res.status(404).send({status:false,msg:'no user found'}) 

        // check authorisation of the user
        if(req.userId != req.params.userId) return res.status(403).send({status:false,msg:'you are not authorized'})



        //check body is empty or not
        if(Object.keys(req.body).length == 0 ) return res.status(400).send({status:false,msg:"enter the order details"})

       let {status,orderId} = req.body;

       if(!['completed', 'cancelled'].includes(status)) return res.status(400).send({status:false,msg:'status should take only cancelled, completed'})
       
       if(!ObjectId.isValid(orderId)) return res.status(400).send({status:false,msg:'orderId is not valid'})

       let order = await orderModel.findOne({isDeleted:false,_id:orderId});

       if(!order) return res.status(404).send({status:false,msg:'order is not present, create the order first'})

       if(order.status == 'completed') return res.status(400).send({status:false,msg:'order is already completed, cannot be changed now'})
       if(order.status == "cancelled") return res.status(400).send({status:false,msg:"order is already cancelled,cannot be changed now"})

       // for the order.status == "pending"
       if(order.cancellable == false && status == "cancelled") return res.status(400).send({status:false,msg:"order cannot be cancelled"})

       if(order.cancellable == true && status == "cancelled"){
          let  updatedOrder = await orderModel.findByIdAndUpdate(orderId, {status : status}, {new:true})
           return res.status(200).send({status:true,msg:'order is cancelled', data : updatedOrder})
       }
       if(status == "completed"){
        let  updatedOrder = await orderModel.findByIdAndUpdate(orderId, {status : status}, {new:true})
        return res.status(200).send({status:true,msg:'order is completed', data : updatedOrder})
       }


    }catch(error){
        return res.status(500).send({status:false,msg:error.message})
    }
}

module.exports.createOrder = createOrder;
module.exports.updateOrder = updateOrder;