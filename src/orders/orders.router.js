const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

//route to access the array of orders as a whole
router.route("/")
.get(controller.list)
.post(controller.create)
.all(methodNotAllowed);

//route for individual order access and manipulation
router.route("/:orderId")
.get(controller.read)
.put(controller.update)
.delete(controller.cancel)
.all(methodNotAllowed);

module.exports = router;
