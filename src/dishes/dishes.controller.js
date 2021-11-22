const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//returns a list of all dishes
function list(req, res) {
    res.json({data: dishes})
}

//verifies that the dishId is valid
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish)=> dish.id === dishId)
    if (foundDish) {
        res.locals.dish = foundDish
        return next()
    };
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    });
}

//returns a dish based on its dishId
function read(req, res, next) {
    const {dish} = res.locals;
    res.json({data:dish});
}

//checks to make sure that all fields necessary to create an order
function validateDish(req,res,next) {
    const{data: dish = {}} = req.body;
    if (!dish.name) {
        next({
            status:400,
            message: `Dish must include a name`
        })
    } else if (!dish.description) {
        next({
            status:400,
            message: `Dish must include a description`
        })
    } else if(!dish.price) {
        next({
            status:400,
            message: `Dish must include a price`
        })
    } else if(!(Number.isInteger(dish.price)) || dish.price <= 0) {
        next({
            status:400,
            message: `Dish must have a price that is an integer greater than 0`
        })
    } else if (!dish.image_url) {
        next({
            status:400,
            message: `	Dish must include a image_url`
        })
    } else {
        res.locals.newDish = dish
        next();
    }
}

//adds a provided dish to the array of dishes
function createDish(req,res,next) {
    const {newDish} = res.locals
    const createdDish = {
        id: nextId(),
        ...newDish
    }
    dishes.push(createdDish)
    res.status(201).json({data:createdDish})
}

//makes sure that the dish Ids for update information and current match
function doIdsMatch(req, res, next) {
    const {newDish} = res.locals
    const {dishId} = req.params
    if (dishId == newDish.id || (!newDish.id)) {
        next();
    } else {
        next({
            status:400,
            message: `Dish id does not match route id. Dish: ${newDish.id}, Route: ${dishId}`
        })
    }
}

//updates a dish while ensuring that its dish.id is not overwritten
function updateDish(req,res,next) {
    let {dish,newDish} = res.locals;
    dish = {
        ...newDish,
        id:dish.id,
    };
    res.json({data:dish})
}

module.exports = {
    list,
    read: [dishExists, read],
    create: [validateDish, createDish],
    update: [dishExists, validateDish, doIdsMatch, updateDish]
}