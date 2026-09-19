import { getIcon } from '../icons.js';
import { renderUiverseStatusBadge, renderUiverseMetricCard, animateCardsIn } from '../components/uiverse.js';

export function renderInvoicesView({
  invoices,
  patients,
  onOpenNewInvoiceModal,
  onViewInvoiceModal,
  onUpdateInvoiceStatus,
}) {
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalCollected = invoices.reduce((acc, inv) => (inv.status === 'Paid' ? acc + inv.amount : acc), 0);
  const totalPending = totalBilled - totalCollected;

  const html = `
    <div id="view-invoices" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Billing & Patient Invoices
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Manage consultation charges, clinical diagnostic fees, and official settlement receipts.
          </p>
        </div>

        <button id="btn-open-invoice-modal" class="uiverse-btn uiverse-btn-primary shadow-sm">
          ${getIcon('plus', 'w-4 h-4')}
          <span>Create New Invoice</span>
        </button>
      </div>

      <!-- Financial Metrics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${renderUiverseMetricCard({
          id: 'card-fin-billed',
          title: 'Total Invoiced',
          value: `$${totalBilled.toFixed(2)}`,
          subtitle: 'All billings this cycle',
          iconName: 'creditCard',
          badgeText: 'Gross',
          theme: 'blue',
        })}
        ${renderUiverseMetricCard({
          id: 'card-fin-collected',
          title: 'Collected Revenue',
          value: `$${totalCollected.toFixed(2)}`,
          subtitle: 'Cleared clinic receipts',
          iconName: 'checkCircle',
          badgeText: `${Math.round((totalCollected / (totalBilled || 1)) * 100)}%`,
          theme: 'emerald',
        })}
        ${renderUiverseMetricCard({
          id: 'card-fin-pending',
          title: 'Outstanding Dues',
          value: `$${totalPending.toFixed(2)}`,
          subtitle: 'Pending patient settlement',
          iconName: 'clock',
          badgeText: 'Pending',
          theme: 'amber',
        })}
      </div>

      <!-- Invoices Table Card -->
      <div class="uiverse-card p-6 space-y-4 border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
            Billing Records (${invoices.length})
          </span>
          <span class="text-xs text-sky-600 dark:text-sky-400 font-mono font-bold">Currency: USD ($)</span>
        </div>

        <div class="table-clean-scroll rounded-xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th class="py-3 px-3 whitespace-nowrap">Invoice #</th>
                <th class="py-3 px-3 whitespace-nowrap">Patient Profile</th>
                <th class="py-3 px-3 whitespace-nowrap">Date</th>
                <th class="py-3 px-3 whitespace-nowrap">Consult Fee</th>
                <th class="py-3 px-3 whitespace-nowrap">Diagnostic Labs</th>
                <th class="py-3 px-3 whitespace-nowrap">Total Amount</th>
                <th class="py-3 px-3 whitespace-nowrap">Status</th>
                <th class="py-3 px-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              ${invoices.map((inv) => `
                <tr class="hover:bg-sky-50/40 dark:hover:bg-slate-800/60 transition-colors">
                  <td class="py-3.5 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">${inv.invoiceNumber}</td>
                  <td class="py-3.5 px-3 text-slate-900 dark:text-white font-bold">${inv.patientName}</td>
                  <td class="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-mono text-xs">${inv.date}</td>
                  <td class="py-3.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">$${inv.consultationFee.toFixed(2)}</td>
                  <td class="py-3.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">$${inv.clinicalServices.toFixed(2)}</td>
                  <td class="py-3.5 px-3 font-mono font-extrabold text-slate-900 dark:text-white">$${inv.amount.toFixed(2)}</td>
                  <td class="py-3.5 px-3">
                    ${renderUiverseStatusBadge(inv.status)}
                  </td>
                  <td class="py-3.5 px-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button data-view-inv="${inv.id}" class="btn-view-inv p-2 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors border border-slate-200 dark:border-slate-700" title="Print Official Receipt">
                        ${getIcon('printer', 'w-4 h-4')}
                      </button>
                      <select data-inv-id="${inv.id}" class="select-change-status-inv text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-semibold cursor-pointer outline-none shadow-xs">
                        <option value="Paid" ${inv.status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Unpaid" ${inv.status === 'Unpaid' ? 'selected' : ''}>Unpaid</option>
                        <option value="Partial" ${inv.status === 'Partial' ? 'selected' : ''}>Partial</option>
                      </select>
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

    document.getElementById('btn-open-invoice-modal')?.addEventListener('click', onOpenNewInvoiceModal);

    document.querySelectorAll('.btn-view-inv').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-view-inv');
        const inv = invoices.find((item) => item.id === id);
        if (inv) onViewInvoiceModal(inv);
      });
    });

    document.querySelectorAll('.select-change-status-inv').forEach((select) => {
      select.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-inv-id');
        onUpdateInvoiceStatus(id, e.target.value);
      });
    });
  }, 10);

  return html;
}
