const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all trucks
router.get("/", (req, res) => {
  const sql = "SELECT id, name, role, description, image_url FROM trucks";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Get worker by ID with logs
// Get truck by ID with logs + tracker data
router.get("/:id", (req, res) => {
  const truckId = req.params.id;

  const truckSql = "SELECT * FROM trucks WHERE id = ?";
  const logsSql = `
    SELECT 
      id,
      truck_id,
      current_location,
      hours_worked,
      fuel_consumption,
      state,
      weight,
      distance_travelled,
      log_time
    FROM truck_logs
    WHERE truck_id = ?
    ORDER BY log_time;
  `;

  const trackerSql = `
    SELECT 
      id,
      truck_id,
      device_id,
      timestamp,
      latitude,
      longitude,
      altitude,
      speed_kmph,
      heading_degrees,
      ignition,
      battery_level,
      signal_strength,
      gps_fix,
      event_type,
      event_description,
      geofence_alert
    FROM truck_tracker_data
    WHERE truck_id = ?
    ORDER BY timestamp DESC
    LIMIT 1;  -- latest GPS tracker data
  `;

  db.query(truckSql, [truckId], (err, truckResults) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (truckResults.length === 0) return res.status(404).json({ error: "Truck not found" });

    db.query(logsSql, [truckId], (err2, logResults) => {
      if (err2) return res.status(500).json({ error: "Database error" });

      db.query(trackerSql, [truckId], (err3, trackerResults) => {
        if (err3) return res.status(500).json({ error: "Database error" });

        res.json({
          truck: truckResults[0],
          logs: logResults,
          tracker: trackerResults.length ? trackerResults[0] : null
        });
      });
    });
  });
});

module.exports = router;
