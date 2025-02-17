document.addEventListener('DOMContentLoaded', () => {
  const patientContainer = document.querySelector('#patientView');
  if (!patientContainer) return;

  setupPatientUI();
});

function setupPatientUI() {
  const patientContainer = document.querySelector('#patientView');

  // Always show the UI, even if not logged in.
  patientContainer.innerHTML = `
    <h2>Patients & Schemas</h2>
    <div class="mb-3">
      <button id="getSchemasBtn" class="btn btn-warning">Get Schemas</button>
      <button id="fetchPatientsBtn" class="btn btn-info">Fetch Patients</button>
      <button id="addPatientBtn" class="btn btn-success">Add Patient</button>
    </div>

    <!-- Schemas section -->
    <div id="schemasList" class="border p-3 bg-light mt-3">
      <em>No schemas fetched yet.</em>
    </div>

    <!-- Patients section -->
    <div id="patientsList" class="border p-3 bg-light mt-3">
      <em>No patients fetched yet.</em>
    </div>

    <!-- Add Patient form -->
    <div id="patientForm" class="mt-3" style="display:none;">
      <div class="mb-2">
        <label for="patientNameInput" class="form-label">Patient Name:</label>
        <input type="text" id="patientNameInput" class="form-control" placeholder="Enter patient name" />
      </div>
      <button id="savePatientBtn" class="btn btn-primary">Save Patient</button>
    </div>
  `;

  // Grab references to new buttons/elements
  const getSchemasBtn = document.getElementById('getSchemasBtn');
  const fetchPatientsBtn = document.getElementById('fetchPatientsBtn');
  const addPatientBtn = document.getElementById('addPatientBtn');
  const patientForm = document.getElementById('patientForm');
  const savePatientBtn = document.getElementById('savePatientBtn');
  const patientsList = document.getElementById('patientsList');
  const schemasList = document.getElementById('schemasList');

  // (1) Get Schemas
  getSchemasBtn.addEventListener('click', async () => {
    if (!window.currentToken) {
      alert('No token found! Please log in first.');
      return;
    }

    try {
      const schemaData = await fetchSchemas();
      if (schemaData && schemaData.data && schemaData.data.length) {
        schemasList.innerHTML = schemaData.data
          .map(schema => `
            <div class="border-bottom py-2">
              <strong>Schema ID:</strong> ${schema.id}<br/>
              <strong>Name:</strong> ${schema.name}<br/>
              <strong>Description:</strong> ${schema.description || 'No description'}
            </div>
          `)
          .join('');
      } else {
        schemasList.innerHTML = `<em>No schemas found.</em>`;
      }
    } catch (err) {
      console.error('Error fetching schemas:', err);
      alert('Failed to fetch schemas. See console for details.');
    }
  });

  // (2) Fetch Patient Documents
  fetchPatientsBtn.addEventListener('click', async () => {
    if (!window.currentToken) {
      alert('No token found! Please log in first.');
      return;
    }

    try {
      const documents = await fetchAllPatients();
      if (documents && documents.length > 0) {
        patientsList.innerHTML = documents.map(doc => `
          <div class="border-bottom py-2">
            <strong>Patient ID:</strong> ${doc.id}<br/>
            <strong>Creation:</strong> ${doc.creationTimestamp}<br/>
            <strong>Data:</strong> ${JSON.stringify(doc.data)}
          </div>
        `).join('');
      } else {
        patientsList.innerHTML = `<em>No patient documents found.</em>`;
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      alert('Failed to fetch patients. See console for details.');
    }
  });

  // (3) Show Add Patient form
  addPatientBtn.addEventListener('click', () => {
    patientForm.style.display = 'block';
  });

  // (4) Create a new patient doc
  savePatientBtn.addEventListener('click', async () => {
    if (!window.currentToken) {
      alert('No token found! Please log in first.');
      return;
    }

    const nameInput = document.getElementById('patientNameInput');
    const nameValue = nameInput.value.trim();
    if (!nameValue) {
      alert('Please enter a patient name.');
      return;
    }

    try {
      const newDoc = await createPatientDocument(nameValue);
      alert(`Patient created!\nDocument ID: ${newDoc.id}`);
      // Clear form, hide it
      nameInput.value = '';
      patientForm.style.display = 'none';
    } catch (err) {
      console.error('Error creating patient:', err);
      alert('Failed to create patient. See console for details.');
    }
  });
}

/**
 * GET all schemas to verify your token and see what's in the Data Service.
 */
async function fetchSchemas() {
  const res = await fetch('https://api.dev.madglove.extrahorizon.io/data/v1/schemas', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${window.currentToken}`
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetchSchemas() error ${res.status} - ${text}`);
  }
  return await res.json(); // should be { data: [...] }
}

/**
 * GET all patient documents from your schema with id '67b3048f1eb074b87db826cb'.
 * Adjust if your schema name is valid or if you have a different ID.
 */
async function fetchAllPatients() {
  const schemaId = '67b3048f1eb074b87db826cb';
  const url = `https://api.dev.madglove.extrahorizon.io/data/v1/${schemaId}/documents`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${window.currentToken}`
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetchAllPatients() error ${res.status} - ${text}`);
  }
  const data = await res.json();
  // Typically, the data object might be { data: [ ... ] } or something similar
  return data.data; 
}

/**
 * POST to create a new patient document in the schema.
 * Adds a "name" field under data.
 */
async function createPatientDocument(patientName) {
  const schemaId = '67b3048f1eb074b87db826cb';
  const url = `https://api.dev.madglove.extrahorizon.io/data/v1/${schemaId}/documents`;

  const payload = {
    data: { name: patientName }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.currentToken}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createPatientDocument() error ${res.status} - ${text}`);
  }
  return await res.json();
}
