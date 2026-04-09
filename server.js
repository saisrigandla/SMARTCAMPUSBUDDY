const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const dbURI = "mongodb+srv://gandlasaisri895_db_user:1913219@smartcampusbuddy.6bqvutk.mongodb.net/?appName=SmartCampusBuddy";
mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));
// --- SCHEMAS ---
// 1. Event Schema
const Event = mongoose.model('Event', new mongoose.Schema({
    eventDate: String,
    eventTitle: String,
    eventDetails: String
}));
// 2. Timetable Schema
const Timetable = mongoose.model('Timetable', new mongoose.Schema({
    year: String,
    semester: String,
    Date: Date,
    slot: String,
    subject: String
}));
// 3. Complaint Schema (NEW)
const Complaint = mongoose.model('Complaint', new mongoose.Schema({
    name: String,
    location: String,
    issue: String,
    createdAt: { type: Date, default: Date.now }
}));
const Note = mongoose.model('Note', new mongoose.Schema({
    title: String,
    description: String,
    uploadedBy: String,
    subject: String,
    type: String,
    year: String,
    semester: String,
    fileUrl: String, 
    createdAt: { type: Date, default: Date.now }
}));
// --- ROUTES ---
// Timetable Routes
app.get('/api/timetable', async (req, res) => {
    try {
        const data = await Timetable.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/timetable', async (req, res) => {
    try {
        const newEntry = new Timetable(req.body);
        await newEntry.save();
        res.status(201).json({ message: "Timetable Saved!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Events Routes
app.get('/api/events', async (req, res) => {
    try {
        const data = await Event.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/events', async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json({ message: "Event Saved!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Complaint Routes (NEW)
app.get('/api/complaints', async (req, res) => {
    try {
        const data = await Complaint.find().sort({ createdAt: -1 });
        res.json(data); // This sends the data to your table
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/complaints', async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        await newComplaint.save();
        res.status(201).json({ message: "Complaint Submitted!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/notescorner', async (req, res) => {
    try {
        const data = await Note.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/notescorner', async (req, res) => {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).json({ message: "Note Saved!" });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: err.message });
    }
});
// --- DELETE ROUTES ---
// Delete Timetable
app.delete('/api/timetable/:id', async (req, res) => {
    try {
        await Timetable.findByIdAndDelete(req.params.id);
        res.json({ message: "Timetable entry deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// Delete Event
app.delete('/api/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// Delete Complaint
app.delete('/api/complaints/:id', async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ message: "Complaint deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// Start Server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});