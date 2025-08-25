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

  db.query(truckSql, [truckId], (err, truckResults) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (truckResults.length === 0) return res.status(404).json({ error: "Truck not found" });

    db.query(logsSql, [truckId], (err2, logResults) => {
      if (err2) return res.status(500).json({ error: "Database error" });

      res.json({
        truck: truckResults[0],
        logs: logResults
      });
    });
  });
});

module.exports = router;
