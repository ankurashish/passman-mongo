import express from 'express';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const url = process.env.MONGO_URI || 'mongodb://localhost:27017';

// Serverless-friendly MongoClient caching
let client;
let clientPromise;

if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");

if (process.env.NODE_ENV === 'development') {
  // dev: cache globally
  if (!global._mongoClientPromise) {
    client = new MongoClient(url);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // production: new client (Vercel serverless)
  client = new MongoClient(url);
  clientPromise = client.connect();
}

const dbName = 'passman'; // EXACT name in Atlas
const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => res.send('Server is running'));

// Fetch all passwords
app.get('/passwords', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const passwords = await db.collection('passwords').find().toArray();
    res.json(passwords);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch passwords' });
  }
});

// Save a password
app.post('/passwords', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    let { site, username, password, id } = req.body;
    if (!site || !username || !password) return res.status(400).json({ error: 'All fields required' });
    if (!id) id = uuidv4();

    await db.collection('passwords').insertOne({ id, site, username, password, createdAt: new Date() });
    res.status(201).json({ message: 'Password saved', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save password' });
  }
});

// Update a password
app.put('/passwords/:id', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    const { id } = req.params;
    const { site, username, password } = req.body;

    const result = await db.collection('passwords').updateOne(
      { id },
      { $set: { site, username, password, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Password not found' });
    res.json({ message: 'Password updated', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Delete a password
app.delete('/passwords/:id', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    const result = await db.collection('passwords').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Password not found' });

    res.json({ message: 'Password deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete password' });
  }
});

// Local dev server only
if (process.env.NODE_ENV === 'development') {
  (async () => {
    try {
      await clientPromise;
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    }
  })();
}

export default app; // for Vercel
