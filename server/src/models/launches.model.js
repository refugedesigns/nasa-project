const launches = require("./launches.schema");

const DEFAULT_FLIGHT_NUMBER = 100

async function getAllLaunches() {
  return await launches.find({}, "-__v").populate({path: "target", select: "-createdAt -updatedAt -__v -_id"})
}

async function saveLaunch(launch) {
  return await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne({}).sort("-flightNumber")
  if(!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = await getLatestFlightNumber() + 1
  const newLaunch = Object.assign(launch, {
    customers: ["Zero to Mastery", "NASA"], 
    flightNumber: newFlightNumber
  })

  return await saveLaunch(newLaunch)
}

async function existsLaunchWithId(launchId) {
  return await launches.findOne({flightNumber: launchId})
}

async function abortLaunch(launchId) {
  const aborted = await launches.updateOne({flightNumber: launchId}, {upcoming: false, success: false})
  return aborted.acknowledged === true && aborted.matchedCount === 1
}

module.exports = {
  saveLaunch,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunch
};
