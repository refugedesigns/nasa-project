const asyncHandler = require("express-async-handler");

const {
  scheduleNewLaunch,
  getAllLaunches,
  existsLaunchWithId,
  abortLaunch,
} = require("../../models/launches.model");
const getPagination = require("../../utils/query");

const httpGetAllLaunches = asyncHandler(async (req, res, next) => {
  const { skip, limit } = getPagination(req.query)
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
});

const httpCreateLaunch = asyncHandler(async (req, res) => {
  let { mission, rocket, launchDate, target } = req.body;

  launchDate = new Date(launchDate);
  if (isNaN(launchDate)) {
    return res.status(400).json({ error: "Invalid launch date" });
  }
  if (!launchDate) {
    return res.status(400).json({ error: "Missing required launch property" });
  }

  const newLaunch = {
    mission,
    rocket,
    launchDate,
    target
  };
  await scheduleNewLaunch(newLaunch);
  return res
    .status(201)
    .json({ message: "launch created successfully", mission, launchDate });
});

const httpAbortLaunch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const launchId = parseInt(id);
  console.log(launchId);
  if (!(await existsLaunchWithId(launchId))) {
    return res.status(404).json({ error: "Launch does not exists" });
  }

  const aborted = await abortLaunch(launchId);
  if (!aborted) {
    return res.status(400).json({ error: "Launch not aborted" });
  }
  return res.status(200).json({ ok: true });
});

module.exports = {
  httpGetAllLaunches,
  httpCreateLaunch,
  httpAbortLaunch,
};
