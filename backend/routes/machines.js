const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all machines
router.get("/", (req, res) => {
  const sql = "SELECT id, name, role, description, image FROM machines";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});


router.get("/:id", (req, res) => {
  const machineId = req.params.id;

  const machineSql = "SELECT * FROM machines WHERE id = ?";
  const logsSql = `
    SELECT 
      id,
      machine_id,
      current_location,
      hours_worked,
      fuel_consumption,
      material_processed,
      state,
      log_date
        FROM machine_logs
        WHERE machine_id = ?
        ORDER BY log_date;
    `;

  db.query(machineSql, [machineId], (err, machineResults) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (machineResults.length === 0) return res.status(404).json({ error: "Machine not found" });

    db.query(logsSql, [machineId], (err2, logResults) => {
      if (err2) return res.status(500).json({ error: "Database error" });

      res.json({
        machine: machineResults[0],
        logs: logResults
      });
    });
  });
});

module.exports = router;
