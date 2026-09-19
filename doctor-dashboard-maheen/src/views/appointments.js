import { getIcon } from '../icons.js';
import { renderUiverseStatusBadge, animateCardsIn } from '../components/uiverse.js';

let activeFilter = 'All';

export function renderAppointmentsView({
  appointments,
  patients,
  onAddAppointment,
  onUpdateStatus,
  onDeleteAppointment,
  onOpenNewAppointmentModal,
  onNavigateTab,
  searchQuery = '',
}) {
  const inClinicCount = appointments.filter((a) => a.type === 'In clinic').length;
  const onlineCount = appointments.filter((a) => a.type === 'Online').length;
  const waitingCount = appointments.filter((a) => a.status === 'Waiting').length;
  const inProgressCount = appointments.filter((a) => a.status === 'In Progress').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'All') return true;
    if (activeFilter === 'In clinic') return apt.type === 'In clinic';
    if (activeFilter === 'Online') return apt.type === 'Online';
    if (activeFilter === 'Waiting') return apt.status === 'Waiting';
    if (activeFilter === 'Completed') return apt.status === 'Completed';
    return true;
  });

  const filterTabs = [
    { label: 'All', count: appointments.length },
    { label: 'Waiting', count: waitingCount },
    { label: 'In clinic', count: inClinicCount },
    { label: 'Online', count: onlineCount },
    { label: 'Completed', count: completedCount },
  ];

  const html = `
    <div id="view-appointments" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Clinical Appointments
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Manage patient consultations, triage complaints, and attendance flow.
          </p>
        </div>

        <button id="btn-open-appointment-modal" class="uiverse-btn uiverse-btn-primary shadow-xs">
          ${getIcon('plus', 'w-4 h-4')}
          <span>New Appointment</span>
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        ${filterTabs.map((tab) => `
          <button data-filter="${tab.label}" class="uiverse-pill-filter ${activeFilter === tab.label ? 'active' : ''} flex items-center gap-1.5 font-bold">
            <span>${tab.label}</span>
            <span class="text-xs px-2 py-0.5 rounded-full ${activeFilter === tab.label ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'} font-bold">
              ${tab.count}
            </span>
          </button>
        `).join('')}
      </div>

      <!-- Main Appointments Table Card -->
      <div class="uiverse-card p-6 space-y-4 border border-slate-200 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
            Displaying ${filtered.length} of ${appointments.length} Consultations
          </span>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">Clinic Session: Today (14 Apr 2024)</span>
        </div>

        <div class="table-clean-scroll rounded-xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th class="py-3 px-3">Patient Profile</th>
                <th class="py-3 px-3 whitespace-nowrap">Schedule Slot</th>
                <th class="py-3 px-3 whitespace-nowrap">Consult Type</th>
                <th class="py-3 px-3">Chief Complaint</th>
                <th class="py-3 px-3 whitespace-nowrap">Status</th>
                <th class="py-3 px-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="6" class="py-12 text-center text-slate-500 text-xs">
                    ${getIcon('calendar', 'w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2')}
                    <span class="font-bold text-slate-700 dark:text-slate-300 block">No consultations found</span>
                    No appointments match the selected filter.
                  </td>
                </tr>
              ` : filtered.map((apt) => `
                <tr class="hover:bg-sky-50/40 dark:hover:bg-slate-800/60 transition-colors">
                  <td class="py-3.5 px-3">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ${apt.patientName.charAt(0)}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white">${apt.patientName}</div>
                        <div class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">${apt.patientCode}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-3 font-mono text-xs font-bold text-slate-900 dark:text-slate-200">${apt.time}</td>
                  <td class="py-3.5 px-3">
                    <span class="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      ${apt.type === 'Online' ? getIcon('video', 'w-4 h-4 text-sky-600 dark:text-sky-400') : getIcon('stethoscope', 'w-4 h-4 text-sky-600 dark:text-sky-400')}
                      <span>${apt.type}</span>
                    </span>
                  </td>
                  <td class="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium max-w-[180px] sm:max-w-xs truncate" title="${apt.reason}">${apt.reason}</td>
                  <td class="py-3.5 px-3">
                    ${renderUiverseStatusBadge(apt.status)}
                  </td>
                  <td class="py-3.5 px-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      ${apt.type === 'Online' && onNavigateTab ? `
                        <button data-join-telehealth class="btn-join-telehealth px-2.5 py-1.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-transform active:scale-95 flex items-center gap-1">
                          ${getIcon('video', 'w-3.5 h-3.5')}
                          <span>Join Room</span>
                        </button>
                      ` : ''}
                      ${apt.status === 'Waiting' ? `
                        <button data-quick-call="${apt.id}" class="btn-quick-call px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-transform active:scale-95">
                          Call In
                        </button>
                      ` : ''}
                      <select data-apt-id="${apt.id}" class="select-change-status-apt text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-slate-100 font-semibold cursor-pointer outline-none shadow-xs">
                        <option value="Waiting" ${apt.status === 'Waiting' ? 'selected' : ''}>Waiting</option>
                        <option value="In Progress" ${apt.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${apt.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Upcoming" ${apt.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
                        <option value="Cancelled" ${apt.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                      </select>
                      <button data-delete-apt="${apt.id}" title="Remove appointment" class="btn-delete-apt p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border border-slate-200 dark:border-slate-700">
                        ${getIcon('trash', 'w-4 h-4')}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    animateCardsIn('.uiverse-card');

    document.getElementById('btn-open-appointment-modal')?.addEventListener('click', onOpenNewAppointmentModal);

    // Filter pill buttons
    document.querySelectorAll('.uiverse-pill-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter');
        const container = document.getElementById('main-view-outlet');
        if (container) {
          container.innerHTML = renderAppointmentsView({
            appointments,
            patients,
            onAddAppointment,
            onUpdateStatus,
            onDeleteAppointment,
            onOpenNewAppointmentModal,
            onNavigateTab,
            searchQuery,
          });
        }
      });
    });

    // Quick call in
    document.querySelectorAll('.btn-quick-call').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-quick-call');
        onUpdateStatus(id, 'In Progress');
      });
    });

    // Join Telehealth
    document.querySelectorAll('.btn-join-telehealth').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (onNavigateTab) onNavigateTab('online-consultations');
      });
    });

    // Change status select
    document.querySelectorAll('.select-change-status-apt').forEach((select) => {
      select.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-apt-id');
        onUpdateStatus(id, e.target.value);
      });
    });

    // Delete appointment
    document.querySelectorAll('.btn-delete-apt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-apt');
        onDeleteAppointment(id);
      });
    });
  }, 10);

  return html;
}
