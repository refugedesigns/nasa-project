const axios = require("axios");

const launches = require("./launches.schema");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function getAllLaunches(skip, limit) {
  return await launches
    .find({}, "-__v")
    .populate({ path: "target", select: "-createdAt -updatedAt -__v -_id" }).sort({flightNumber: 1}).skip(skip).limit(limit);
}

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if(response.status !== 200) {
    console.log("Problem downloading launch data")
    throw new Error("Launch data download failed")
  }

  const launchData = response.data.docs.map((res) => ({
    flightNumber: res.flight_number,
    mission: res.name,
    rocket: res.rocket.name,
    launchDate: res.date_local,
    customers: res.payloads.flatMap((payload) => payload.customers),
    upcoming: res.upcoming,
    success: res.success,
  }));
  

  launchData.map(async(launch) => await saveLaunch(launch))
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launches already loaded!");
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
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
  const latestLaunch = await launches.findOne({}).sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch) {
  const targetPlanet = await getPlanet(target);
  if (!targetPlanet) {
    throw new Error("No matchin target found!");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    customers: ["Zero to Mastery", "NASA"],
    flightNumber: newFlightNumber,
  });

  return await saveLaunch(newLaunch);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function abortLaunch(launchId) {
  const aborted = await launches.updateOne(
    { flightNumber: launchId },
    { upcoming: false, success: false }
  );
  return aborted.acknowledged === true && aborted.matchedCount === 1;
}

module.exports = {
  saveLaunch,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunch,
  loadLaunchData,
};