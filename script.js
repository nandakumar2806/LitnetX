// ========== USERS & ROLES ==========
const users = [
  { username: "admin", password: "test", name: "Admin User", role: "Admin", email: "admin@litnetx.com" },
  { username: "manager", password: "manager", name: "Nina Manager", role: "Manager", email: "nina@litnetx.com" },
  { username: "sales", password: "sales", name: "Sam Sales", role: "Sales", email: "sam@litnetx.com" }
];

const ROLE_TABS = {
  Admin:   ["dashboard","leads","contacts","deals","pipeline","tasks","calendar","reports","teams","files","profile","settings"],
  Manager: ["dashboard","leads","contacts","deals","pipeline","tasks","calendar","reports","teams","profile","settings"],
  Sales:   ["dashboard","leads","contacts","deals","pipeline","tasks","calendar","profile","settings"]
};

let loggedInUser = null;

// ========== DATA ==========
let leads = [
  { name: "Alice Williams", email: "alice@crm.com", status: "New", created: "2025-11-01" },
  { name: "Bob Brown", email: "bob@crm.com", status: "Contacted", created: "2025-11-03" }
];

let contacts = [
  { name: "John Doe", company: "Tech Corp", email: "john@example.com", phone: "+1234567890" },
  { name: "Jane Smith", company: "StartUp Inc", email: "jane@example.com", phone: "+0987654321" }
];

let deals = [
  { name: "Acme Deal", stage: "Prospecting", amount: 350000, contact: "John Doe" },
  { name: "SaaS Contract", stage: "Negotiation", amount: 225000, contact: "Jane Smith" },
  { name: "Enterprise Suite", stage: "Closed", amount: 575000, contact: "John Doe" }
];

let tasks = [
  { name: "Call Alice", assigned: "Sam Sales", due: "2025-11-12", status: "Open" },
  { name: "Prepare proposal", assigned: "Nina Manager", due: "2025-11-16", status: "In Progress" }
];

let calendarEvents = [
  { title: "Demo Call", date: "2025-11-13", assigned: "Sam Sales" },
  { title: "Client Meeting", date: "2025-11-14", assigned: "Nina Manager" }
];

let teams = [
  { name: "Sales Team", members: ["sales", "manager"] },
  { name: "Admin Team", members: ["admin"] }
];

let files = [];

// ========== LOGIN ==========
document.getElementById("loginForm").onsubmit = function(e) {
  e.preventDefault();
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const found = users.find(u => u.username === user && u.password === pass);
  if (found) {
    loggedInUser = found;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("userInfo").innerHTML = `<div><strong>${loggedInUser.name}</strong></div><div style="font-size:0.85rem;">${loggedInUser.role}</div>`;
    setupTabs();
    showTab("dashboard");
  } else {
    document.getElementById("loginMsg").textContent = "Incorrect username or password";
  }
};

// ========== NAVIGATION ==========
function setupTabs() {
  const allowed = ROLE_TABS[loggedInUser.role];
  const list = allowed.map(tab =>
    `<li id="nav-${tab}" onclick="showTab('${tab}')">${tab.charAt(0).toUpperCase() + tab.slice(1)}</li>`
  ).join("");
  document.getElementById("navList").innerHTML = list;
}

window.showTab = function(tab) {
  document.querySelectorAll('.tab').forEach(e => e.classList.remove('visible'));
  document.getElementById(tab).classList.add('visible');
  document.querySelectorAll('.sidebar nav li').forEach(li =>
    li.classList.toggle('active', li.id === "nav-" + tab));
  
  if (tab === "dashboard") renderDashboard();
  if (tab === "leads") renderLeads();
  if (tab === "contacts") renderContacts();
  if (tab === "deals") renderDeals();
  if (tab === "pipeline") renderPipeline();
  if (tab === "tasks") renderTasks();
  if (tab === "calendar") renderCalendar();
  if (tab === "reports") renderReports();
  if (tab === "teams") renderTeams();
  if (tab === "files") renderFiles();
  if (tab === "profile") renderProfile();
  if (tab === "settings") renderSettings();
};

// ========== DASHBOARD ==========
function renderDashboard() {
  document.getElementById("dashboard").innerHTML = `
    <h1>Dashboard</h1>
    <div class="kpis">
      <div class="kpi-card"><h3>Contacts</h3><div class="kpi-value">${contacts.length}</div></div>
      <div class="kpi-card"><h3>Leads</h3><div class="kpi-value">${leads.length}</div></div>
      <div class="kpi-card"><h3>Deals</h3><div class="kpi-value">${deals.length}</div></div>
      <div class="kpi-card"><h3>Tasks</h3><div class="kpi-value">${tasks.length}</div></div>
    </div>
    <div class="dashboard-row">
      <div class="recent-table">
        <h2>Recent Leads</h2>
        <table><thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
        <tbody>${leads.slice(-5).reverse().map(l => `<tr><td>${l.name}</td><td>${l.email}</td><td>${l.status}</td></tr>`).join("")}</tbody></table>
      </div>
      <div class="recent-table">
        <h2>Top Deals</h2>
        <table><thead><tr><th>Deal</th><th>Stage</th><th>Amount</th></tr></thead>
        <tbody>${deals.slice(-5).reverse().map(d => `<tr><td>${d.name}</td><td>${d.stage}</td><td>$${d.amount.toLocaleString()}</td></tr>`).join("")}</tbody></table>
      </div>
      <div class="chart-container">
        <h2>Deals by Stage</h2>
        <canvas id="dealChart" width="320" height="180"></canvas>
      </div>
    </div>
  `;
  drawDealChart();
}

function drawDealChart() {
  const ctx = document.getElementById("dealChart");
  if (!ctx) return;
  const stages = { Prospecting: 0, Negotiation: 0, Closed: 0 };
  deals.forEach(d => { if (stages[d.stage] !== undefined) stages[d.stage]++; });
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(stages),
      datasets: [{ label: "Deals", data: Object.values(stages), backgroundColor: ["#3498db", "#f39c12", "#2ecc71"] }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}

// ========== LEADS ==========
function renderLeads() {
  document.getElementById("leads").innerHTML = `
    <h1>Leads</h1>
    <input type="search" placeholder="Search leads..." id="leadSearch" class="searchbox" oninput="searchLeads()">
    <button onclick="addLeadDialog()" class="btn">+ Add Lead</button>
    <table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
    <tbody id="leadRows"></tbody></table>
  `;
  searchLeads();
}

window.searchLeads = function() {
  const q = (document.getElementById('leadSearch')?.value || '').toLowerCase();
  document.getElementById("leadRows").innerHTML = leads
    .filter(l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.status.toLowerCase().includes(q))
    .map((l, i) => `<tr><td>${l.name}</td><td>${l.email}</td><td>${l.status}</td>
      <td>
        <button onclick="editLeadDialog(${i})" class="btn" style="background:#f39c12">Edit</button>
        <button onclick="deleteLead(${i})" class="btn" style="background:#e74c3c">Delete</button>
      </td></tr>`).join("");
};

window.addLeadDialog = function() {
  showModal(`<div class="modal-content">
    <h3>Add Lead</h3>
    <form onsubmit="addLead(event)">
      <input required placeholder="Name" id="leadName">
      <input required placeholder="Email" id="leadEmail">
      <select id="leadStatus"><option>New</option><option>Contacted</option><option>Qualified</option></select>
      <button type="submit" class="btn">Add</button>
    </form>
  </div>`);
};

window.addLead = function(e) {
  e.preventDefault();
  leads.push({ name: leadName.value, email: leadEmail.value, status: leadStatus.value, created: new Date().toISOString().split('T')[0] });
  closeModal(); searchLeads();
};

window.editLeadDialog = function(idx) {
  const l = leads[idx];
  showModal(`<div class="modal-content">
    <h3>Edit Lead</h3>
    <form onsubmit="editLead(event,${idx})">
      <input required id="editLeadName" value="${l.name}">
      <input required id="editLeadEmail" value="${l.email}">
      <select id="editLeadStatus">
        <option${l.status === "New" ? " selected" : ""}>New</option>
        <option${l.status === "Contacted" ? " selected" : ""}>Contacted</option>
        <option${l.status === "Qualified" ? " selected" : ""}>Qualified</option>
      </select>
      <button type="submit" class="btn">Update</button>
    </form>
  </div>`);
};

window.editLead = function(e, idx) {
  e.preventDefault();
  leads[idx] = { name: editLeadName.value, email: editLeadEmail.value, status: editLeadStatus.value, created: leads[idx].created };
  closeModal(); searchLeads();
};

window.deleteLead = function(idx) { leads.splice(idx, 1); searchLeads(); };

// ========== CONTACTS ==========
function renderContacts() {
  document.getElementById("contacts").innerHTML = `
    <h1>Contacts</h1>
    <input type="search" placeholder="Search contacts..." id="contactSearch" class="searchbox" oninput="searchContacts()">
    <button onclick="addContactDialog()" class="btn">+ Add Contact</button>
    <table><thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Action</th></tr></thead>
    <tbody id="contactRows"></tbody></table>
  `;
  searchContacts();
}

window.searchContacts = function() {
  const q = (document.getElementById('contactSearch')?.value || '').toLowerCase();
  document.getElementById("contactRows").innerHTML = contacts
    .filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    .map((c, i) => `<tr><td>${c.name}</td><td>${c.company}</td><td>${c.email}</td><td>${c.phone}</td>
      <td>
        <button onclick="editContactDialog(${i})" class="btn" style="background:#f39c12">Edit</button>
        <button onclick="deleteContact(${i})" class="btn" style="background:#e74c3c">Delete</button>
      </td></tr>`).join("");
};

window.addContactDialog = function() {
  showModal(`<div class="modal-content">
    <h3>Add Contact</h3>
    <form onsubmit="addContact(event)">
      <input required placeholder="Name" id="contactName">
      <input required placeholder="Company" id="contactCompany">
      <input required placeholder="Email" id="contactEmail">
      <input placeholder="Phone" id="contactPhone">
      <button type="submit" class="btn">Add</button>
    </form>
  </div>`);
};

window.addContact = function(e) {
  e.preventDefault();
  contacts.push({ name: contactName.value, company: contactCompany.value, email: contactEmail.value, phone: contactPhone.value });
  closeModal(); searchContacts();
};

window.editContactDialog = function(idx) {
  const c = contacts[idx];
  showModal(`<div class="modal-content">
    <h3>Edit Contact</h3>
    <form onsubmit="editContact(event,${idx})">
      <input required id="editContactName" value="${c.name}">
      <input required id="editContactCompany" value="${c.company}">
      <input required id="editContactEmail" value="${c.email}">
      <input id="editContactPhone" value="${c.phone}">
      <button type="submit" class="btn">Update</button>
    </form>
  </div>`);
};

window.editContact = function(e, idx) {
  e.preventDefault();
  contacts[idx] = { name: editContactName.value, company: editContactCompany.value, email: editContactEmail.value, phone: editContactPhone.value };
  closeModal(); searchContacts();
};

window.deleteContact = function(idx) { contacts.splice(idx, 1); searchContacts(); };

// ========== DEALS ==========
function renderDeals() {
  document.getElementById("deals").innerHTML = `
    <h1>Deals</h1>
    <button onclick="addDealDialog()" class="btn">+ Add Deal</button>
    <table><thead><tr><th>Name</th><th>Stage</th><th>Amount</th><th>Contact</th><th>Action</th></tr></thead>
    <tbody id="dealRows"></tbody></table>
  `;
  loadDeals();
}

function loadDeals() {
  document.getElementById("dealRows").innerHTML = deals
    .map((d, i) => `<tr><td>${d.name}</td><td>${d.stage}</td><td>$${d.amount.toLocaleString()}</td><td>${d.contact}</td>
      <td>
        <button onclick="editDealDialog(${i})" class="btn" style="background:#f39c12">Edit</button>
        <button onclick="deleteDeal(${i})" class="btn" style="background:#e74c3c">Delete</button>
      </td></tr>`).join("");
}

window.addDealDialog = function() {
  showModal(`<div class="modal-content">
    <h3>Add Deal</h3>
    <form onsubmit="addDeal(event)">
      <input required placeholder="Deal Name" id="dealName">
      <select id="dealStage"><option>Prospecting</option><option>Negotiation</option><option>Closed</option></select>
      <input required type="number" placeholder="Amount" id="dealAmount">
      <select id="dealContact">${contacts.map(c => `<option>${c.name}</option>`).join("")}</select>
      <button type="submit" class="btn">Add</button>
    </form>
  </div>`);
};

window.addDeal = function(e) {
  e.preventDefault();
  deals.push({ name: dealName.value, stage: dealStage.value, amount: parseInt(dealAmount.value), contact: dealContact.value });
  closeModal(); loadDeals(); drawDealChart(); renderPipeline();
};

window.editDealDialog = function(idx) {
  const d = deals[idx];
  showModal(`<div class="modal-content">
    <h3>Edit Deal</h3>
    <form onsubmit="editDeal(event,${idx})">
      <input required id="editDealName" value="${d.name}">
      <select id="editDealStage">
        <option${d.stage === "Prospecting" ? " selected" : ""}>Prospecting</option>
        <option${d.stage === "Negotiation" ? " selected" : ""}>Negotiation</option>
        <option${d.stage === "Closed" ? " selected" : ""}>Closed</option>
      </select>
      <input required type="number" id="editDealAmount" value="${d.amount}">
      <select id="editDealContact">${contacts.map(c => `<option${c.name === d.contact ? " selected" : ""}>${c.name}</option>`).join("")}</select>
      <button type="submit" class="btn">Update</button>
    </form>
  </div>`);
};

window.editDeal = function(e, idx) {
  e.preventDefault();
  deals[idx] = { name: editDealName.value, stage: editDealStage.value, amount: parseInt(editDealAmount.value), contact: editDealContact.value };
  closeModal(); loadDeals(); drawDealChart(); renderPipeline();
};

window.deleteDeal = function(idx) { deals.splice(idx, 1); loadDeals(); drawDealChart(); renderPipeline(); };

// ========== PIPELINE (KANBAN) ==========
function renderPipeline() {
  document.getElementById("pipeline").innerHTML = `
    <h1>Deal Pipeline</h1>
    <div class="pipeline">
      <div><h3>Prospecting</h3><ul id="kanbanProspecting"></ul></div>
      <div><h3>Negotiation</h3><ul id="kanbanNegotiation"></ul></div>
      <div><h3>Closed</h3><ul id="kanbanClosed"></ul></div>
    </div>
  `;
  drawKanban();
}

function drawKanban() {
  document.getElementById("kanbanProspecting").innerHTML = deals.filter(d => d.stage === "Prospecting").map((d, i) => `<li draggable="true" ondragstart="drag(event,${i})">${d.name}<br>$${d.amount.toLocaleString()}</li>`).join("");
  document.getElementById("kanbanNegotiation").innerHTML = deals.filter(d => d.stage === "Negotiation").map((d, i) => `<li draggable="true" ondragstart="drag(event,${i})">${d.name}<br>$${d.amount.toLocaleString()}</li>`).join("");
  document.getElementById("kanbanClosed").innerHTML = deals.filter(d => d.stage === "Closed").map((d, i) => `<li draggable="true" ondragstart="drag(event,${i})">${d.name}<br>$${d.amount.toLocaleString()}</li>`).join("");
}

window.drag = function(event, idx) {
  event.dataTransfer.setData("dealIndex", idx);
};

["kanbanProspecting", "kanbanNegotiation", "kanbanClosed"].forEach(listId => {
  document.getElementById(listId).ondragover = function(e) { e.preventDefault(); };
  document.getElementById(listId).ondrop = function(e) {
    e.preventDefault();
    const idx = e.dataTransfer.getData("dealIndex");
    const stage = listId.replace("kanban", "");
    deals[idx].stage = stage.charAt(0).toUpperCase() + stage.slice(1);
    drawKanban(); loadDeals(); drawDealChart();
  };
});

// ========== TASKS ==========
function renderTasks() {
  document.getElementById("tasks").innerHTML = `
    <h1>Tasks</h1>
    <button onclick="addTaskDialog()" class="btn">+ Add Task</button>
    <table><thead><tr><th>Name</th><th>Assigned</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
    <tbody id="taskRows"></tbody></table>
  `;
  loadTasks();
}

function loadTasks() {
  document.getElementById("taskRows").innerHTML = tasks
    .map((t, i) => `<tr><td>${t.name}</td><td>${t.assigned}</td><td>${t.due}</td><td>${t.status}</td>
      <td>
        <button onclick="editTaskDialog(${i})" class="btn" style="background:#f39c12">Edit</button>
        <button onclick="deleteTask(${i})" class="btn" style="background:#e74c3c">Delete</button>
      </td></tr>`).join("");
}

window.addTaskDialog = function() {
  showModal(`<div class="modal-content">
    <h3>Add Task</h3>
    <form onsubmit="addTask(event)">
      <input required placeholder="Task Name" id="taskName">
      <select id="taskAssigned">${users.map(u => `<option>${u.name}</option>`).join("")}</select>
      <input type="date" id="taskDue" required>
      <select id="taskStatus"><option>Open</option><option>In Progress</option><option>Done</option></select>
      <button type="submit" class="btn">Add</button>
    </form>
  </div>`);
};

window.addTask = function(e) {
  e.preventDefault();
  tasks.push({ name: taskName.value, assigned: taskAssigned.value, due: taskDue.value, status: taskStatus.value });
  closeModal(); loadTasks();
};

window.editTaskDialog = function(idx) {
  const t = tasks[idx];
  showModal(`<div class="modal-content">
    <h3>Edit Task</h3>
    <form onsubmit="editTask(event,${idx})">
      <input required id="editTaskName" value="${t.name}">
      <select id="editTaskAssigned">${users.map(u => `<option${u.name === t.assigned ? ' selected' : ''}>${u.name}</option>`).join("")}</select>
      <input type="date" id="editTaskDue" value="${t.due}" required>
      <select id="editTaskStatus">
        <option${t.status === "Open" ? ' selected' : ''}>Open</option>
        <option${t.status === "In Progress" ? ' selected' : ''}>In Progress</option>
        <option${t.status === "Done" ? ' selected' : ''}>Done</option>
      </select>
      <button type="submit" class="btn">Update</button>
    </form>
  </div>`);
};

window.editTask = function(e, idx) {
  e.preventDefault();
  tasks[idx] = { name: editTaskName.value, assigned: editTaskAssigned.value, due: editTaskDue.value, status: editTaskStatus.value };
  closeModal(); loadTasks();
};

window.deleteTask = function(idx) { tasks.splice(idx, 1); loadTasks(); };

// ========== CALENDAR ==========
function renderCalendar() {
  document.getElementById("calendar").innerHTML = `
    <h1>Calendar</h1>
    <button onclick="addEventDialog()" class="btn">+ Add Event</button>
    <table><thead><tr><th>Title</th><th>Date</th><th>Assigned</th><th>Action</th></tr></thead>
    <tbody id="calRows"></tbody></table>
  `;
  loadCalendar();
}

function loadCalendar() {
  document.getElementById("calRows").innerHTML = calendarEvents
    .map((ev, i) => `<tr><td>${ev.title}</td><td>${ev.date}</td><td>${ev.assigned}</td>
      <td><button onclick="deleteEvent(${i})" class="btn" style="background:#e74c3c">Delete</button></td></tr>`).join("");
}

window.addEventDialog = function() {
  showModal(`<div class="modal-content">
    <h3>Add Event</h3>
    <form onsubmit="addEvent(event)">
      <input required placeholder="Event Title" id="eventTitle">
      <input type="date" id="eventDate" required>
      <select id="eventAssigned">${users.map(u => `<option>${u.name}</option>`).join("")}</select>
      <button type="submit" class="btn">Add</button>
    </form>
  </div>`);
};

window.addEvent = function(e) {
  e.preventDefault();
  calendarEvents.push({ title: eventTitle.value, date: eventDate.value, assigned: eventAssigned.value });
  closeModal(); loadCalendar();
};

window.deleteEvent = function(idx) { calendarEvents.splice(idx, 1); loadCalendar(); };

// ========== REPORTS ==========
function renderReports() {
  document.getElementById("reports").innerHTML = `
    <h1>Reports</h1>
    <div class="report-card"><h4>Closed Deals</h4><div class="report-value">${deals.filter(d => d.stage === "Closed").length}</div></div>
    <div class="report-card"><h4>Total Deal Value</h4><div class="report-value">$${deals.reduce((s, d) => s + d.amount, 0).toLocaleString()}</div></div>
    <div class="report-card"><h4>Open Tasks</h4><div class="report-value">${tasks.filter(t => t.status !== "Done").length}</div></div>
    <div class="chart-container" style="margin:40px 0;">
      <h2>Tasks by User</h2>
      <canvas id="reportChart" width="320" height="180"></canvas>
    </div>
  `;
  drawReportChart();
}

function drawReportChart() {
  const ctx = document.getElementById("reportChart");
  if (!ctx) return;
  const data = {};
  tasks.forEach(t => { data[t.assigned] = (data[t.assigned] || 0) + 1; });
  new Chart(ctx, {
    type: 'pie',
    data: { labels: Object.keys(data), datasets: [{ data: Object.values(data), backgroundColor: ["#3498db", "#f39c12", "#e74c3c"] }] },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
}

// ========== TEAMS ==========
function renderTeams() {
  document.getElementById("teams").innerHTML = `
    <h1>Teams</h1>
    ${teams.map(t => `
      <div style="margin:20px 0 30px 0;">
        <h2>${t.name}</h2>
        <ul>
          ${t.members.map(u =>
    `<li>${users.find(us => us.username === u)?.name || u} (${users.find(us => us.username === u)?.role || "User"})</li>`
  ).join("")}
        </ul>
      </div>
    `).join("")}
  `;
}

// ========== FILES ==========
function renderFiles() {
  document.getElementById("files").innerHTML = `
    <h1>File Attachments</h1>
    <input type="file" id="fileInput" multiple style="margin:16px 0;">
    <button onclick="uploadFiles()" class="btn">Upload</button>
    <table><thead><tr><th>Filename</th><th>Size (KB)</th><th>Action</th></tr></thead>
    <tbody id="fileRows"></tbody></table>
  `;
  loadFiles();
}

function loadFiles() {
  document.getElementById("fileRows").innerHTML = files.map((f, i) => `<tr>
    <td>${f.name}</td>
    <td>${Math.round(f.blob.size / 1024)}</td>
    <td>
      <button onclick="downloadFile(${i})" class="btn" style="background:#2ecc71">Download</button>
      <button onclick="deleteFile(${i})" class="btn" style="background:#e74c3c">Delete</button>
    </td>
  </tr>`).join("");
}

window.uploadFiles = function() {
  const inp = document.getElementById("fileInput");
  if (!inp.files.length) return;
  for (let i = 0; i < inp.files.length; i++) {
    files.push({ name: inp.files[i].name, blob: inp.files[i] });
  }
  inp.value = ""; loadFiles();
};

window.downloadFile = function(i) {
  const url = URL.createObjectURL(files[i].blob);
  const a = document.createElement("a");
  a.href = url; a.download = files[i].name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

window.deleteFile = function(i) { files.splice(i, 1); loadFiles(); };

// ========== PROFILE ==========
function renderProfile() {
  document.getElementById("profile").innerHTML = `
    <h1>User Profile</h1>
    <div><strong>Name:</strong> ${loggedInUser.name}</div>
    <div><strong>Username:</strong> ${loggedInUser.username}</div>
    <div><strong>Email:</strong> ${loggedInUser.email}</div>
    <div><strong>Role:</strong> ${loggedInUser.role}</div>
    <button onclick="showPwdChange()" class="btn" style="margin-top:20px;">Change Password</button>
  `;
}

// ========== SETTINGS ==========
function renderSettings() {
  document.getElementById("settings").innerHTML = `
    <h1>Settings</h1>
    <h2>Theme</h2>
    <button onclick="setTheme('light')" class="btn">Light</button>
    <button onclick="setTheme('dark')" class="btn">Dark</button>
    <hr>
    ${loggedInUser.role === "Admin" ? `
      <h2>User Management</h2>
      <button onclick="addUserDialog()" class="btn">Add User</button>
      <table style="margin-top:16px;"><tr><th>User</th><th>Name</th><th>Role</th><th>Email</th><th>Action</th></tr>
      ${users.map((u, i) => `<tr>
        <td>${u.username}</td><td>${u.name}</td><td>${u.role}</td><td>${u.email}</td>
        <td>${u.username !== "admin" ? `<button onclick="deleteUser(${i})" class="btn" style="background:#e74c3c">Delete</button>` : ""}</td>
      </tr>`).join("")}
      </table>
    ` : ""}
  `;
}

window.setTheme = function(mode) {
  if (mode === "dark") document.body.classList.add("dark");
  else document.body.classList.remove("dark");
};

window.addUserDialog = function() {
  showModal(`<div class="modal-content">
    <h3>Add User</h3>
    <form onsubmit="addUser(event)">
      <input placeholder="Username" id="newUser" required>
      <input placeholder="Name" id="newName" required>
      <input type="password" placeholder="Password" id="newPass" required>
      <input placeholder="Email" id="newEmail" type="email" required>
      <select id="newRole"><option>Sales</option><option>Manager</option><option>Admin</option></select>
      <button type="submit" class="btn">Add</button>
    </form>
  </div>`);
};

window.addUser = function(e) {
  e.preventDefault();
  users.push({
    username: newUser.value,
    password: newPass.value,
    name: newName.value,
    email: newEmail.value,
    role: newRole.value
  });
  closeModal(); renderSettings();
};

window.deleteUser = function(idx) { users.splice(idx, 1); renderSettings(); };

// ========== MODAL & PASSWORD CHANGE ==========
function showModal(html) {
  document.getElementById("modalBox").style.display = "block";
  document.getElementById("modalBG").style.display = "block";
  document.getElementById("modalContent").innerHTML = html;
}

function closeModal() {
  document.getElementById("modalBox").style.display = "none";
  document.getElementById("modalBG").style.display = "none";
}

window.showPwdChange = function() {
  showModal(`<div class="modal-content">
    <h3>Change Password</h3>
    <form onsubmit="changePass(event)">
      <input type="password" id="oldPwd" placeholder="Old password" required>
      <input type="password" id="newPwd1" placeholder="New password" required>
      <button type="submit" class="btn">Change</button>
    </form>
    <div id="pwdMsg" style="margin-top:10px;color:#e74c3c;"></div>
  </div>`);
};

window.changePass = function(e) {
  e.preventDefault();
  const old = document.getElementById("oldPwd").value;
  const nw = document.getElementById("newPwd1").value;
  if (old !== loggedInUser.password) document.getElementById("pwdMsg").textContent = "Incorrect old password";
  else {
    loggedInUser.password = nw;
    document.getElementById("pwdMsg").textContent = "Password changed!";
    document.getElementById("pwdMsg").style.color = "#2ecc71";
    setTimeout(closeModal, 1200);
  }
};

document.addEventListener("keydown", function(e) { if (e.key === "Escape") closeModal(); });
