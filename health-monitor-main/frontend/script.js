let patients = [];
 let editingIndex = null;
 let currentPatientId = null;
 

 async function fetchPatients() {
  const res = await fetch('http://localhost:3000/patients');
  patients = await res.json();
  renderPatients();
  updateDashboard();
  renderPrescriptionList();
 }
 

 function showPage(page) {
  document.getElementById('dashboard-page').style.display = (page === 'dashboard') ? '' : 'none';
  document.getElementById('details-page').style.display = (page === 'details') ? '' : 'none';
  document.getElementById('prescriptions-page').style.display = (page === 'prescriptions') ? '' : 'none';
  document.getElementById('nav-dashboard').classList.toggle('active', page === 'dashboard');
  document.getElementById('nav-details').classList.toggle('active', page === 'details');
  document.getElementById('nav-prescriptions').classList.toggle('active', page === 'prescriptions');
 

  if (page === 'dashboard') updateDashboard();
  if (page === 'details') fetchPatients();
  if (page === 'prescriptions') fetchPatients();
 }
 

 function updateDashboard() {
  let critical = patients.filter(p => p.status === "Critical").length;
  let stable = patients.filter(p => p.status === "Stable").length;
  document.getElementById('critical-count').textContent = critical;
  document.getElementById('stable-count').textContent = stable;
 }
 

 function renderPatients() {
  let tbody = document.getElementById('patients-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  patients.forEach((p, idx) => {
  let row = tbody.insertRow();
  let photoCell = row.insertCell();
  let img = document.createElement('img');
  img.src = p.photo || "https://cdn-icons-png.flaticon.com/512/387/387561.png";
  img.alt = "Patient Photo";
  img.className = "patient-photo-thumb";
  photoCell.appendChild(img);
 

  row.insertCell().textContent = p.name;
  row.insertCell().textContent = p.age;
  row.insertCell().textContent = p.height;
  row.insertCell().textContent = p.weight;
  row.insertCell().textContent = p.bp;
  row.insertCell().textContent = p.oxygen;
  row.insertCell().textContent = p.disease;
  row.insertCell().textContent = p.heartrate;
  row.insertCell().textContent = p.status;
 

  let actions = row.insertCell();
  actions.className = "actions";
 

  let editBtn = document.createElement('button');
  editBtn.textContent = "Edit";
  editBtn.className = "edit-btn";
  editBtn.onclick = () => openEditModal(idx);
  actions.appendChild(editBtn);
 

  let delBtn = document.createElement('button');
  delBtn.textContent = "Delete";
  delBtn.onclick = () => deletePatient(idx);
  actions.appendChild(delBtn);
 

  let prescriptionCell = row.insertCell();
  let viewPrescriptionBtn = document.createElement('button');
  viewPrescriptionBtn.textContent = "View";
  viewPrescriptionBtn.onclick = () => openPrescriptionInNewTab(p.prescription, p.name);
  prescriptionCell.appendChild(viewPrescriptionBtn);
  });
 }
 

 async function addPatient(event) {
  event.preventDefault();
  let photoInput = document.getElementById('photo');
  let newPatient = {
  photo: "",
  name: document.getElementById('name').value,
  age: parseInt(document.getElementById('age').value),
  height: parseInt(document.getElementById('height').value),
  weight: parseInt(document.getElementById('weight').value),
  bp: document.getElementById('bp').value,
  oxygen: parseInt(document.getElementById('oxygen').value),
  disease: document.getElementById('disease').value,
  heartrate: parseInt(document.getElementById('heartrate').value),
  status: document.getElementById('status').value,
  prescription: ""
  };
 

  async function sendPatient() {
  await fetch('http://localhost:3000/patients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newPatient)
  });
  document.getElementById('add-patient-form').reset();
  fetchPatients();
  showPage('details');
  }
 

  if (photoInput.files && photoInput.files[0]) {
  const reader = new FileReader();
  reader.onload = (e) => {
  newPatient.photo = e.target.result;
  sendPatient();
  };
  reader.readAsDataURL(photoInput.files[0]);
  } else {
  newPatient.photo = "https://cdn-icons-png.flaticon.com/512/387/387561.png";
  sendPatient();
  }
 }
 

 async function deletePatient(idx) {
  if (idx < 0 || idx >= patients.length) return;
  if (!confirm("Are you sure you want to delete this patient?")) return;
 

  const id = patients[idx]._id;
  await fetch(`http://localhost:3000/patients/${id}`, { method: 'DELETE' });
  fetchPatients();
 }
 

 function updateMainPhoto(event) {
  let input = event.target;
  if (input.files && input.files[0]) {
  let reader = new FileReader();
  reader.onload = function (e) {
  document.getElementById('main-photo-preview').src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
  }
 }
 

 function openEditModal(idx) {
  editingIndex = idx;
  let p = patients[idx];
  document.getElementById('edit-name').value = p.name;
  document.getElementById('edit-age').value = p.age;
  document.getElementById('edit-height').value = p.height;
  document.getElementById('edit-weight').value = p.weight;
  document.getElementById('edit-bp').value = p.bp;
  document.getElementById('edit-oxygen').value = p.oxygen;
  document.getElementById('edit-disease').value = p.disease;
  document.getElementById('edit-heartrate').value = p.heartrate;
  document.getElementById('edit-status').value = p.status;
  document.getElementById('edit-photo').value = ''; // Clear the file input
  document.getElementById('edit-modal-bg').classList.add('active');
 }
 

 function closeEditModal() {
  document.getElementById('edit-modal-bg').classList.remove('active');
  editingIndex = null;
 }
 

 async function saveEditedPatient(event) {
  event.preventDefault();
  if (editingIndex === null) return;
 

  let p = patients[editingIndex];
  let id = p._id;
  let photoInput = document.getElementById('edit-photo');
  let updatedPhoto = p.photo; // Default to existing photo
 

  async function updatePatient() {
  await fetch(`http://localhost:3000/patients/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
  name: document.getElementById('edit-name').value,
  age: parseInt(document.getElementById('edit-age').value),
  height: parseInt(document.getElementById('edit-height').value),
  weight: parseInt(document.getElementById('edit-weight').value),
  bp: document.getElementById('edit-bp').value,
  oxygen: parseInt(document.getElementById('edit-oxygen').value),
  disease: document.getElementById('edit-disease').value,
  heartrate: parseInt(document.getElementById('edit-heartrate').value),
  status: document.getElementById('edit-status').value,
  photo: updatedPhoto,
  prescription: p.prescription  // Keep existing prescription
  })
  });
  closeEditModal();
  fetchPatients();
  }
 

  if (photoInput.files && photoInput.files[0]) {
  const reader = new FileReader();
  reader.onload = (e) => {
  updatedPhoto = e.target.result;
  updatePatient();
  };
  reader.readAsDataURL(photoInput.files[0]);
  } else {
  updatePatient();
  }
 }
 

 function renderPrescriptionList() {
  const list = document.getElementById('prescription-list');
  list.innerHTML = '';
  patients.forEach(patient => {
  const li = document.createElement('li');
  li.textContent = `${patient.name} : `;
 

  const viewButton = document.createElement('button');
  viewButton.textContent = "View Prescription";
  viewButton.onclick = () => showPrescription(patient._id);
 

  li.appendChild(viewButton);
  list.appendChild(li);
  });
 }
 

 async function showPrescription(patientId) {
  currentPatientId = patientId;
  const patient = patients.find(p => p._id === patientId);
  if (patient) {
  document.getElementById('prescription-details').value = patient.prescription || "";
  showPage('prescriptions');
  }
 }
 

 document.getElementById('save-prescription-btn').addEventListener('click', async () => {
  if (currentPatientId) {
  const newPrescription = document.getElementById('prescription-details').value;
  await savePrescription(currentPatientId, newPrescription);
  fetchPatients();
  alert('Prescription saved!');
  }
 });
 

 async function savePrescription(patientId, prescription) {
  try {
  await fetch(`http://localhost:3000/patients/${patientId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prescription: prescription })
  });
  } catch (error) {
  console.error("Error saving prescription:", error);
  alert('Failed to save prescription.');
  }
 }
 

 function openPrescriptionInNewTab(prescriptionText, patientName) {
  const newWindow = window.open();
  newWindow.document.write(`<pre><h2>Prescription for ${patientName}</h2><br>${prescriptionText}</pre>`);
 }
 

 window.onload = () => showPage('dashboard');