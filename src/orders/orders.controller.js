const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//returns a list of all orders
function list(req, res) {
    res.json({data: orders})
}

//verifies that the orderId is valid
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order)=> order.id === orderId)
    if (foundOrder) {
        res.locals.order = foundOrder
        return next()
    };
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`
    });
}

//returns an order based on its orderId
function readOrder(req, res, next) {
    const {order} = res.locals;
    res.json({data:order});
}

//checks to make sure that all fields necessary to create an order
function validateOrder(req,res,next) {
    const {data:order = {}} = req.body;
    if (!order.deliverTo) {
        next({
            status:400,
            message: `Order must include a deliverTo`
        })
    } else if (!order.mobileNumber) {
        next({
            status:400,
            message: `Dish must include a mobileNumber`
        })
    } else if(!order.dishes) {
        next({
            status:400,
            message: `Order must include a dish`
        })
    } else if(!Array.isArray(order.dishes)||!order.dishes.length) {
        next({
            status:400,
            message: `Order must include at least one dish`
        })
    } 
    //validates every dish in the dishes array
    order.dishes.forEach((dish, index) => {
        if ((!dish.quantity)||(dish.quantity<1)||(!Number.isInteger(dish.quantity))) {
            next({
                status:400,
                message:`Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    })
    res.locals.newOrder = order
    next();
}

//makes sure that the order Ids for update information and current match
function doIdsMatch(req, res, next) {
    const {newOrder} = res.locals
    const {orderId} = req.params
    if (orderId == newOrder.id || (!newOrder.id)) {
        next();
    } else {
        next({
            status:400,
            message: `Order id does not match route id. Order: ${newOrder.id}, Route: ${orderId}.`
        })
    }
}

//adds a provided order to the array of orders
function createOrder(req,res,next) {
    const {newOrder} = res.locals
    const createdOrder = {
        id: nextId(),
        ...newOrder
    }
    orders.push(createdOrder)
    res.status(201).json({data:createdOrder})
}

//updates an order while ensuring that its order.id is not overwritten
function updateOrder(req,res,next) {
    let {order,newOrder} = res.locals;
    order = {
        ...newOrder,
        id:order.id,
    };
    res.json({data:order})
}

//verifies that an order is pending and able to be cancelled
function canDelete(req, res, next) {
    const {order} = res.locals
    if (order.status === "pending") {
        next();
    } else {
        next({
            status:400,
            message:`An order cannot be deleted unless it is pending`,
        })
    }
}

//verifies that an order's status exists and is pending before modification
function canUpdate(req,res,next) {
    const {newOrder} = res.locals
    if (newOrder.status !== "pending") {
        next({
            status:400,
            message:`Order must have a status of pending, preparing, out-for-delivery, delivered`
        });
    } else if (newOrder.status === "delivered") {
        next({
            status:400,
            message:`A delivered order cannot be changed`
        });
    } else {
        next();
    };
}

//cancels an order and removes it from the order list
function cancelOrder(req,res,next) {
    const orderId = req.params.orderId
    const index = orders.findIndex((order) => order.id === orderId)
    if (index > -1) {
        orders.splice(index,1);
    }
    res.sendStatus(204);
}

module.exports = {
    list,
    read: [orderExists,readOrder],
    create: [validateOrder, createOrder],
    update: [orderExists, validateOrder, canUpdate, doIdsMatch, updateOrder],
    cancel: [orderExists, canDelete, cancelOrder],
}