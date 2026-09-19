import gsap from 'gsap';
import { getIcon } from '../icons.js';
import { showToast } from './uiverse.js';

let modalBackdrop = null;

function getBackdrop() {
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'uiverse-modal-container';
    modalBackdrop.className = 'uiverse-modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }
  return modalBackdrop;
}

export function closeModal() {
  const backdrop = getBackdrop();
  const content = backdrop.querySelector('.uiverse-modal-content');
  if (content) {
    gsap.to(content, {
      scale: 0.95,
      opacity: 0,
      y: 10,
      duration: 0.2,
      onComplete: () => {
        backdrop.classList.remove('open');
        backdrop.innerHTML = '';
      },
    });
  } else {
    backdrop.classList.remove('open');
    backdrop.innerHTML = '';
  }
}

// 1. New Appointment Modal
export function openNewAppointmentModal({ patients, onAddAppointment }) {
  const backdrop = getBackdrop();
  backdrop.innerHTML = `
    <div class="uiverse-modal-content p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          ${getIcon('calendar', 'w-4 h-4 text-[var(--primary-blue)]')}
          <span>Schedule New Appointment</span>
        </h3>
        <button id="modal-btn-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          ${getIcon('x', 'w-5 h-5')}
        </button>
      </div>

      <form id="form-new-appointment" class="space-y-3.5 text-xs">
        <div>
          <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Select Patient</label>
          <select id="modal-apt-patient" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]">
            ${patients.map((p) => `
              <option value="${p.id}" data-name="${p.name}" data-code="${p.patientCode}">${p.name} (${p.patientCode} - ${p.condition})</option>
            `).join('')}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Appointment Type</label>
            <select id="modal-apt-type" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]">
              <option value="In clinic">In clinic</option>
              <option value="Online">Online Video</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Consultation Time</label>
            <input id="modal-apt-time" type="time" value="10:30" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono outline-none focus:border-[var(--primary-blue)]" />
          </div>
        </div>

        <div>
          <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Clinical Reason / Chief Complaint</label>
          <input id="modal-apt-reason" type="text" placeholder="e.g. Chest pain follow-up, ECG review" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]" />
        </div>

        <div>
          <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Initial Status</label>
          <select id="modal-apt-status" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]">
            <option value="Waiting">Waiting in Queue</option>
            <option value="Upcoming">Upcoming</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" id="modal-btn-cancel" class="uiverse-btn uiverse-btn-outline">Cancel</button>
          <button type="submit" class="uiverse-btn uiverse-btn-primary shadow-md">Confirm & Book</button>
        </div>
      </form>
    </div>
  `;

  backdrop.classList.add('open');
  gsap.fromTo(backdrop.querySelector('.uiverse-modal-content'), { scale: 0.9, opacity: 0, y: 15 }, { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(1.5)' });

  document.getElementById('modal-btn-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-btn-cancel')?.addEventListener('click', closeModal);

  document.getElementById('form-new-appointment')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const select = document.getElementById('modal-apt-patient');
    const selectedOption = select.options[select.selectedIndex];
    const patientId = select.value;
    const patientName = selectedOption.getAttribute('data-name');
    const patientCode = selectedOption.getAttribute('data-code');
    const type = document.getElementById('modal-apt-type').value;
    const time = document.getElementById('modal-apt-time').value;
    const reason = document.getElementById('modal-apt-reason').value;
    const status = document.getElementById('modal-apt-status').value;

    onAddAppointment({
      id: `apt-${Date.now()}`,
      patientId,
      patientName,
      patientCode,
      date: '2024-04-14',
      time,
      type,
      status,
      reason,
    });

    showToast(`Appointment scheduled for ${patientName}!`, 'success');
    closeModal();
  });
}

// 2. Register New Patient Modal
export function openNewPatientModal({ onAddPatient }) {
  const backdrop = getBackdrop();
  backdrop.innerHTML = `
    <div class="uiverse-modal-content p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          ${getIcon('users', 'w-4 h-4 text-[var(--primary-blue)]')}
          <span>Register New Patient</span>
        </h3>
        <button id="modal-btn-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
          ${getIcon('x', 'w-5 h-5')}
        </button>
      </div>

      <form id="form-new-patient" class="space-y-3.5 text-xs">
        <div>
          <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Full Name</label>
          <input id="pat-name" type="text" placeholder="e.g. Eleanor Vance" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]" />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Age</label>
            <input id="pat-age" type="number" value="35" min="1" max="120" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]" />
          </div>
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Gender</label>
            <select id="pat-gender" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Blood Group</label>
            <select id="pat-blood" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono font-bold outline-none focus:border-[var(--primary-blue)]">
              <option value="O+">O+</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O-</option>
              <option value="A-">A-</option>
              <option value="B-">B-</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Primary Clinical Diagnosis / Condition</label>
          <input id="pat-condition" type="text" placeholder="e.g. Mild Hypertension, Bronchial Asthma" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Phone Number</label>
            <input id="pat-phone" type="text" placeholder="+1 555 000 0000" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]" />
          </div>
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Known Allergies</label>
            <input id="pat-allergies" type="text" placeholder="e.g. Penicillin, Peanuts (or None)" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" id="modal-btn-cancel" class="uiverse-btn uiverse-btn-outline">Cancel</button>
          <button type="submit" class="uiverse-btn uiverse-btn-primary shadow-md">Register Patient</button>
        </div>
      </form>
    </div>
  `;

  backdrop.classList.add('open');
  gsap.fromTo(backdrop.querySelector('.uiverse-modal-content'), { scale: 0.9, opacity: 0, y: 15 }, { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(1.5)' });

  document.getElementById('modal-btn-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-btn-cancel')?.addEventListener('click', closeModal);

  document.getElementById('form-new-patient')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('pat-name').value;
    const age = parseInt(document.getElementById('pat-age').value, 10);
    const gender = document.getElementById('pat-gender').value;
    const bloodGroup = document.getElementById('pat-blood').value;
    const condition = document.getElementById('pat-condition').value;
    const phone = document.getElementById('pat-phone').value;
    const allergies = document.getElementById('pat-allergies').value || 'None known';

    onAddPatient({
      id: `p-${Date.now()}`,
      name,
      age,
      gender,
      patientCode: `P-${Math.floor(4830 + Math.random() * 50)}`,
      condition,
      status: 'Active',
      phone,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      bloodGroup,
      allergies,
      lastVisit: '2024-04-14',
    });

    showToast(`Patient ${name} registered in clinical directory!`, 'success');
    closeModal();
  });
}

// 3. New Prescription Modal
export function openNewPrescriptionModal({ patients, onAddPrescription }) {
  const backdrop = getBackdrop();
  backdrop.innerHTML = `
    <div class="uiverse-modal-content p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          ${getIcon('fileText', 'w-4 h-4 text-[var(--primary-blue)]')}
          <span>Issue Medical Prescription (RX)</span>
        </h3>
        <button id="modal-btn-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
          ${getIcon('x', 'w-5 h-5')}
        </button>
      </div>

      <form id="form-new-rx" class="space-y-3.5 text-xs">
        <div>
          <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Patient</label>
          <select id="rx-patient-select" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]">
            ${patients.map((p) => `<option value="${p.name}">${p.name} (${p.patientCode})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Medication Names & Strengths</label>
          <input id="rx-form-meds" type="text" placeholder="e.g. Amoxicillin 500mg, Paracetamol 650mg" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Dosage Frequency</label>
            <input id="rx-form-dosage" type="text" placeholder="1-0-1 (After food)" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]" />
          </div>
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Course Duration (Days)</label>
            <input id="rx-form-days" type="number" value="7" min="1" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" id="modal-btn-cancel" class="uiverse-btn uiverse-btn-outline">Cancel</button>
          <button type="submit" class="uiverse-btn uiverse-btn-primary shadow-md">Sign & Issue</button>
        </div>
      </form>
    </div>
  `;

  backdrop.classList.add('open');
  gsap.fromTo(backdrop.querySelector('.uiverse-modal-content'), { scale: 0.9, opacity: 0, y: 15 }, { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(1.5)' });

  document.getElementById('modal-btn-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-btn-cancel')?.addEventListener('click', closeModal);

  document.getElementById('form-new-rx')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const patientName = document.getElementById('rx-patient-select').value;
    const medicines = document.getElementById('rx-form-meds').value;
    const dosage = document.getElementById('rx-form-dosage').value;
    const days = parseInt(document.getElementById('rx-form-days').value, 10);

    onAddPrescription({
      id: `rx-${Date.now()}`,
      rxNumber: `RX-${Math.floor(2045 + Math.random() * 50)}`,
      patientName,
      medicines,
      date: '2024-04-14',
      status: 'Issued',
      dosage,
      days,
    });

    showToast(`Prescription issued to ${patientName}!`, 'success');
    closeModal();
  });
}

// 4. View / Print Prescription Modal
export function openViewPrescriptionModal(rx) {
  const backdrop = getBackdrop();
  backdrop.innerHTML = `
    <div class="uiverse-modal-content p-6 space-y-4 max-w-lg">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          ${getIcon('fileText', 'w-4 h-4 text-[var(--primary-blue)]')}
          <span>Official Prescription Order</span>
        </h3>
        <button id="modal-btn-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
          ${getIcon('x', 'w-5 h-5')}
        </button>
      </div>

      <div class="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 space-y-4 text-xs">
        <div class="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div>
            <h4 class="font-bold text-sm text-sky-600 dark:text-sky-400">MediVibe Clinical Health Suite</h4>
            <span class="text-xs text-slate-600 dark:text-slate-400 font-semibold">Dr. Amara Okafor, MD • Internal Medicine</span>
          </div>
          <span class="font-mono font-bold text-slate-900 dark:text-white">${rx.rxNumber}</span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
          <div><span class="font-semibold text-slate-400 block">Patient:</span> <span class="font-bold text-slate-900 dark:text-white text-sm">${rx.patientName}</span></div>
          <div><span class="font-semibold text-slate-400 block">Date of Order:</span> ${rx.date}</div>
        </div>

        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 border border-slate-100 dark:border-slate-800">
          <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Rx Medication Directive</span>
          <div class="font-bold text-sm text-slate-900 dark:text-white">${rx.medicines}</div>
          <div class="text-slate-600 dark:text-slate-300">Instructions: Take <span class="font-mono font-semibold">${rx.dosage}</span> for <span class="font-semibold">${rx.days} consecutive days</span>.</div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <span>Digital Signature: Verified Physician</span>
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold">● Status: ${rx.status}</span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2">
        <button id="modal-btn-close-2" class="uiverse-btn uiverse-btn-outline">Close</button>
        <button id="btn-print-rx" class="uiverse-btn uiverse-btn-primary shadow-md">
          ${getIcon('printer', 'w-4 h-4')}
          <span>Print RX Order</span>
        </button>
      </div>
    </div>
  `;

  backdrop.classList.add('open');
  gsap.fromTo(backdrop.querySelector('.uiverse-modal-content'), { scale: 0.9, opacity: 0, y: 15 }, { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(1.5)' });

  document.getElementById('modal-btn-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-btn-close-2')?.addEventListener('click', closeModal);
  document.getElementById('btn-print-rx')?.addEventListener('click', () => {
    window.print();
  });
}

// 5. Create Invoice Modal
export function openNewInvoiceModal({ patients, onAddInvoice }) {
  const backdrop = getBackdrop();
  backdrop.innerHTML = `
    <div class="uiverse-modal-content p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          ${getIcon('creditCard', 'w-4 h-4 text-[var(--primary-blue)]')}
          <span>Create Patient Invoice</span>
        </h3>
        <button id="modal-btn-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
          ${getIcon('x', 'w-5 h-5')}
        </button>
      </div>

      <form id="form-new-invoice" class="space-y-3.5 text-xs">
        <div>
          <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Patient</label>
          <select id="inv-patient-select" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]">
            ${patients.map((p) => `<option value="${p.name}">${p.name} (${p.patientCode})</option>`).join('')}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Consultation Fee ($)</label>
            <input id="inv-consult-fee" type="number" value="150" step="10" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono outline-none focus:border-[var(--primary-blue)]" />
          </div>
          <div>
            <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Clinical Diagnostics ($)</label>
            <input id="inv-lab-fee" type="number" value="30" step="5" required class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono outline-none focus:border-[var(--primary-blue)]" />
          </div>
        </div>

        <div>
          <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Payment Status</label>
          <select id="inv-status-select" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-[var(--primary-blue)]">
            <option value="Paid">Paid in Full</option>
            <option value="Unpaid">Unpaid / Billed</option>
            <option value="Partial">Partial Settlement</option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" id="modal-btn-cancel" class="uiverse-btn uiverse-btn-outline">Cancel</button>
          <button type="submit" class="uiverse-btn uiverse-btn-primary shadow-md">Generate Invoice</button>
        </div>
      </form>
    </div>
  `;

  backdrop.classList.add('open');
  gsap.fromTo(backdrop.querySelector('.uiverse-modal-content'), { scale: 0.9, opacity: 0, y: 15 }, { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(1.5)' });

  document.getElementById('modal-btn-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-btn-cancel')?.addEventListener('click', closeModal);

  document.getElementById('form-new-invoice')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const patientName = document.getElementById('inv-patient-select').value;
    const consultationFee = parseFloat(document.getElementById('inv-consult-fee').value);
    const clinicalServices = parseFloat(document.getElementById('inv-lab-fee').value);
    const amount = consultationFee + clinicalServices;
    const status = document.getElementById('inv-status-select').value;

    onAddInvoice({
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(1050 + Math.random() * 50)}`,
      patientName,
      date: '2024-04-14',
      consultationFee,
      clinicalServices,
      amount,
      status,
    });

    showToast(`Invoice generated for ${patientName} ($${amount.toFixed(2)})!`, 'success');
    closeModal();
  });
}

// 6. View & Print Invoice Receipt Modal
export function openViewInvoiceModal(inv) {
  const backdrop = getBackdrop();
  backdrop.innerHTML = `
    <div class="uiverse-modal-content p-6 space-y-4 max-w-lg">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          ${getIcon('creditCard', 'w-4 h-4 text-[var(--primary-blue)]')}
          <span>Billing Receipt & Statement</span>
        </h3>
        <button id="modal-btn-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
          ${getIcon('x', 'w-5 h-5')}
        </button>
      </div>

      <div class="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 space-y-4 text-xs font-mono">
        <div class="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800 font-sans">
          <div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">MediVibe Clinic Billing & Finance</h4>
            <span class="text-xs text-slate-600 dark:text-slate-400 font-semibold">Invoice: ${inv.invoiceNumber}</span>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'}">${inv.status}</span>
        </div>

        <div class="space-y-1 font-sans">
          <div class="text-slate-500">Billed To: <span class="font-bold text-slate-900 dark:text-white">${inv.patientName}</span></div>
          <div class="text-slate-500">Date Issued: <span>${inv.date}</span></div>
        </div>

        <div class="border-t border-b py-2 space-y-1.5 border-slate-100 dark:border-slate-800">
          <div class="flex justify-between">
            <span class="text-slate-500 font-sans">Consultation Fee</span>
            <span>$${inv.consultationFee.toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-sans">Clinical Diagnostic Services</span>
            <span>$${inv.clinicalServices.toFixed(2)}</span>
          </div>
        </div>

        <div class="flex justify-between text-base font-bold text-slate-900 dark:text-white">
          <span>Total Balance</span>
          <span>$${inv.amount.toFixed(2)}</span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2">
        <button id="modal-btn-close-2" class="uiverse-btn uiverse-btn-outline">Close</button>
        <button id="btn-print-inv" class="uiverse-btn uiverse-btn-primary shadow-md">
          ${getIcon('printer', 'w-4 h-4')}
          <span>Print Receipt</span>
        </button>
      </div>
    </div>
  `;

  backdrop.classList.add('open');
  gsap.fromTo(backdrop.querySelector('.uiverse-modal-content'), { scale: 0.9, opacity: 0, y: 15 }, { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(1.5)' });

  document.getElementById('modal-btn-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-btn-close-2')?.addEventListener('click', closeModal);
  document.getElementById('btn-print-inv')?.addEventListener('click', () => {
    window.print();
  });
}

// 7. Patient Details File Modal
export function openPatientDetailsModal(patient) {
  const backdrop = getBackdrop();
  backdrop.innerHTML = `
    <div class="uiverse-modal-content p-6 space-y-4 max-w-lg">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          ${getIcon('user', 'w-4 h-4 text-[var(--primary-blue)]')}
          <span>Patient Clinical Profile</span>
        </h3>
        <button id="modal-btn-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
          ${getIcon('x', 'w-5 h-5')}
        </button>
      </div>

      <div class="space-y-4 text-xs">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--primary-blue)] to-[var(--deep-blue)] text-white font-bold text-lg flex items-center justify-center shadow-md">
            ${patient.name.charAt(0)}
          </div>
          <div>
            <h4 class="font-bold text-base text-slate-900 dark:text-white">${patient.name}</h4>
            <div class="text-slate-500 font-mono text-[11px]">${patient.patientCode} • ${patient.age}y, ${patient.gender}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <span class="text-slate-400 font-semibold block text-[10px] uppercase">Primary Diagnosis</span>
            <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">${patient.condition}</span>
          </div>
          <div>
            <span class="text-slate-400 font-semibold block text-[10px] uppercase">Blood Group</span>
            <span class="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">${patient.bloodGroup}</span>
          </div>
          <div>
            <span class="text-slate-400 font-semibold block text-[10px] uppercase">Allergies</span>
            <span class="font-semibold text-amber-600 dark:text-amber-400">${patient.allergies || 'None'}</span>
          </div>
          <div>
            <span class="text-slate-400 font-semibold block text-[10px] uppercase">Last Clinical Visit</span>
            <span class="text-slate-600 dark:text-slate-300">${patient.lastVisit}</span>
          </div>
        </div>

        <div class="space-y-1">
          <span class="text-slate-400 font-semibold text-[10px] uppercase">Contact Details</span>
          <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            ${getIcon('phone', 'w-3.5 h-3.5 text-[var(--primary-blue)]')}
            <span>${patient.phone}</span>
          </div>
          <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            ${getIcon('mail', 'w-3.5 h-3.5 text-[var(--primary-blue)]')}
            <span>${patient.email}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button id="modal-btn-close-2" class="uiverse-btn uiverse-btn-outline">Close Record</button>
      </div>
    </div>
  `;

  backdrop.classList.add('open');
  gsap.fromTo(backdrop.querySelector('.uiverse-modal-content'), { scale: 0.9, opacity: 0, y: 15 }, { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: 'back.out(1.5)' });

  document.getElementById('modal-btn-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-btn-close-2')?.addEventListener('click', closeModal);
}
