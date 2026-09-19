import { getIcon } from '../icons.js';
import { renderUiverseMetricCard, renderUiverseStatusBadge, animateCardsIn } from '../components/uiverse.js';

let dashboardQueueFilter = 'All';

export function renderDashboardView({
  appointments,
  patients,
  invoices,
  requests,
  onNavigateTab,
  onUpdateAppointmentStatus,
  onAcceptRequest,
  onDeclineRequest,
  onOpenNewAppointmentModal,
}) {
  const waitingCount = appointments.filter((a) => a.status === 'Waiting').length;
  const inProgressCount = appointments.filter((a) => a.status === 'In Progress').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const upcomingCount = appointments.filter((a) => a.status === 'Upcoming').length;
  const activePatientsCount = patients.filter((p) => p.status === 'Active').length;
  const totalRevenue = invoices.reduce((acc, inv) => (inv.status === 'Paid' ? acc + inv.amount : acc), 0);
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const shiftProgressPercent = appointments.length ? Math.round((completedCount / appointments.length) * 100) : 0;

  // Filtered queue
  const displayQueue = appointments.filter((apt) => {
    if (dashboardQueueFilter === 'All') return true;
    if (dashboardQueueFilter === 'Waiting') return apt.status === 'Waiting';
    if (dashboardQueueFilter === 'In Progress') return apt.status === 'In Progress';
    if (dashboardQueueFilter === 'Completed') return apt.status === 'Completed';
    if (dashboardQueueFilter === 'Upcoming') return apt.status === 'Upcoming';
    return true;
  });

  const filterPills = [
    { id: 'All', label: 'All Queue', count: appointments.length },
    { id: 'Waiting', label: 'Waiting in Hall', count: waitingCount },
    { id: 'In Progress', label: 'In Consult', count: inProgressCount },
    { id: 'Upcoming', label: 'Upcoming', count: upcomingCount },
    { id: 'Completed', label: 'Completed', count: completedCount },
  ];

  const html = `
    <div id="view-dashboard" class="space-y-6">
      <!-- Clean Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Clinical Practice Overview
            </h1>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Clinic Open
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Dr. Amara Okafor • Suite 402 • Today: 14 Apr 2024 (${waitingCount} waiting, ${appointments.length} total scheduled)
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button id="btn-quick-new-apt" class="uiverse-btn uiverse-btn-primary shadow-xs">
            ${getIcon('plus', 'w-4 h-4')}
            <span>New Appointment</span>
          </button>
          <button id="btn-quick-consult" class="uiverse-btn uiverse-btn-outline font-semibold">
            ${getIcon('video', 'w-4 h-4 text-sky-600 dark:text-sky-400')}
            <span>Telehealth Suite</span>
          </button>
        </div>
      </div>

      <!-- Metric Cards Grid (4 in a row) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${renderUiverseMetricCard({
          id: 'card-queue',
          title: 'Active Queue',
          value: `${waitingCount + inProgressCount}`,
          subtitle: `${waitingCount} waiting • ${inProgressCount} in consult`,
          iconName: 'users',
          badgeText: `${waitingCount} in hall`,
          theme: 'blue',
        })}
        ${renderUiverseMetricCard({
          id: 'card-visits',
          title: 'Total Consultations',
          value: `${appointments.length}`,
          subtitle: `${completedCount} completed • ${appointments.length - completedCount} pending`,
          iconName: 'calendar',
          badgeText: `${shiftProgressPercent}% done`,
          theme: 'emerald',
        })}
        ${renderUiverseMetricCard({
          id: 'card-patients',
          title: 'Active Patients',
          value: `${activePatientsCount}`,
          subtitle: 'Under ongoing clinical care',
          iconName: 'activity',
          badgeText: 'Active EHR',
          theme: 'violet',
        })}
        ${renderUiverseMetricCard({
          id: 'card-revenue',
          title: 'Invoiced Revenue',
          value: `$${totalRevenue.toLocaleString()}`,
          subtitle: 'Consultation & lab fees',
          iconName: 'creditCard',
          badgeText: 'Today',
          theme: 'amber',
        })}
      </div>

      <!-- Full-Width Patient Consultation Queue Table -->
      <div class="uiverse-card p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              ${getIcon('clock', 'w-4 h-4 text-sky-600 dark:text-sky-400')}
              <span>Today's Consultation Flow & Patient Queue</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Arrival schedule, medical complaints, and live triage status
            </p>
          </div>
          <button id="link-view-all-appointments" class="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
            <span>All Consultations (${appointments.length})</span>
            ${getIcon('arrowRight', 'w-3.5 h-3.5')}
          </button>
        </div>

        <!-- Filter Tabs -->
        <div class="flex flex-wrap items-center gap-2">
          ${filterPills.map((pill) => `
            <button
              data-dashboard-filter="${pill.id}"
              class="uiverse-pill-filter ${dashboardQueueFilter === pill.id ? 'active' : ''} flex items-center gap-1.5"
            >
              <span>${pill.label}</span>
              <span class="text-[11px] font-bold px-1.5 py-0.2 rounded-full ${dashboardQueueFilter === pill.id ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">
                ${pill.count}
              </span>
            </button>
          `).join('')}
        </div>

        <!-- Table Container with clean overflow handling -->
        <div class="table-clean-scroll rounded-xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr class="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th class="py-2.5 px-3 w-10 text-center">#</th>
                <th class="py-2.5 px-3">Patient Profile</th>
                <th class="py-2.5 px-3 whitespace-nowrap">Time & Slot</th>
                <th class="py-2.5 px-3">Chief Complaint</th>
                <th class="py-2.5 px-3 whitespace-nowrap">Status</th>
                <th class="py-2.5 px-3 text-right whitespace-nowrap">Triage Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              ${displayQueue.length === 0 ? `
                <tr>
                  <td colspan="6" class="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                    No patients found in this queue category.
                  </td>
                </tr>
              ` : displayQueue.map((apt, index) => {
                const isWaiting = apt.status === 'Waiting';
                const isInProgress = apt.status === 'In Progress';
                return `
                  <tr class="hover:bg-sky-50/30 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-3 px-3 text-center">
                      <span class="w-6 h-6 mx-auto rounded-full ${isInProgress ? 'bg-sky-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium'} text-[11px] flex items-center justify-center">
                        ${index + 1}
                      </span>
                    </td>
                    <td class="py-3 px-3">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                          ${apt.patientName.charAt(0)}
                        </div>
                        <div class="min-w-0">
                          <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span class="truncate">${apt.patientName}</span>
                            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700 whitespace-nowrap">${apt.patientCode}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-3 whitespace-nowrap">
                      <div class="font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">${apt.time}</div>
                      <span class="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ${apt.type === 'Online' ? getIcon('video', 'w-3 h-3 text-sky-600 dark:text-sky-400') : getIcon('stethoscope', 'w-3 h-3 text-emerald-600 dark:text-emerald-400')}
                        <span>${apt.type}</span>
                      </span>
                    </td>
                    <td class="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      <div class="flex items-center gap-1.5">
                        <span>${apt.reason}</span>
                        ${isWaiting ? '<span class="inline-flex items-center text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 whitespace-nowrap">In waiting room</span>' : ''}
                      </div>
                    </td>
                    <td class="py-3 px-3 whitespace-nowrap">
                      ${renderUiverseStatusBadge(apt.status)}
                    </td>
                    <td class="py-3 px-3 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        ${isWaiting ? `
                          <button data-quick-action="In Progress" data-apt-id="${apt.id}" class="btn-quick-status px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-opacity">
                            Call In
                          </button>
                        ` : ''}
                        ${isInProgress ? `
                          <button data-quick-action="Completed" data-apt-id="${apt.id}" class="btn-quick-status px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-opacity">
                            Finish
                          </button>
                        ` : ''}
                        <select data-apt-id="${apt.id}" class="select-change-status text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-medium cursor-pointer outline-none shadow-xs">
                          <option value="Waiting" ${apt.status === 'Waiting' ? 'selected' : ''}>Waiting</option>
                          <option value="In Progress" ${apt.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                          <option value="Completed" ${apt.status === 'Completed' ? 'selected' : ''}>Completed</option>
                          <option value="Upcoming" ${apt.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
                          <option value="Cancelled" ${apt.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bottom Balanced Section: Booking Requests (Left) + Shift Progress & Shortcuts (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Incoming Booking Requests Card -->
        <div class="uiverse-card p-5 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ${getIcon('bell', 'w-4 h-4 text-amber-500')}
                <span>Incoming Booking Requests</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ${pendingRequests.length} pending review from online portal
              </p>
            </div>
            <button id="link-view-all-requests" class="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
              View All
            </button>
          </div>

          <div class="space-y-3">
            ${pendingRequests.length === 0 ? `
              <div class="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                ${getIcon('checkCircle', 'w-8 h-8 text-emerald-500 mx-auto mb-2')}
                <span class="font-bold text-slate-800 dark:text-slate-200 block">No pending requests</span>
                All patient booking requests have been answered.
              </div>
            ` : pendingRequests.slice(0, 3).map((req) => `
              <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2.5">
                <div class="flex items-start justify-between">
                  <div>
                    <h4 class="font-bold text-xs text-slate-900 dark:text-white">${req.patientName} (${req.age}y)</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">${req.reason}</p>
                  </div>
                  <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 whitespace-nowrap">
                    ${req.time}
                  </span>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button data-decline-req="${req.id}" class="btn-decline-req px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-200 dark:border-rose-900">
                    Decline
                  </button>
                  <button data-accept-req="${req.id}" class="btn-accept-req px-3 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors shadow-xs">
                    Accept Booking
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Shift Progression & Clinical Quick Shortcuts -->
        <div class="space-y-6">
          <!-- Daily Shift Progress Card -->
          <div class="uiverse-card p-5 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Shift Schedule Progression</span>
              <span class="text-xs font-bold text-sky-600 dark:text-sky-400">${completedCount}/${appointments.length} Consultations</span>
            </div>
            
            <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div class="h-full bg-sky-600 rounded-full transition-all duration-500" style="width: ${shiftProgressPercent}%;"></div>
            </div>

            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5 font-medium">
              <span>Clinic Hours: 09:00 AM – 05:00 PM</span>
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">${shiftProgressPercent}% Done</span>
            </div>
          </div>

          <!-- Practice Navigation Shortcuts -->
          <div class="uiverse-card p-5 space-y-3">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Practice Shortcuts</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button id="quick-link-schedule" class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-left flex flex-col items-center justify-center gap-1.5 transition-colors bg-white dark:bg-slate-900">
                ${getIcon('calendarClock', 'w-4 h-4 text-sky-600 dark:text-sky-400')}
                <span class="font-semibold text-slate-800 dark:text-slate-200">Schedule</span>
              </button>
              <button id="quick-link-prescriptions" class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-left flex flex-col items-center justify-center gap-1.5 transition-colors bg-white dark:bg-slate-900">
                ${getIcon('fileText', 'w-4 h-4 text-sky-600 dark:text-sky-400')}
                <span class="font-semibold text-slate-800 dark:text-slate-200">Prescriptions</span>
              </button>
              <button id="quick-link-patients" class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-left flex flex-col items-center justify-center gap-1.5 transition-colors bg-white dark:bg-slate-900">
                ${getIcon('users', 'w-4 h-4 text-sky-600 dark:text-sky-400')}
                <span class="font-semibold text-slate-800 dark:text-slate-200">Patients</span>
              </button>
              <button id="quick-link-invoices" class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-left flex flex-col items-center justify-center gap-1.5 transition-colors bg-white dark:bg-slate-900">
                ${getIcon('creditCard', 'w-4 h-4 text-sky-600 dark:text-sky-400')}
                <span class="font-semibold text-slate-800 dark:text-slate-200">Billing</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  setTimeout(() => {
    animateCardsIn('.uiverse-card');

    document.getElementById('btn-quick-new-apt')?.addEventListener('click', onOpenNewAppointmentModal);
    document.getElementById('btn-quick-consult')?.addEventListener('click', () => onNavigateTab('online-consultations'));
    document.getElementById('link-view-all-appointments')?.addEventListener('click', () => onNavigateTab('appointments'));
    document.getElementById('link-view-all-requests')?.addEventListener('click', () => onNavigateTab('requests'));
    document.getElementById('quick-link-schedule')?.addEventListener('click', () => onNavigateTab('schedule'));
    document.getElementById('quick-link-prescriptions')?.addEventListener('click', () => onNavigateTab('prescriptions'));
    document.getElementById('quick-link-patients')?.addEventListener('click', () => onNavigateTab('patients'));
    document.getElementById('quick-link-invoices')?.addEventListener('click', () => onNavigateTab('invoices'));

    // Dashboard Queue Filter tabs
    document.querySelectorAll('[data-dashboard-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        dashboardQueueFilter = btn.getAttribute('data-dashboard-filter');
        const container = document.getElementById('main-view-outlet');
        if (container) {
          container.innerHTML = renderDashboardView({
            appointments,
            patients,
            invoices,
            requests,
            onNavigateTab,
            onUpdateAppointmentStatus,
            onAcceptRequest,
            onDeclineRequest,
            onOpenNewAppointmentModal,
          });
        }
      });
    });

    // Status change listener from select
    document.querySelectorAll('.select-change-status').forEach((select) => {
      select.addEventListener('change', (e) => {
        const aptId = e.target.getAttribute('data-apt-id');
        const newStatus = e.target.value;
        onUpdateAppointmentStatus(aptId, newStatus);
      });
    });

    // 1-click Quick Status Action buttons ("Call In", "Finish")
    document.querySelectorAll('.btn-quick-status').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aptId = btn.getAttribute('data-apt-id');
        const nextStatus = btn.getAttribute('data-quick-action');
        onUpdateAppointmentStatus(aptId, nextStatus);
      });
    });

    // Accept / Decline requests
    document.querySelectorAll('.btn-accept-req').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-accept-req');
        const req = requests.find((r) => r.id === id);
        if (req) onAcceptRequest(req);
      });
    });

    document.querySelectorAll('.btn-decline-req').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-decline-req');
        onDeclineRequest(id);
      });
    });
  }, 10);

  return html;
}
