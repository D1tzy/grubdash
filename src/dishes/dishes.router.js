const router = require("express").Router();
const controller = require("./dishes.controller")
const notAllowed = require("../errors/methodNotAllowed")

// TODO: Implement the /dishes routes needed to make the tests pass
router.route("/").get(controller.list).post(controller.create).all(notAllowed)

router.route("/:dishId").get(controller.read).put(controller.update).all(notAllowed)

module.exports = router;
