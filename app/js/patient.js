document.addEventListener('DOMContentLoaded', () => {
    const patientContainer = document.querySelector('#patientView');
    if (!patientContainer) return;
  
    // We'll insert some UI into the patient view:
    // If the user is not logged in, show a "Go to Login" button.
    // If logged in, show buttons to fetch and add patients.
    setupPatientUI();
  });
  
  /**
   * Sets up the UI in #patientView depending on login status.
   */
  function setupPatientUI() {
    const patientContainer = document.querySelector('#patientView');
  
    // Check if we have a token from auth.js
    const isLoggedIn = Boolean(window.currentToken);
  
    if (!isLoggedIn) {
      patientContainer.innerHTML = `
        <div class="alert alert-warning" role="alert">
          You are not logged in. Please login first.
        </div>
        <button id="goLoginBtn" class="btn btn-primary">Go to Login</button>
      `;
      const goLoginBtn = document.getElementById('goLoginBtn');
      goLoginBtn.addEventListener('click', () => {
        // Switch view to the Login tab
        showView('loginView');
      });
      return;
    }
  
    // If logged in, show the patient UI
    patientContainer.innerHTML = `
      <h2>Patients</h2>
      <div class="mb-3">
        <button id="fetchPatientsBtn" class="btn btn-info">Fetch Patients</button>
        <button id="addPatientBtn" class="btn btn-success">Add Patient</button>
      </div>
      <div id="patientsList" class="border p-3 bg-light" style="min-height:100px;">
        <em>No patients fetched yet.</em>
      </div>
      <div id="patientForm" class="mt-3" style="display:none;">
        <div class="mb-2">
          <label for="patientNameInput" class="form-label">Patient Name:</label>
          <input type="text" id="patientNameInput" class="form-control" placeholder="Enter patient name" />
        </div>
        <button id="savePatientBtn" class="btn btn-primary">Save Patient</button>
      </div>
    `;
  
    const fetchPatientsBtn = document.getElementById('fetchPatientsBtn');
    const addPatientBtn = document.getElementById('addPatientBtn');
    const patientForm = document.getElementById('patientForm');
    const savePatientBtn = document.getElementById('savePatientBtn');
    const patientsList = document.getElementById('patientsList');
  
    // Button: Fetch all patients
    fetchPatientsBtn.addEventListener('click', async () => {
      try {
        const documents = await fetchAllPatients();
        if (documents && documents.length > 0) {
          patientsList.innerHTML = documents.map(doc => `
            <div class="border-bottom py-2">
              <strong>Patient ID:</strong> ${doc.id} <br/>
              <strong>Creation:</strong> ${doc.creationTimestamp} <br/>
              <strong>Data:</strong> ${JSON.stringify(doc.data)}
            </div>
          `).join('');
        } else {
          patientsList.innerHTML = `<em>No patient documents found.</em>`;
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        alert('Failed to fetch patients.\nCheck console for details.');
      }
    });
  
    // Button: Show Add Patient form
    addPatientBtn.addEventListener('click', () => {
      patientForm.style.display = 'block';
    });
  
    // Button: Create a new patient doc
    savePatientBtn.addEventListener('click', async () => {
      const nameInput = document.getElementById('patientNameInput');
      const nameValue = nameInput.value.trim();
      if (!nameValue) {
        alert('Please enter a patient name.');
        return;
      }
  
      try {
        const newDoc = await createPatientDocument(nameValue);
        alert(`Patient created! Document ID: ${newDoc.id}`);
        // Clear form, hide it
        nameInput.value = '';
        patientForm.style.display = 'none';
      } catch (err) {
        console.error('Error creating patient:', err);
        alert('Failed to create patient.\nCheck console for details.');
      }
    });
  }
  
  /**
   * Example: Fetch all patient documents from your "Patient Schema"
   * using an Extra Horizon endpoint. Adjust the URL and headers
   * per your environment’s specifics.
   */
  async function fetchAllPatients() {
    // Example schema ID for "Patient Schema":
    // You can also target by schema name if it’s valid: /{schemaName}/documents
    const schemaId = '67b3048f1eb074b87db826cb';
  
    // NOTE: This endpoint path is approximate. Check your actual environment’s base path.
    // Often it might be: /data/v1/{schemaIdOrName}/documents
    const response = await fetch(`https://api.dev.madglove.extrahorizon.io/data/v1/${schemaId}/documents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${window.currentToken}`
      }
    });
  
    if (!response.ok) {
      throw new Error(`Fetch error: HTTP ${response.status}`);
    }
  
    // The data service typically returns an object with "data" array
    const result = await response.json();
    return result.data; // If "data" is the array of documents
  }
  
  /**
   * Example: Create a new patient document.
   * Adjust the body as needed for your schema structure.
   */
  async function createPatientDocument(patientName) {
    const schemaId = '67b3048f1eb074b87db826cb';
  
    // If your schema expects the custom fields under "data", do something like:
    const payload = {
      data: {
        name: patientName
      }
    };
  
    const response = await fetch(`https://api.dev.madglove.extrahorizon.io/data/v1/${schemaId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.currentToken}`
      },
      body: JSON.stringify(payload)
    });
  
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Create error: HTTP ${response.status} - ${text}`);
    }
  
    const newDoc = await response.json();
    return newDoc; // e.g. { id, data, ... }
  }
  