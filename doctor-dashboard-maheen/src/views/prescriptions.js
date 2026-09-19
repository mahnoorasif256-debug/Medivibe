import { getIcon } from '../icons.js';
import { renderUiverseStatusBadge, animateCardsIn } from '../components/uiverse.js';

export function renderPrescriptionsView({
  prescriptions,
  patients,
  onOpenNewPrescriptionModal,
  onViewPrescriptionModal,
  onUpdateStatus,
}) {
  const html = `
    <div id="view-prescriptions" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Digital Prescriptions (RX)
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Generate, sign, and print digital medication orders, dosage regimens, and pharmacy orders.
          </p>
        </div>

        <button id="btn-open-rx-modal" class="uiverse-btn uiverse-btn-primary shadow-sm">
          ${getIcon('plus', 'w-4 h-4')}
          <span>New Prescription</span>
        </button>
      </div>

      <!-- Prescriptions Table Card -->
      <div class="uiverse-card p-6 space-y-4 border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
            Total ${prescriptions.length} Prescriptions Logged in System
          </span>
          <span class="text-xs text-sky-600 dark:text-sky-400 font-mono font-bold">Pharmacopoeia Verified</span>
        </div>

        <div class="table-clean-scroll rounded-xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th class="py-3 px-3 whitespace-nowrap">RX Number</th>
                <th class="py-3 px-3 whitespace-nowrap">Patient</th>
                <th class="py-3 px-3">Medications & Regimen</th>
                <th class="py-3 px-3 whitespace-nowrap">Dosage / Days</th>
                <th class="py-3 px-3 whitespace-nowrap">Date</th>
                <th class="py-3 px-3 whitespace-nowrap">Status</th>
                <th class="py-3 px-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              ${prescriptions.map((rx) => `
                <tr class="hover:bg-sky-50/40 dark:hover:bg-slate-800/60 transition-colors">
                  <td class="py-3.5 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">${rx.rxNumber}</td>
                  <td class="py-3.5 px-3 text-slate-900 dark:text-white font-bold">${rx.patientName}</td>
                  <td class="py-3.5 px-3 text-slate-800 dark:text-slate-200 font-semibold max-w-xs truncate">${rx.medicines}</td>
                  <td class="py-3.5 px-3 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">${rx.dosage} • ${rx.days} days</td>
                  <td class="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">${rx.date}</td>
                  <td class="py-3.5 px-3">
                    ${renderUiverseStatusBadge(rx.status)}
                  </td>
                  <td class="py-3.5 px-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button data-view-rx="${rx.id}" class="btn-view-rx p-2 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors border border-slate-200 dark:border-slate-700" title="View & Print Official RX">
                        ${getIcon('printer', 'w-4 h-4')}
                      </button>
                      <button data-toggle-status-rx="${rx.id}" class="btn-toggle-status-rx text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors border border-slate-300 dark:border-slate-700">
                        ${rx.status === 'Issued' ? 'Mark Dispensed' : 'Mark Issued'}
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

    document.getElementById('btn-open-rx-modal')?.addEventListener('click', onOpenNewPrescriptionModal);

    document.querySelectorAll('.btn-view-rx').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-view-rx');
        const rx = prescriptions.find((r) => r.id === id);
        if (rx) onViewPrescriptionModal(rx);
      });
    });

    document.querySelectorAll('.btn-toggle-status-rx').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toggle-status-rx');
        const rx = prescriptions.find((r) => r.id === id);
        if (rx) {
          const nextStatus = rx.status === 'Issued' ? 'Dispensed' : 'Issued';
          onUpdateStatus(id, nextStatus);
        }
      });
    });
  }, 10);

  return html;
}
