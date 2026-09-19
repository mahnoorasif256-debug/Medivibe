import { getIcon } from '../icons.js';
import { animateCardsIn } from '../components/uiverse.js';

export function renderAppointmentRequestsView({ requests, onAcceptRequest, onDeclineRequest }) {
  const pending = requests.filter((r) => r.status === 'pending');
  const past = requests.filter((r) => r.status !== 'pending');

  const html = `
    <div id="view-requests" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Online Appointment Requests
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Review, accept, or reschedule incoming consultation requests submitted by patients.
          </p>
        </div>

        <span class="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          ${pending.length} Pending Actions
        </span>
      </div>

      <!-- Pending Requests Grid -->
      <div class="space-y-4">
        <h2 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Awaiting Physician Approval</h2>

        ${pending.length === 0 ? `
          <div class="uiverse-card p-12 text-center text-slate-500 text-xs border border-slate-200 dark:border-slate-800">
            ${getIcon('checkCircle', 'w-10 h-10 text-emerald-500 mx-auto mb-3')}
            <span class="font-bold text-sm text-slate-800 dark:text-slate-200 block mb-1">Queue is clear!</span>
            No pending booking requests require your attention right now.
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${pending.map((req) => `
              <div class="uiverse-card p-5 space-y-4 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
                <div class="space-y-3">
                  <div class="flex items-start justify-between">
                    <div>
                      <span class="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 block">${req.requestCode}</span>
                      <h3 class="text-base font-bold text-slate-900 dark:text-white mt-0.5">${req.patientName}</h3>
                      <span class="text-xs text-slate-600 dark:text-slate-400 font-bold">${req.age} years old</span>
                    </div>
                    <span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${req.type === 'Online' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'}">
                      ${req.type === 'Online' ? getIcon('video', 'w-3.5 h-3.5 text-sky-600 dark:text-sky-400') : getIcon('stethoscope', 'w-3.5 h-3.5 text-sky-600 dark:text-sky-400')}
                      <span>${req.type}</span>
                    </span>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                    <span class="text-slate-700 dark:text-slate-300 block text-[10px] font-bold uppercase tracking-wider">Reason for consult</span>
                    <p class="text-slate-900 dark:text-slate-100 font-semibold mt-0.5">${req.reason}</p>
                  </div>

                  <div class="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    <span class="flex items-center gap-1.5 font-mono">
                      ${getIcon('calendar', 'w-3.5 h-3.5 text-sky-600 dark:text-sky-400')}
                      <span>${req.date}</span>
                    </span>
                    <span class="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                      ${getIcon('clock', 'w-3.5 h-3.5 text-sky-600 dark:text-sky-400')}
                      <span>${req.time}</span>
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button data-decline-req="${req.id}" class="btn-decline-req uiverse-btn uiverse-btn-outline text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold border-rose-300 dark:border-rose-900">
                    Decline
                  </button>
                  <button data-accept-req="${req.id}" class="btn-accept-req uiverse-btn uiverse-btn-primary text-xs font-bold">
                    Accept
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Past / Processed Requests -->
      ${past.length > 0 ? `
        <div class="space-y-4 pt-6">
          <h2 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recently Processed</h2>
          <div class="uiverse-card p-5 border border-slate-200 dark:border-slate-800">
            <div class="table-clean-scroll rounded-xl border border-slate-200 dark:border-slate-800">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                  <tr class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <th class="py-2.5 px-3 whitespace-nowrap">Code</th>
                    <th class="py-2.5 px-3 whitespace-nowrap">Patient Profile</th>
                    <th class="py-2.5 px-3 whitespace-nowrap">Requested Date & Time</th>
                    <th class="py-2.5 px-3 whitespace-nowrap">Type</th>
                    <th class="py-2.5 px-3 text-right whitespace-nowrap">Decision</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                  ${past.map((req) => `
                    <tr class="hover:bg-sky-50/40 dark:hover:bg-slate-800/60 transition-colors">
                      <td class="py-3 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">${req.requestCode}</td>
                      <td class="py-3 px-3 font-bold text-slate-900 dark:text-white">${req.patientName} (${req.age}y)</td>
                      <td class="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 font-semibold">${req.date} at ${req.time}</td>
                      <td class="py-3 px-3 text-slate-700 dark:text-slate-300 font-semibold">${req.type}</td>
                      <td class="py-3 px-3 text-right">
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'} capitalize">
                          ${req.status}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  setTimeout(() => {
    animateCardsIn('.uiverse-card');

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
