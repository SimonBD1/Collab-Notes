const express = require('express');
const pool = require('../db/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

module.exports = (io) => {
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC', [req.userId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching notes:', err.message);
      res.status(400).json({ error: 'Database error' });
    }
  });

  router.get('/search', authMiddleware, async (req, res) => {
    const { query } = req.query;
    try {
      const result = await pool.query(
        'SELECT * FROM notes WHERE user_id = $1 AND content ILIKE $2 ORDER BY updated_at DESC',
        [req.userId, `%${query}%`]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error searching notes:', err.message);
      res.status(400).json({ error: 'Database error' });
    }
  });

  router.post('/', authMiddleware, async (req, res) => {
    const { content } = req.body;

    try {
      const result = await pool.query('INSERT INTO notes (user_id, content) VALUES ($1, $2) RETURNING *', [req.userId, content]);
      const note = result.rows[0];
      io.emit('note updated', note);
      res.json(note);
    } catch (err) {
      console.error('Error creating note:', err.message);
      res.status(400).json({ error: 'Database error' });
    }
  });

  router.put('/:id', authMiddleware, async (req, res) => {
    const { content } = req.body;
    const { id } = req.params;

    try {
      const result = await pool.query('UPDATE notes SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *', [content, id, req.userId]);
      const note = result.rows[0];
      io.emit('note updated', note);
      res.json(note);
    } catch (err) {
      console.error('Error updating note:', err.message);
      res.status(400).json({ error: 'Database error' });
    }
  });

  router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
      await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, req.userId]);
      io.emit('note deleted', id);
      res.sendStatus(204);
    } catch (err) {
      console.error('Error deleting note:', err.message);
      res.status(400).json({ error: 'Database error' });
    }
  });

  return router;
};
