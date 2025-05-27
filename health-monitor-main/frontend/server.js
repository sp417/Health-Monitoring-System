const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;
const uri = 'mongodb://localhost:27017';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let collection;

app.use(cors());
app.use(bodyParser.json());

async function connectDB() {
  try {
    await client.connect();
    const db = client.db('hospital');
    collection = db.collection('patients');
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // Exit if connection fails
  }
}

connectDB();

// ROUTES

// GET all patients
app.get('/patients', async (req, res) => {
  try {
    const patients = await collection.find().toArray();
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// POST a new patient
app.post('/patients', async (req, res) => {
  try {
    const result = await collection.insertOne(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error inserting patient:", err);
    res.status(500).json({ error: "Failed to insert patient" });
  }
});

// PUT update a patient
app.put('/patients/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json(result);
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

// DELETE a patient
app.delete('/patients/:id', async (req, res) => {
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (err) {
    console.error("Error deleting patient:", err);
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
