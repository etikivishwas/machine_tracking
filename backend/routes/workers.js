const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all workers
router.get("/", (req, res) => {
  const sql = "SELECT id, name, role, description, image_url FROM workers";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Get worker by ID with logs
router.get("/:id", (req, res) => {
  const workerId = req.params.id;

  const workerSql = "SELECT * FROM workers WHERE id = ?";
  const logsSql = "SELECT work_date, hours_worked FROM work_logs WHERE worker_id = ? ORDER BY work_date";

  db.query(workerSql, [workerId], (err, workerResults) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (workerResults.length === 0) return res.status(404).json({ error: "Worker not found" });

    db.query(logsSql, [workerId], (err2, logResults) => {
      if (err2) return res.status(500).json({ error: "Database error" });

      res.json({
        worker: workerResults[0],
        logs: logResults
      });
    });
  });
});

module.exports = router;
