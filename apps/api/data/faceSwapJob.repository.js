/**
 * FaceSwapJob Repository
 * Persists face-swap job state in PostgreSQL so jobs survive server restarts.
 */

const db = require('../db');

/**
 * Run once at server startup.
 * CREATE TABLE IF NOT EXISTS is idempotent — safe to call on every deploy.
 */
async function initTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS face_swap_jobs (
      job_id         TEXT        PRIMARY KEY,
      fal_request_id TEXT        NOT NULL,
      status         TEXT        NOT NULL DEFAULT 'processing',
      image_url      TEXT,
      share_url      TEXT,
      error          TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('[DB] face_swap_jobs table ready');
}

/**
 * Insert a new job row with status 'processing'.
 */
async function createJob(jobId, falRequestId) {
  await db.query(
    `INSERT INTO face_swap_jobs (job_id, fal_request_id, status, created_at)
     VALUES ($1, $2, 'processing', NOW())`,
    [jobId, falRequestId]
  );
}

/**
 * Fetch a job row by jobId.
 * Returns null if not found.
 * Maps snake_case columns → camelCase for the service layer.
 */
async function getJob(jobId) {
  const { rows } = await db.query(
    'SELECT * FROM face_swap_jobs WHERE job_id = $1',
    [jobId]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    jobId:        row.job_id,
    falRequestId: row.fal_request_id,
    status:       row.status,
    imageUrl:     row.image_url,
    shareUrl:     row.share_url,
    error:        row.error,
    createdAt:    row.created_at,
  };
}

/**
 * Update status and optional result fields for a job.
 */
async function updateJob(jobId, { status, imageUrl = null, shareUrl = null, error = null }) {
  await db.query(
    `UPDATE face_swap_jobs
     SET status = $2, image_url = $3, share_url = $4, error = $5
     WHERE job_id = $1`,
    [jobId, status, imageUrl, shareUrl, error]
  );
}

/**
 * Delete rows older than 24 hours. Matches R2 auto-delete TTL.
 */
async function deleteExpiredJobs() {
  const { rowCount } = await db.query(
    `DELETE FROM face_swap_jobs WHERE created_at < NOW() - INTERVAL '24 hours'`
  );
  if (rowCount > 0) console.log(`[DB] Purged ${rowCount} expired face_swap_jobs`);
}

module.exports = { initTable, createJob, getJob, updateJob, deleteExpiredJobs };
