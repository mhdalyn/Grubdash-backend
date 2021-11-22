const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

//route to access the array of dishes as a whole
router.route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

//route for individual dish access and manipulation
router.route("/:dishId")
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed);

module.exports = router;
