import gsap from 'gsap';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase.js';
import { initializeFirestoreData, sanitizeForFirestore, defaultWeeklySlots } from './firestoreService.js';
import {
  initialDoctorProfile,
  initialPatients,
  initialAppointments,
  initialAppointmentRequests,
  initialPrescriptions,
  initialInvoices,
  initialNotificationSettings,
} from './mockData.js';
import { getIcon } from './icons.js';
import { showToast, animateViewIn } from './components/uiverse.js';
import { renderDashboardView } from './views/dashboard.js';
import { renderAppointmentsView } from './views/appointments.js';
import { renderOnlineConsultationsView } from './views/consultations.js';
import { renderAppointmentRequestsView } from './views/requests.js';
import { renderScheduleView } from './views/schedule.js';
import { renderPrescriptionsView } from './views/prescriptions.js';
import { renderPatientsView } from './views/patients.js';
import { renderInvoicesView } from './views/invoices.js';
import { renderSettingsView } from './views/settings.js';
import {
  openNewAppointmentModal,
  openNewPatientModal,
  openNewPrescriptionModal,
  openViewPrescriptionModal,
  openNewInvoiceModal,
  openViewInvoiceModal,
  openPatientDetailsModal,
} from './components/modals.js';

// Helper to get logged in doctor session
function getLoggedInDoctor() {
  try {
    // Check URL parameters first (e.g. ?name=Dr.+Sarah+Khan or ?email=...)
    const params = new URLSearchParams(window.location.search);
    const paramName = params.get('name') || params.get('doctor');
    const paramEmail = params.get('email');
    const paramRole = params.get('role');

    // Check localStorage saved session from login portal
    const storedUser = localStorage.getItem('medivibe_user') || 
                       localStorage.getItem('user') || 
                       localStorage.getItem('currentUser') || 
                       localStorage.getItem('doctorUser');
    
    let parsed = null;
    if (storedUser) {
      try {
        parsed = JSON.parse(storedUser);
      } catch (_) {
        parsed = { fullName: storedUser };
      }
    }

    const doctorName = paramName || parsed?.fullName || parsed?.name || parsed?.displayName || initialDoctorProfile.fullName;
    const doctorEmail = paramEmail || parsed?.email || initialDoctorProfile.email;
    const doctorSpecialty = parsed?.specialty || initialDoctorProfile.specialty;

    return {
      ...initialDoctorProfile,
      fullName: doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`,
      email: doctorEmail,
      specialty: doctorSpecialty,
    };
  } catch (_) {
    return { ...initialDoctorProfile };
  }
}

// Application State
const state = {
  activeTab: 'dashboard',
  darkMode: (localStorage.getItem('medivibe-theme') || localStorage.getItem('vitacare-theme')) === 'dark',
  searchQuery: '',
  sidebarOpen: false,
  doctorProfile: getLoggedInDoctor(),
  patients: [...initialPatients],
  appointments: [...initialAppointments],
  requests: [...initialAppointmentRequests],
  prescriptions: [...initialPrescriptions],
  invoices: [...initialInvoices],
  notificationSettings: { ...initialNotificationSettings },
  weeklySlots: [...defaultWeeklySlots],
};

// Initialize Theme
function applyTheme() {
  if (state.darkMode) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
}
applyTheme();

// Firestore Sync Listeners
function setupFirestoreListeners() {
  if (!db) return;
  const onSyncErr = (err) => {
    console.warn('Firestore subscription notice:', err?.message || String(err));
  };

  try {
    // 1. Doctor Profile
    onSnapshot(doc(db, 'doctorProfile', 'main'), (snap) => {
      if (snap.exists()) {
        state.doctorProfile = { ...state.doctorProfile, ...snap.data() };
        renderHeader();
        if (state.activeTab === 'dashboard' || state.activeTab === 'schedule' || state.activeTab === 'settings') {
          renderCurrentView();
        }
      }
    }, onSyncErr);

    // 2. Patients
    onSnapshot(collection(db, 'patients'), (snap) => {
      if (!snap.empty) {
        state.patients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (state.activeTab === 'dashboard' || state.activeTab === 'patients' || state.activeTab === 'appointments') {
          renderCurrentView();
        }
      }
    }, onSyncErr);

    // 3. Appointments
    onSnapshot(collection(db, 'appointments'), (snap) => {
      if (!snap.empty) {
        state.appointments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        renderSidebar();
        if (state.activeTab === 'dashboard' || state.activeTab === 'appointments') {
          renderCurrentView();
        }
      }
    }, onSyncErr);

    // 4. Appointment Requests
    onSnapshot(collection(db, 'appointmentRequests'), (snap) => {
      if (!snap.empty) {
        state.requests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        renderSidebar();
        if (state.activeTab === 'dashboard' || state.activeTab === 'requests') {
          renderCurrentView();
        }
      }
    }, onSyncErr);

    // 5. Prescriptions
    onSnapshot(collection(db, 'prescriptions'), (snap) => {
      if (!snap.empty) {
        state.prescriptions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (state.activeTab === 'prescriptions') {
          renderCurrentView();
        }
      }
    }, onSyncErr);

    // 6. Invoices
    onSnapshot(collection(db, 'invoices'), (snap) => {
      if (!snap.empty) {
        state.invoices = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (state.activeTab === 'dashboard' || state.activeTab === 'invoices') {
          renderCurrentView();
        }
      }
    }, onSyncErr);

    // 7. Weekly Slots
    onSnapshot(collection(db, 'weeklySlots'), (snap) => {
      if (!snap.empty) {
        state.weeklySlots = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (state.activeTab === 'schedule') {
          renderCurrentView();
        }
      }
    }, onSyncErr);

    // 8. Notifications
    onSnapshot(doc(db, 'notificationSettings', 'main'), (snap) => {
      if (snap.exists()) {
        state.notificationSettings = { ...state.notificationSettings, ...snap.data() };
        if (state.activeTab === 'settings') {
          renderCurrentView();
        }
      }
    }, onSyncErr);
  } catch (err) {
    console.warn('Firestore real-time sync offline notice:', err?.message || String(err));
  }
}

// Navigation Actions
export function navigateTo(tab) {
  if (state.activeTab === tab) return;
  state.activeTab = tab;
  state.sidebarOpen = false;
  renderSidebar();
  renderCurrentView();
}

// Firestore Mutations
async function updateAppointmentStatus(id, newStatus) {
  const apt = state.appointments.find((a) => a.id === id);
  if (!apt) return;
  const updated = { ...apt, status: newStatus };
  state.appointments = state.appointments.map((a) => (a.id === id ? updated : a));
  renderCurrentView();
  showToast(`Appointment status updated to ${newStatus}`, 'info');

  try {
    await setDoc(doc(db, 'appointments', id), sanitizeForFirestore(updated));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function addAppointment(newApt) {
  state.appointments = [newApt, ...state.appointments];
  renderSidebar();
  renderCurrentView();

  try {
    await setDoc(doc(db, 'appointments', newApt.id), sanitizeForFirestore(newApt));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function deleteAppointment(id) {
  state.appointments = state.appointments.filter((a) => a.id !== id);
  renderSidebar();
  renderCurrentView();
  showToast('Appointment removed from schedule', 'info');

  try {
    await deleteDoc(doc(db, 'appointments', id));
  } catch (err) {
    console.warn('Firestore delete notice:', err?.message || String(err));
  }
}

async function acceptRequest(req) {
  const newApt = {
    id: `apt-${Date.now()}`,
    patientId: `p-${Date.now()}`,
    patientName: req.patientName,
    patientCode: `P-${Math.floor(4800 + Math.random() * 50)}`,
    date: '2024-04-14',
    time: req.time,
    type: req.type,
    status: 'Upcoming',
    reason: req.reason,
  };

  const updatedReq = { ...req, status: 'accepted' };

  state.appointments = [newApt, ...state.appointments];
  state.requests = state.requests.map((r) => (r.id === req.id ? updatedReq : r));
  renderSidebar();
  renderCurrentView();
  showToast(`Accepted booking request from ${req.patientName}!`, 'success');

  try {
    await setDoc(doc(db, 'appointments', newApt.id), sanitizeForFirestore(newApt));
    await setDoc(doc(db, 'appointmentRequests', req.id), sanitizeForFirestore(updatedReq));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function declineRequest(id) {
  const req = state.requests.find((r) => r.id === id);
  if (!req) return;
  const updatedReq = { ...req, status: 'declined' };
  state.requests = state.requests.map((r) => (r.id === id ? updatedReq : r));
  renderSidebar();
  renderCurrentView();
  showToast(`Booking request declined`, 'info');

  try {
    await setDoc(doc(db, 'appointmentRequests', id), sanitizeForFirestore(updatedReq));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function toggleSlot(slotId) {
  const slot = state.weeklySlots.find((s) => s.id === slotId);
  if (!slot) return;

  let nextStatus = 'Booked';
  if (slot.status === 'Open') nextStatus = 'Booked';
  else if (slot.status === 'Booked') nextStatus = 'Disabled';
  else if (slot.status === 'Disabled') nextStatus = 'Open';

  const updated = { ...slot, status: nextStatus };
  if (nextStatus === 'Booked') {
    updated.patientName = 'Scheduled Patient';
  } else {
    delete updated.patientName;
  }

  state.weeklySlots = state.weeklySlots.map((s) => (s.id === slotId ? updated : s));
  renderCurrentView();

  try {
    await setDoc(doc(db, 'weeklySlots', slotId), sanitizeForFirestore(updated));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function updateDoctorStatus(status) {
  state.doctorProfile.availabilityStatus = status;
  renderHeader();
  renderSidebar();
  showToast(`Doctor availability changed to: ${status}`, 'info');

  try {
    await setDoc(doc(db, 'doctorProfile', 'main'), sanitizeForFirestore(state.doctorProfile));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function addPatient(patient) {
  state.patients = [patient, ...state.patients];
  renderCurrentView();

  try {
    await setDoc(doc(db, 'patients', patient.id), sanitizeForFirestore(patient));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function addPrescription(rx) {
  state.prescriptions = [rx, ...state.prescriptions];
  renderCurrentView();

  try {
    await setDoc(doc(db, 'prescriptions', rx.id), sanitizeForFirestore(rx));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function updatePrescriptionStatus(id, newStatus) {
  const rx = state.prescriptions.find((r) => r.id === id);
  if (!rx) return;
  const updated = { ...rx, status: newStatus };
  state.prescriptions = state.prescriptions.map((r) => (r.id === id ? updated : r));
  renderCurrentView();
  showToast(`Prescription ${rx.rxNumber} marked as ${newStatus}`, 'info');

  try {
    await setDoc(doc(db, 'prescriptions', id), sanitizeForFirestore(updated));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function addInvoice(inv) {
  state.invoices = [inv, ...state.invoices];
  renderCurrentView();

  try {
    await setDoc(doc(db, 'invoices', inv.id), sanitizeForFirestore(inv));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function updateInvoiceStatus(id, newStatus) {
  const inv = state.invoices.find((i) => i.id === id);
  if (!inv) return;
  const updated = { ...inv, status: newStatus };
  state.invoices = state.invoices.map((i) => (i.id === id ? updated : i));
  renderCurrentView();
  showToast(`Invoice ${inv.invoiceNumber} status set to ${newStatus}`, 'info');

  try {
    await setDoc(doc(db, 'invoices', id), sanitizeForFirestore(updated));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function updateDoctorProfile(profile) {
  state.doctorProfile = profile;
  renderHeader();
  renderSidebar();
  renderCurrentView();

  try {
    await setDoc(doc(db, 'doctorProfile', 'main'), sanitizeForFirestore(profile));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

async function updateNotificationSettings(settings) {
  state.notificationSettings = settings;

  try {
    await setDoc(doc(db, 'notificationSettings', 'main'), sanitizeForFirestore(settings));
  } catch (err) {
    console.warn('Firestore write notice:', err?.message || String(err));
  }
}

// Render Shell Components
function renderSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;

  const pendingRequests = state.requests.filter((r) => r.status === 'pending').length;
  const waitingApts = state.appointments.filter((a) => a.status === 'Waiting').length;

  const navSections = [
    {
      title: 'Clinical Practice',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'layoutDashboard' },
        { id: 'appointments', label: 'Appointments', icon: 'calendar', count: waitingApts },
        { id: 'online-consultations', label: 'Virtual Room', icon: 'video' },
        { id: 'requests', label: 'Booking Requests', icon: 'bell', count: pendingRequests },
      ]
    },
    {
      title: 'Patient Records',
      items: [
        { id: 'schedule', label: 'Doctor Schedule', icon: 'calendarClock' },
        { id: 'prescriptions', label: 'Prescriptions (RX)', icon: 'fileText' },
        { id: 'patients', label: 'Patients Directory', icon: 'users' },
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'invoices', label: 'Billing & Invoices', icon: 'creditCard' },
        { id: 'settings', label: 'Practice Settings', icon: 'settings' },
      ]
    }
  ];

  sidebar.innerHTML = `
    <div class="flex flex-col h-full overflow-hidden">
      <!-- Fixed Brand Header -->
      <div class="flex-shrink-0 p-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2.5 cursor-pointer group" id="brand-logo-btn">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] via-[#0369a1] to-[#0ea5e9] flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              ${getIcon('activity', 'w-4 h-4 text-white')}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-extrabold text-base text-slate-900 dark:text-white tracking-tight leading-none block">MediVibe</span>
                <span class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">OS</span>
              </div>
              <span class="text-[9px] text-sky-600 dark:text-sky-400 font-bold tracking-wider uppercase block mt-0.5">Clinical Suite</span>
            </div>
          </div>
          <button id="btn-close-mobile-sidebar" class="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-white">
            ${getIcon('x', 'w-4 h-4')}
          </button>
        </div>
      </div>

      <!-- Navigation Sections with hidden/clean scrollbar -->
      <nav class="flex-1 overflow-y-auto sidebar-nav-scroll p-3 space-y-3">
        ${navSections.map((section) => `
          <div>
            <div class="sidebar-section-header">${section.title}</div>
            <div class="space-y-0.5 mt-1">
              ${section.items.map((item) => `
                <button
                  data-nav-tab="${item.id}"
                  class="uiverse-nav-link w-full text-left py-2 px-2.5 ${state.activeTab === item.id ? 'active' : ''}"
                >
                  ${getIcon(item.icon, 'w-4 h-4')}
                  <span class="flex-1 truncate text-xs font-semibold">${item.label}</span>
                  ${item.count ? `<span class="px-1.5 py-0.2 text-[10px] font-bold rounded-full ${state.activeTab === item.id ? 'bg-white text-sky-800 shadow-xs' : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'}">${item.count}</span>` : ''}
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </nav>

      <!-- Fixed Doctor Footer Card with Quick Presence Selector -->
      <div class="flex-shrink-0 p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60">
        <div class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div class="flex items-center gap-2.5">
            <div class="relative flex-shrink-0">
              <img
                src="${state.doctorProfile.avatarUrl}"
                alt="${state.doctorProfile.fullName}"
                class="w-8 h-8 rounded-full object-cover border-2 border-sky-500 shadow-xs"
              />
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>
            <div class="overflow-hidden flex-1 min-w-0">
              <h4 class="font-bold text-xs text-slate-900 dark:text-white truncate">${state.doctorProfile.fullName}</h4>
              <span class="text-[10px] text-slate-600 dark:text-slate-400 font-semibold truncate block">${state.doctorProfile.specialty}</span>
            </div>
          </div>

          <div class="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <select id="sidebar-quick-presence" class="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer outline-none shadow-xs flex-1">
              <option value="In Clinic" ${state.doctorProfile.availabilityStatus === 'In Clinic' ? 'selected' : ''}>🏥 In Clinic</option>
              <option value="Online" ${state.doctorProfile.availabilityStatus === 'Online' ? 'selected' : ''}>🌐 Online</option>
              <option value="On Break" ${state.doctorProfile.availabilityStatus === 'On Break' ? 'selected' : ''}>☕ Break</option>
              <option value="Unavailable" ${state.doctorProfile.availabilityStatus === 'Unavailable' ? 'selected' : ''}>⛔ Busy</option>
            </select>
            <button id="sidebar-logout-btn" title="Sign Out to Portal" class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
              ${getIcon('logOut', 'w-3.5 h-3.5')}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach nav handlers
  sidebar.querySelectorAll('[data-nav-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-nav-tab');
      navigateTo(tab);
    });
  });

  document.getElementById('brand-logo-btn')?.addEventListener('click', () => navigateTo('dashboard'));
  document.getElementById('sidebar-quick-presence')?.addEventListener('change', (e) => {
    updateDoctorStatus(e.target.value);
  });
  document.getElementById('sidebar-logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('medivibe_user');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('doctorUser');
    showToast('Signing out...', 'info');
    setTimeout(() => {
      // If auth.html or doctor-dashboard.html exists in repo, redirect back to login
      window.location.href = 'auth.html';
    }, 500);
  });
  document.getElementById('btn-close-mobile-sidebar')?.addEventListener('click', () => {
    state.sidebarOpen = false;
    updateMobileSidebarVisibility();
  });
}

function getFormattedClinicTime() {
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return now.toLocaleDateString('en-US', options);
}

function renderHeader() {
  const header = document.getElementById('app-header');
  if (!header) return;

  const pendingRequests = state.requests.filter((r) => r.status === 'pending').length;

  header.innerHTML = `
    <div class="flex items-center justify-between h-16 px-4 sm:px-6">
      <div class="flex items-center gap-3 flex-1 max-w-lg">
        <!-- Mobile Sidebar Toggle -->
        <button id="btn-toggle-mobile-sidebar" class="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          ${getIcon('menu', 'w-5 h-5')}
        </button>

        <!-- Uiverse Search Bar with Shortcut Badge -->
        <div class="uiverse-input-wrapper">
          <span class="uiverse-input-icon">${getIcon('search', 'w-4 h-4')}</span>
          <input
            id="global-search-input"
            type="text"
            placeholder="Search patients, medical codes, appointments..."
            value="${state.searchQuery}"
            class="uiverse-input pr-16"
          />
          <span class="absolute right-2.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 pointer-events-none">
            ⌘K
          </span>
        </div>
      </div>

      <!-- Right Header Actions -->
      <div class="flex items-center gap-3">
        <!-- Live Clinic Time Indicator -->
        <div class="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span id="live-header-clock">${getFormattedClinicTime()}</span>
        </div>

        <!-- Quick Header New Appointment Action -->
        <button id="header-quick-new-apt" class="hidden md:inline-flex uiverse-btn uiverse-btn-primary text-xs py-1.5 px-3 shadow-xs">
          ${getIcon('plus', 'w-3.5 h-3.5')}
          <span>New Appointment</span>
        </button>

        <!-- Uiverse Animated Theme Switch (Dark / Light) -->
        <div class="flex items-center gap-1.5 px-2" title="Toggle Theme">
          <span class="text-slate-500 dark:text-slate-400 hidden sm:inline-block">${getIcon('sun', 'w-4 h-4')}</span>
          <label class="uiverse-switch">
            <input type="checkbox" id="theme-toggle-switch" ${state.darkMode ? 'checked' : ''}>
            <span class="uiverse-slider"></span>
          </label>
          <span class="text-slate-500 dark:text-slate-400 hidden sm:inline-block">${getIcon('moon', 'w-4 h-4')}</span>
        </div>

        <!-- Notification Bell -->
        <button id="header-notif-btn" class="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="${pendingRequests} Pending Booking Requests">
          ${getIcon('bell', 'w-4 h-4')}
          ${pendingRequests > 0 ? `<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>` : ''}
        </button>

        <!-- Doctor Avatar & Status -->
        <div id="header-profile-btn" class="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition-opacity">
          <img
            src="${state.doctorProfile.avatarUrl}"
            alt="${state.doctorProfile.fullName}"
            class="w-8 h-8 rounded-full object-cover border-2 border-sky-500 shadow-xs"
          />
          <div class="hidden lg:block text-left">
            <span class="text-xs font-bold text-slate-900 dark:text-white block leading-tight">${state.doctorProfile.fullName}</span>
            <span class="text-[10px] text-sky-600 dark:text-sky-400 font-bold leading-tight">${state.doctorProfile.clinicName}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach header handlers
  document.getElementById('btn-toggle-mobile-sidebar')?.addEventListener('click', () => {
    state.sidebarOpen = !state.sidebarOpen;
    updateMobileSidebarVisibility();
  });

  const searchInput = document.getElementById('global-search-input');
  searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderCurrentView();
  });

  document.getElementById('header-quick-new-apt')?.addEventListener('click', () => {
    openNewAppointmentModal({ patients: state.patients, onAddAppointment: addAppointment });
  });

  document.getElementById('theme-toggle-switch')?.addEventListener('change', (e) => {
    state.darkMode = e.target.checked;
    localStorage.setItem('medivibe-theme', state.darkMode ? 'dark' : 'light');
    applyTheme();
    showToast(state.darkMode ? 'Dark mode enabled' : 'Light mode enabled', 'info');
  });

  document.getElementById('header-notif-btn')?.addEventListener('click', () => {
    navigateTo('requests');
  });

  document.getElementById('header-profile-btn')?.addEventListener('click', () => {
    navigateTo('settings');
  });
}

function updateMobileSidebarVisibility() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');
  if (!sidebar || !overlay) return;

  if (state.sidebarOpen) {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2 });
  } else {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  }
}

// Render Current View
function renderCurrentView() {
  const container = document.getElementById('main-view-outlet');
  if (!container) return;

  let viewHtml = '';

  switch (state.activeTab) {
    case 'dashboard':
      viewHtml = renderDashboardView({
        appointments: state.appointments,
        patients: state.patients,
        invoices: state.invoices,
        requests: state.requests,
        onNavigateTab: navigateTo,
        onUpdateAppointmentStatus: updateAppointmentStatus,
        onAcceptRequest: acceptRequest,
        onDeclineRequest: declineRequest,
        onOpenNewAppointmentModal: () => openNewAppointmentModal({ patients: state.patients, onAddAppointment: addAppointment }),
      });
      break;

    case 'appointments':
      viewHtml = renderAppointmentsView({
        appointments: state.appointments,
        patients: state.patients,
        onAddAppointment: addAppointment,
        onUpdateStatus: updateAppointmentStatus,
        onDeleteAppointment: deleteAppointment,
        onOpenNewAppointmentModal: () => openNewAppointmentModal({ patients: state.patients, onAddAppointment: addAppointment }),
        onNavigateTab: navigateTo,
        searchQuery: state.searchQuery,
      });
      break;

    case 'online-consultations':
      viewHtml = renderOnlineConsultationsView({
        onIssuePrescription: addPrescription,
      });
      break;

    case 'requests':
      viewHtml = renderAppointmentRequestsView({
        requests: state.requests,
        onAcceptRequest: acceptRequest,
        onDeclineRequest: declineRequest,
      });
      break;

    case 'schedule':
      viewHtml = renderScheduleView({
        weeklySlots: state.weeklySlots,
        doctorProfile: state.doctorProfile,
        onToggleSlot: toggleSlot,
        onUpdateDoctorStatus: updateDoctorStatus,
      });
      break;

    case 'prescriptions':
      viewHtml = renderPrescriptionsView({
        prescriptions: state.prescriptions,
        patients: state.patients,
        onOpenNewPrescriptionModal: () => openNewPrescriptionModal({ patients: state.patients, onAddPrescription: addPrescription }),
        onViewPrescriptionModal: openViewPrescriptionModal,
        onUpdateStatus: updatePrescriptionStatus,
      });
      break;

    case 'patients':
      viewHtml = renderPatientsView({
        patients: state.patients,
        onOpenNewPatientModal: () => openNewPatientModal({ onAddPatient: addPatient }),
        onViewPatientModal: openPatientDetailsModal,
        searchQuery: state.searchQuery,
      });
      break;

    case 'invoices':
      viewHtml = renderInvoicesView({
        invoices: state.invoices,
        patients: state.patients,
        onOpenNewInvoiceModal: () => openNewInvoiceModal({ patients: state.patients, onAddInvoice: addInvoice }),
        onViewInvoiceModal: openViewInvoiceModal,
        onUpdateInvoiceStatus: updateInvoiceStatus,
      });
      break;

    case 'settings':
      viewHtml = renderSettingsView({
        doctorProfile: state.doctorProfile,
        notificationSettings: state.notificationSettings,
        onUpdateProfile: updateDoctorProfile,
        onUpdateNotifications: updateNotificationSettings,
      });
      break;

    default:
      viewHtml = `<div class="p-8 text-center text-slate-400">View not found</div>`;
  }

  container.innerHTML = viewHtml;
  animateViewIn('main-view-outlet');
}

// App Initialization
let appInitialized = false;
function initApp() {
  if (appInitialized) return;
  appInitialized = true;

  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <div class="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-300">
      <!-- Mobile Backdrop Overlay -->
      <div id="mobile-sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 lg:hidden hidden"></div>

      <!-- App Sidebar (Persistent on lg, Drawer on mobile) -->
      <aside
        id="app-sidebar"
        class="fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#0d1527] border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 -translate-x-full shadow-xs"
      ></aside>

      <!-- Main Content Stage -->
      <div class="flex-1 flex flex-col lg:pl-64 min-w-0">
        <!-- Top App Header -->
        <header id="app-header" class="sticky top-0 z-30 bg-white dark:bg-[#0d1527] border-b border-slate-200 dark:border-slate-800 shadow-xs"></header>

        <!-- Dynamic Main View Outlet -->
        <main class="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <div id="main-view-outlet"></div>
        </main>
      </div>
    </div>
  `;

  // Attach backdrop click to close mobile drawer
  document.getElementById('mobile-sidebar-overlay')?.addEventListener('click', () => {
    state.sidebarOpen = false;
    updateMobileSidebarVisibility();
  });

  renderSidebar();
  renderHeader();
  renderCurrentView();

  // Firestore seeding & live listener initialization
  initializeFirestoreData().then(() => {
    setupFirestoreListeners();
  });

  // Automatic Firebase Auth state detection (no URL params needed)
  if (auth) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        let name = user.displayName;
        let specialty = null;
        let clinic = null;

        // Try to fetch custom profile from users or doctors collection
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            name = data.fullName || data.name || name;
            specialty = data.specialty || null;
            clinic = data.clinicName || null;
          } else {
            const docDoc = await getDoc(doc(db, 'doctors', user.uid));
            if (docDoc.exists()) {
              const dData = docDoc.data();
              name = dData.fullName || dData.name || name;
              specialty = dData.specialty || null;
              clinic = dData.clinicName || null;
            }
          }
        } catch (_) {}

        if (!name && user.email) {
          name = user.email.split('@')[0];
        }

        if (name) {
          const formattedName = name.startsWith('Dr.') ? name : `Dr. ${name}`;
          state.doctorProfile.fullName = formattedName;
          state.doctorProfile.email = user.email || state.doctorProfile.email;
          if (specialty) state.doctorProfile.specialty = specialty;
          if (clinic) state.doctorProfile.clinicName = clinic;

          // Save session to localStorage so refresh remains instant
          localStorage.setItem('medivibe_user', JSON.stringify({
            fullName: formattedName,
            email: user.email,
            uid: user.uid,
            specialty: state.doctorProfile.specialty,
            clinicName: state.doctorProfile.clinicName,
          }));

          renderSidebar();
          renderHeader();
          if (state.activeTab === 'dashboard' || state.activeTab === 'settings') {
            renderCurrentView();
          }
        }
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
