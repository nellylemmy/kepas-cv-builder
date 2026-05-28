import pool from '../config/database.js';
import crypto from 'crypto';

function generateShareCode() {
  return crypto.randomBytes(9).toString('base64url').slice(0, 12);
}

// @desc    Create a new CV document
// @route   POST /api/cv
export const createCV = async (req, res) => {
  const { cvData, photoData } = req.body;

  if (!cvData || typeof cvData !== 'object') {
    return res.status(400).json({ error: 'cvData (object) is required.' });
  }

  try {
    let shareCode = generateShareCode();
    let attempts = 0;

    // Retry on the rare chance of a collision
    while (attempts < 5) {
      try {
        const result = await pool.query(
          `INSERT INTO cv_documents (share_code, cv_data, photo_data)
           VALUES ($1, $2, $3)
           RETURNING share_code, id, created_at`,
          [shareCode, JSON.stringify(cvData), photoData || null]
        );
        return res.status(201).json({
          shareCode: result.rows[0].share_code,
          id: result.rows[0].id,
          createdAt: result.rows[0].created_at
        });
      } catch (err) {
        if (err.code === '23505' && err.constraint === 'cv_documents_share_code_key') {
          shareCode = generateShareCode();
          attempts++;
        } else {
          throw err;
        }
      }
    }

    return res.status(500).json({ error: 'Could not generate a unique share code.' });
  } catch (err) {
    console.error('createCV error:', err.message);
    return res.status(500).json({ error: 'Failed to create CV.' });
  }
};

// @desc    Get a CV by share code
// @route   GET /api/cv/:shareCode
export const getCV = async (req, res) => {
  const { shareCode } = req.params;

  if (!shareCode || shareCode.length > 12) {
    return res.status(400).json({ error: 'Invalid share code.' });
  }

  try {
    const result = await pool.query(
      `SELECT cv_data, photo_data, created_at, updated_at
       FROM cv_documents
       WHERE share_code = $1`,
      [shareCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CV not found.' });
    }

    const row = result.rows[0];
    return res.json({
      cvData: row.cv_data,
      photoData: row.photo_data,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  } catch (err) {
    console.error('getCV error:', err.message);
    return res.status(500).json({ error: 'Failed to load CV.' });
  }
};

// @desc    Update an existing CV
// @route   PUT /api/cv/:shareCode
export const updateCV = async (req, res) => {
  const { shareCode } = req.params;
  const { cvData, photoData } = req.body;

  if (!shareCode || shareCode.length > 12) {
    return res.status(400).json({ error: 'Invalid share code.' });
  }

  if (!cvData || typeof cvData !== 'object') {
    return res.status(400).json({ error: 'cvData (object) is required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE cv_documents
       SET cv_data = $1, photo_data = $2, updated_at = NOW()
       WHERE share_code = $3
       RETURNING updated_at`,
      [JSON.stringify(cvData), photoData || null, shareCode]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'CV not found.' });
    }

    return res.json({ updatedAt: result.rows[0].updated_at });
  } catch (err) {
    console.error('updateCV error:', err.message);
    return res.status(500).json({ error: 'Failed to update CV.' });
  }
};

// @desc    Delete a CV
// @route   DELETE /api/cv/:shareCode
export const deleteCV = async (req, res) => {
  const { shareCode } = req.params;

  if (!shareCode || shareCode.length > 12) {
    return res.status(400).json({ error: 'Invalid share code.' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM cv_documents WHERE share_code = $1`,
      [shareCode]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'CV not found.' });
    }

    return res.json({ deleted: true });
  } catch (err) {
    console.error('deleteCV error:', err.message);
    return res.status(500).json({ error: 'Failed to delete CV.' });
  }
};
