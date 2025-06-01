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
        process.exit(1);
    }
}

connectDB();

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
        const newPatient = { ...req.body, prescriptions: [] }; // Initialize prescriptions array
        const result = await collection.insertOne(newPatient);
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
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }
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

// GET all prescriptions for a patient
app.get('/patients/:id/prescriptions', async (req, res) => {
    try {
        const patient = await collection.findOne({ _id: new ObjectId(req.params.id) });
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(patient.prescriptions || []);
    } catch (err) {
        console.error("Error fetching prescriptions:", err);
        res.status(500).json({ error: "Failed to fetch prescriptions" });
    }
});

// POST a new prescription for a patient
app.post('/patients/:id/prescriptions', async (req, res) => {
    try {
        const newPrescription = req.body;
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $push: { prescriptions: newPrescription } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(result);
    } catch (err) {
        console.error("Error adding prescription:", err);
        res.status(500).json({ error: "Failed to add prescription" });
    }
});

// PUT update a prescription for a patient
app.put('/patients/:patientId/prescriptions/:prescriptionId', async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const prescriptionId = req.params.prescriptionId;
        const updatedPrescription = req.body;

        const result = await collection.updateOne(
            { _id: new ObjectId(patientId), "prescriptions._id": prescriptionId },
            { $set: { "prescriptions.$": updatedPrescription } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Patient or prescription not found" });
        }

        res.json(result);
    } catch (err) {
        console.error("Error updating prescription:", err);
        res.status(500).json({ error: "Failed to update prescription" });
    }
});

// DELETE a prescription for a patient
app.delete('/patients/:patientId/prescriptions/:prescriptionId', async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const prescriptionId = req.params.prescriptionId;

        const result = await collection.updateOne(
            { _id: new ObjectId(patientId) },
            { $pull: { prescriptions: { _id: prescriptionId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Patient or prescription not found" });
        }

        res.json({ message: "Prescription deleted successfully" });
    } catch (err) {
        console.error("Error deleting prescription:", err);
        res.status(500).json({ error: "Failed to delete prescription" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
