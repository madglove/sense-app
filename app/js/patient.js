document.addEventListener('DOMContentLoaded', () => {
  const patientContainer = document.querySelector('#patientView');
  if (!patientContainer) return;

  setupPatientUI();
});

function setupPatientUI() {
  const patientContainer = document.querySelector('#patientView');

  // Always show the UI, even if not logged in.
  patientContainer.innerHTML = `
    <h2>Patient Form</h2>
    <!-- Add Patient form -->
    <div id="patientForm" class="mt-3">
      <div class="mb-2">
        <label for="patientNameInput" class="form-label">Patient Name:</label>
        <input type="text" id="patientNameInput" class="form-control" placeholder="Enter patient name" required />
      </div>
      <div class="mb-2">
        <label for="patientAgeInput" class="form-label">Age:</label>
        <input type="number" id="patientAgeInput" class="form-control" placeholder="Enter age" required />
      </div>
      <div class="mb-2">
        <label for="patientGenderInput" class="form-label">Gender:</label>
        <select id="patientGenderInput" class="form-control" required>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="mb-2">
        <label for="patientDobInput" class="form-label">Date of Birth:</label>
        <input type="date" id="patientDobInput" class="form-control" required />
      </div>
      <div class="mb-2">
        <label for="patientPhoneInput" class="form-label">Phone Number:</label>
        <input type="text" id="patientPhoneInput" class="form-control" placeholder="Enter phone number" required />
      </div>
      <div class="mb-2">
        <label for="patientEmailInput" class="form-label">Email:</label>
        <input type="email" id="patientEmailInput" class="form-control" placeholder="Enter email" />
      </div>
      <div class="mb-2">
        <label for="patientAllergiesInput" class="form-label">Allergies:</label>
        <input type="text" id="patientAllergiesInput" class="form-control" placeholder="Enter allergies" />
      </div>
      <div class="mb-2">
        <label for="patientMedicalHistoryInput" class="form-label">Medical History:</label>
        <input type="text" id="patientMedicalHistoryInput" class="form-control" placeholder="Enter medical history" />
      </div>
      <div class="mb-2">
        <label for="patientMedicationsInput" class="form-label">Current Medications:</label>
        <input type="text" id="patientMedicationsInput" class="form-control" placeholder="Enter current medications" />
      </div>
      <div class="mb-2">
        <label for="emergencyContactNameInput" class="form-label">Emergency Contact Name:</label>
        <input type="text" id="emergencyContactNameInput" class="form-control" placeholder="Enter emergency contact name" required />
      </div>
      <div class="mb-2">
        <label for="emergencyContactPhoneInput" class="form-label">Emergency Contact Phone Number:</label>
        <input type="text" id="emergencyContactPhoneInput" class="form-control" placeholder="Enter emergency contact phone number" required />
      </div>
      <button id="savePatientBtn" class="btn btn-primary">Save Patient</button>
    </div>
  `;

  // Grab references to new buttons/elements
  const savePatientBtn = document.getElementById('savePatientBtn');

  // (1) Create a new patient doc
  savePatientBtn.addEventListener('click', async () => {
    if (!window.currentToken) {
      alert('No token found! Please log in first.');
      return;
    }

    const nameInput = document.getElementById('patientNameInput');
    const ageInput = document.getElementById('patientAgeInput');
    const genderInput = document.getElementById('patientGenderInput');
    const dobInput = document.getElementById('patientDobInput');
    const phoneInput = document.getElementById('patientPhoneInput');
    const emailInput = document.getElementById('patientEmailInput');
    const allergiesInput = document.getElementById('patientAllergiesInput');
    const medicalHistoryInput = document.getElementById('patientMedicalHistoryInput');
    const medicationsInput = document.getElementById('patientMedicationsInput');
    const emergencyContactNameInput = document.getElementById('emergencyContactNameInput');
    const emergencyContactPhoneInput = document.getElementById('emergencyContactPhoneInput');

    const patientData = {
      name: nameInput.value.trim(),
      age: parseInt(ageInput.value.trim(), 10),
      gender: genderInput.value,
      dateOfBirth: dobInput.value,
      phoneNumber: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      allergies: allergiesInput.value.trim().split(',').map(item => item.trim()),
      medicalHistory: medicalHistoryInput.value.trim().split(',').map(item => item.trim()),
      currentMedications: medicationsInput.value.trim().split(',').map(item => item.trim()),
      emergencyContact: {
        name: emergencyContactNameInput.value.trim(),
        phoneNumber: emergencyContactPhoneInput.value.trim()
      }
    };

    if (!patientData.name || !patientData.age || !patientData.gender || !patientData.dateOfBirth || !patientData.phoneNumber || !patientData.emergencyContact.name || !patientData.emergencyContact.phoneNumber) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const newDoc = await createPatientDocument(patientData);
      alert(`Patient created!\nDocument ID: ${newDoc.id}`);
      // Clear form
      nameInput.value = '';
      ageInput.value = '';
      genderInput.value = '';
      dobInput.value = '';
      phoneInput.value = '';
      emailInput.value = '';
      allergiesInput.value = '';
      medicalHistoryInput.value = '';
      medicationsInput.value = '';
      emergencyContactNameInput.value = '';
      emergencyContactPhoneInput.value = '';
    } catch (err) {
      console.error('Error creating patient:', err);
      alert('Failed to create patient. See console for details.');
    }
  });
}

/**
 * POST to create a new patient document in the schema.
 * Adds a "name" field under data.
 */
async function createPatientDocument(patientData) {
  const schemaId = '67b3048f1eb074b87db826cb';
  const url = `https://api.dev.madglove.extrahorizon.io/data/v1/${schemaId}/documents`;

  const payload = {
    data: patientData
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