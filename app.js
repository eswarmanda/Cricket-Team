const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeServerAndDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("this server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`error: ${e.message}`);
  }
};

initializeServerAndDatabase();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
// Get all players in the team
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM cricket_team`;
  const playerList = await db.all(getPlayerQuery);
  response.send(playerList.map((eachPlayer) =>
convertDbObjectToResponseObject(eachPlayer)
)
);
});

// Create a new player in Database
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const createPlayerQuery = `
  INSERT INTO 
    cricket_team ( player_name, jersey_number, role) 
  VALUES
  (
      '${player_name}',
      '${jersey_number}',
      '${role}'
  );`;
  const dbResponse = await db.run(createPlayerQuery);
  const player_id = dbResponse.lastID;
  response.send("Player Added to Team");
});

// get player id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// update player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
        player_name = '${player_name}',
        jersey_number = '${jersey_number}',
        role = '${role}'
    WHERE
        player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
// delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
DELETE FROM 
    cricket_team
WHERE
    player_id = ${playerId};`;
await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
