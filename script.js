const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
// --- GLOBAL DELETE FUNCTION ---
async function deleteItem(type, id) {
    if (!confirm(`Are you sure you want to delete this ${type} entry?`)) return;
    try {
        const res = await fetch(`http://localhost:3001/api/${type}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            if (type === 'timetable') displayTimetable();
            if (type === 'events') loadEvents();
            if (type === 'complaints') displayComplaints();
            if (type === 'notescorner') loadNotes();
        }
    } catch (e) { console.error("Delete failed:", e); }
}
// --- DATA DISPLAY LOGIC ---
async function displayTimetable() {
    const ttBody = document.getElementById('ttBody');
    if (!ttBody) return;
    try {
        const res = await fetch('http://localhost:3001/api/timetable');
        const data = await res.json();
        ttBody.innerHTML = data.length === 0 ? '<tr><td colspan="5" style="text-align:center;">No entries yet.</td></tr>' :
        data.map(item => `
            <tr>
                <td>${item.Date ? new Date(item.Date).toLocaleDateString() : 'N/A'}</td>
                <td>${item.slot}</td>
                <td>${item.subject}</td>
                <td>${item.year} - ${item.semester}</td>
                <td><button class="delete-btn" onclick="deleteItem('timetable', '${item._id}')">Delete</button></td>
            </tr>`).reverse().join('');
    } catch (e) { console.error(e); }
}
async function loadEvents() {
    const eventBody = document.getElementById('eventBody');
    if (!eventBody) return;
    try {
        const res = await fetch('http://localhost:3001/api/events');
        const data = await res.json();
        eventBody.innerHTML = data.length === 0 ? '<tr><td colspan="5" style="text-align:center;">No events added yet.</td></tr>' :
        data.map(item => `
            <tr>
                <td>${item.eventDate || 'N/A'}</td>
                <td>9-10am</td>
                <td>${item.eventTitle}</td>
                <td>${item.eventDetails}</td>
                <td><button class="delete-btn" onclick="deleteItem('events', '${item._id}')">Delete</button></td>
            </tr>`).reverse().join('');
    } catch (e) { console.error(e); }
}
async function displayComplaints() {
    const complaintBody = document.getElementById('complaintBody');
    if (!complaintBody) return;
    try {
        const res = await fetch('http://localhost:3001/api/complaints');
        const data = await res.json();
        complaintBody.innerHTML = data.length === 0 ? '<tr><td colspan="4" style="text-align:center;">No complaints reported yet.</td></tr>' :
        data.map(c => `
            <tr>
                <td>${c.name || 'Anonymous'}</td>
                <td>${c.location}</td>
                <td>${c.issue}</td>
                <td><button class="delete-btn" onclick="deleteItem('complaints', '${c._id}')">Delete</button></td>
            </tr>`).reverse().join('');
    } catch (e) { console.error(e); }
}
async function loadNotes() {
    const notesList = document.getElementById("notesList");
    if (!notesList) return;
    try {
        const res = await fetch("http://localhost:3001/api/notescorner");
        const notes = await res.json();
        
        if (notes.length === 0) {
            notesList.innerHTML = "<p style='text-align:center;'>No notes found in database.</p>";
            return;
        }

        renderNotes(notes);
    } catch (e) {
        console.error("Failed to load notes:", e);
    }
}
function renderNotes(notes) {
    const notesList = document.getElementById("notesList");
    const grouped = {};
    notes.forEach(note => {
        const key = `${note.year || "Other"} - ${note.semester || "Other"}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(note);
    });
    notesList.innerHTML = ""; 
    for (const group in grouped) {
        const section = document.createElement("div");
        section.innerHTML = `<h4 class="notes-year" style="color:#FFECB3; margin-top:30px; border-bottom:1px solid #FFECB3;">${group}</h4>`;
        grouped[group].forEach(note => {
            section.innerHTML += `
                <div class="note-card" style="background:rgba(255,255,255,0.05); padding:15px; margin:10px 0; border-radius:8px; border-left: 4px solid #FFECB3;">
                    <strong class="note-title">${note.type.toUpperCase()}: ${note.title}</strong><br>
                    <small>${note.subject} | By: ${note.uploadedBy}</small><br>
                    <p style="font-size: 0.9em; color: #ccc;">${note.description || ''}</p>
                    <a href="${note.fileUrl}" download="${note.title}" class="note-link" style="color:#FFECB3; font-weight:bold; text-decoration:none;">Download File</a>
                </div>`;
        });
        notesList.appendChild(section);
    }
}
// --- UNIFIED FORM SUBMISSION LOGIC ---
document.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = e.target;
    // 1. Timetable Form
    if (target.id === 'timetableForm') {
        const entry = {
            year: document.getElementById('ttYear').value,
            semester: document.getElementById('ttSem').value,
            Date: document.getElementById('ttDate').value,
            slot: document.getElementById('ttSlot').value,
            subject: document.getElementById('ttSubject').value
        };
        await fetch('http://localhost:3001/api/timetable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) });
        target.reset();
        displayTimetable();
    }
    // 2. Event Form
    if (target.id === 'eventForm') {
        const eventEntry = {
            eventDate: document.getElementById('eventDate').value,
            eventTitle: document.getElementById('eventTitle').value,
            eventDetails: document.getElementById('eventDetails').value
        };
        await fetch('http://localhost:3001/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eventEntry) });
        target.reset();
        loadEvents();
    }
    // 3. Complaint Form
    if (target.id === 'complaintForm') {
        const complaintEntry = {
            name: document.getElementById('complaintName').value,
            location: document.getElementById('complaintLocation').value,
            issue: document.getElementById('complaintIssue').value
        };
        await fetch('http://localhost:3001/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(complaintEntry) });
        target.reset();
        displayComplaints();
    }
    // 4. Notes Form
    document.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = e.target;
    if (target.id === 'notesForm') {
        const status = document.getElementById("notesStatus");
        const fileInput = document.getElementById("fileInput");
        const file = fileInput.files[0];
        if (!file) {
            status.textContent = "Please select a file!";
            return;
        }
        status.textContent = "Uploading to MongoDB...";
        status.style.color = "#FFECB3";
        try {
            const base64 = await toBase64(file);
            const formData = new FormData(target);
            const data = Object.fromEntries(formData.entries());
            data.fileUrl = base64;
            const res = await fetch("http://localhost:3001/api/notescorner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
             if (res.ok) {
                status.textContent = "Success! Saved to MongoDB.";
                status.style.color = "#2ecc71";
                target.reset();
                loadNotes(); // This will refresh the list immediately
            }
        } catch (err) {
            status.textContent = "Upload failed!";
            console.error(err);
        }
    }
});
    if (target.id === 'notesForm') {
        const status = document.getElementById("notesStatus");
        const file = document.getElementById("fileInput").files[0];
        if (!file) return;
        status.textContent = "Uploading to Server...";
        status.style.color = "#FFECB3";
        try {
            const base64 = await toBase64(file);
            const data = Object.fromEntries(new FormData(target).entries());
            data.fileUrl = base64;
            const res = await fetch("http://localhost:3001/api/notescorner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            if (res.ok) {
                status.textContent = "Saved to Database!";
                status.style.color = "#2ecc71";
                target.reset();
                loadNotes();
            } else {
                status.textContent = "Server rejected upload.";
            }
        } catch (err) {
            status.textContent = "Upload failed!";
            console.error(err);
        }
    }
});
window.onload = () => {
    displayTimetable();
    loadEvents();
    displayComplaints();
    loadNotes();
};
