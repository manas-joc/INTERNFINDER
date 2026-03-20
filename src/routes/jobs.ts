import express from 'express';
import db from '../db/index.ts';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all jobs
router.get('/', (req, res) => {
  try {
    const { search, type, location, sort } = req.query;
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (title LIKE ? OR company LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (sort === 'oldest') {
      query += ' ORDER BY created_at ASC';
    } else if (sort === 'a-z') {
      query += ' ORDER BY title ASC';
    } else if (sort === 'z-a') {
      query += ' ORDER BY title DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const stmt = db.prepare(query);
    const jobs = stmt.all(...params);
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// Get single job
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
    const job = stmt.get(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

// Create job (Admin only)
router.post('/', verifyToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin only' });
  }

  const { title, company, location, description, type } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO jobs (title, company, location, description, type, posted_by) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(title, company, location, description, type, req.user.id);
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
});

// Update job (Admin only)
router.put('/:id', verifyToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin only' });
  }

  const { title, company, location, description, type } = req.body;
  try {
    const stmt = db.prepare('UPDATE jobs SET title = ?, company = ?, location = ?, description = ?, type = ? WHERE id = ?');
    const info = stmt.run(title, company, location, description, type, req.params.id);
    if (info.changes === 0) return res.status(404).json({ message: 'Job not found' });
    res.json({ id: req.params.id, ...req.body });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
});

// Delete job (Admin only)
router.delete('/:id', verifyToken, (req: any, res: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin only' });
  }

  try {
    const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

// Apply for job (Logged in users)
router.post('/:id/apply', verifyToken, (req: any, res: any) => {
  try {
    // Check if already applied
    const checkStmt = db.prepare('SELECT * FROM applications WHERE user_id = ? AND job_id = ?');
    const existing = checkStmt.get(req.user.id, req.params.id);
    
    if (existing) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    const stmt = db.prepare('INSERT INTO applications (user_id, job_id) VALUES (?, ?)');
    stmt.run(req.user.id, req.params.id);
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error applying for job', error: error.message });
  }
});

// Get user applications
router.get('/applications/me', verifyToken, (req: any, res: any) => {
  try {
    const stmt = db.prepare(`
      SELECT a.id, a.status, a.applied_at, j.title, j.company, j.location 
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      WHERE a.user_id = ?
    `);
    const applications = stmt.all(req.user.id);
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

export default router;
