const express = require("express");
const router = express.Router();
const { rootCauseService } = require("../services/masterData.service");
const { createMasterDataController } = require("../controllers/masterData.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const ctrl = createMasterDataController(rootCauseService);

router.get("/",        authenticate, ctrl.getAll);
router.get("/:id",     authenticate, ctrl.getById);
router.post("/",       authenticate, authorize(["admin"]), ctrl.create);
router.patch("/:id",   authenticate, authorize(["admin"]), ctrl.update);
router.delete("/:id",  authenticate, authorize(["admin"]), ctrl.remove);

module.exports = router;