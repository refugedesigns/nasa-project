const express = require("express");

const { httpGetAllLaunches, httpCreateLaunch, httpAbortLaunch } = require("./launches.controller");
const { validateLaunches } = require("../../validation/validate")
const router = express.Router();


router.get("/", httpGetAllLaunches);

router.post("/", validateLaunches, httpCreateLaunch);

router.delete("/:id", httpAbortLaunch)

module.exports = router;
