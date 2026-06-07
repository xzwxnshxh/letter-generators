const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize SQLite Database
const db = new sqlite3.Database('./upsi_database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  // Programs table
  db.run(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      venue TEXT,
      time TEXT,
      installDate TEXT,
      installDay TEXT,
      date TEXT,
      day TEXT,
      clientName TEXT,
      clientAddress TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crew table
  db.run(`
    CREATE TABLE IF NOT EXISTS crew (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ic TEXT NOT NULL,
      bank_name TEXT,
      bank_account TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Documents table
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      programId TEXT,
      programName TEXT,
      data TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables initialized');
}

// ============= PROGRAMS API =============

// Get all programs
app.get('/api/programs', (req, res) => {
  db.all('SELECT * FROM programs ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single program
app.get('/api/programs/:id', (req, res) => {
  db.get('SELECT * FROM programs WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Create program
app.post('/api/programs', (req, res) => {
  const { id, name, venue, time, installDate, installDay, date, day, clientName, clientAddress } = req.body;
  
  db.run(
    `INSERT INTO programs (id, name, venue, time, installDate, installDay, date, day, clientName, clientAddress) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, venue, time, installDate, installDay, date, day, clientName, clientAddress],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, message: 'Program created successfully' });
    }
  );
});

// Update program
app.put('/api/programs/:id', (req, res) => {
  const { name, venue, time, installDate, installDay, date, day, clientName, clientAddress } = req.body;
  
  db.run(
    `UPDATE programs SET name=?, venue=?, time=?, installDate=?, installDay=?, date=?, day=?, clientName=?, clientAddress=? 
     WHERE id=?`,
    [name, venue, time, installDate, installDay, date, day, clientName, clientAddress, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Program updated successfully' });
    }
  );
});

// Delete program
app.delete('/api/programs/:id', (req, res) => {
  db.run('DELETE FROM programs WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Program deleted successfully' });
  });
});

// ============= CREW API =============

// Get all crew
app.get('/api/crew', (req, res) => {
  db.all('SELECT * FROM crew ORDER BY name ASC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create crew member
app.post('/api/crew', (req, res) => {
  const { id, name, ic, bank_name, bank_account } = req.body;
  
  db.run(
    'INSERT INTO crew (id, name, ic, bank_name, bank_account) VALUES (?, ?, ?, ?, ?)',
    [id, name, ic, bank_name, bank_account],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, message: 'Crew member created successfully' });
    }
  );
});

// Update crew member
app.put('/api/crew/:id', (req, res) => {
  const { name, ic, bank_name, bank_account } = req.body;
  
  db.run(
    'UPDATE crew SET name=?, ic=?, bank_name=?, bank_account=? WHERE id=?',
    [name, ic, bank_name, bank_account, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Crew member updated successfully' });
    }
  );
});

// Delete crew member
app.delete('/api/crew/:id', (req, res) => {
  db.run('DELETE FROM crew WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Crew member deleted successfully' });
  });
});

// ============= DOCUMENTS API =============

// Get all documents
app.get('/api/documents', (req, res) => {
  db.all('SELECT * FROM documents ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create document
app.post('/api/documents', (req, res) => {
  const { id, name, type, programId, programName, data } = req.body;
  
  db.run(
    'INSERT INTO documents (id, name, type, programId, programName, data) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, type, programId, programName, data],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, message: 'Document saved successfully' });
    }
  );
});

// Delete document
app.delete('/api/documents/:id', (req, res) => {
  db.run('DELETE FROM documents WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Document deleted successfully' });
  });
});

// ============= DATABASE VIEWER API =============

// View all tables and data (for database viewing)
app.get('/api/database/view', (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as count FROM programs', [], (err, row) => {
    stats.programs = row ? row.count : 0;
    
    db.get('SELECT COUNT(*) as count FROM crew', [], (err, row) => {
      stats.crew = row ? row.count : 0;
      
      db.get('SELECT COUNT(*) as count FROM documents', [], (err, row) => {
        stats.documents = row ? row.count : 0;
        
        res.json({
          message: 'Database statistics',
          stats: stats,
          databaseFile: './upsi_database.db'
        });
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database file: upsi_database.db`);
  console.log(`🔍 View database stats: http://localhost:${PORT}/api/database/view`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  - GET    /api/programs`);
  console.log(`  - POST   /api/programs`);
  console.log(`  - PUT    /api/programs/:id`);
  console.log(`  - DELETE /api/programs/:id`);
  console.log(`  - GET    /api/crew`);
  console.log(`  - POST   /api/crew`);
  console.log(`  - DELETE /api/crew/:id`);
  console.log(`  - GET    /api/documents`);
  console.log(`\n✅ Ready for connections!\n`);
});

// Handle shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('\nDatabase connection closed');
    process.exit(0);
  });
});
