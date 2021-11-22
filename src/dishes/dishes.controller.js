const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res) {
    res.json({data: dishes})
}

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

function read(req, res, next) {
    const {dish} = res.locals;
    res.json({data:dish});
}

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

function createDish(req,res,next) {
    const {newDish} = res.locals
    const createdDish = {
        id: nextId(),
        ...newDish
    }
    dishes.push(createdDish)
    res.status(201).json({data:createdDish})
}

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