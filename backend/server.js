import express from 'express';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const url = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'passman';

try {
  await client.connect();
  console.log("Connected to MongoDB Atlas!");
} catch (err) {
  console.error("Failed to connect:", err);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

// fetch all passwords
app.get('/passwords', async (req, res) => {
  try {
    const db = client.db(dbName);
    const passwords = await db.collection('passwords').find().toArray();
    res.json(passwords);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch passwords' });
  }
});

// save a password
app.post('/passwords', async (req, res) => {
  try {
    let { site, username, password, id } = req.body;

    if (!site || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // generate UUID if frontend didn’t provide one
    if (!id) id = uuidv4();

    const db = client.db(dbName);
    await db.collection('passwords').insertOne({
      id,
      site,
      username,
      password,
      createdAt: new Date(),
    });

    res.status(201).json({ message: 'Password saved', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save password' });
  }
});
app.put("/passwords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { site, username, password } = req.body;

    const db = client.db(dbName);
    const result = await db.collection("passwords").updateOne(
      { id },  // find by UUID
      { $set: { site, username, password, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Password not found" });
    }

    res.json({ message: "Password updated", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update password" });
  }
});


// delete a password by uuid
app.delete('/passwords/:id', async (req, res) => {
  try {
    const db = client.db(dbName);
    const result = await db.collection('passwords').deleteOne({ id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Password not found' });
    }

    res.json({ message: 'Password deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete password' });
  }
});


const PORT = process.env.PORT || 3000;
async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

startServer();
