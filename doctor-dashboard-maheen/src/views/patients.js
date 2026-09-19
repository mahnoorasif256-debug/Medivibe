import { getIcon } from '../icons.js';
import { animateCardsIn } from '../components/uiverse.js';

export function renderPatientsView({
  patients,
  onOpenNewPatientModal,
  onViewPatientModal,
  searchQuery = '',
}) {
  const filtered = patients.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const html = `
    <div id="view-patients" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Patients Medical Directory
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Electronic Health Records (EHR), allergy alerts, blood profiles, and clinical histories.
          </p>
        </div>

        <button id="btn-open-patient-modal" class="uiverse-btn uiverse-btn-primary shadow-sm">
          ${getIcon('plus', 'w-4 h-4')}
          <span>Register New Patient</span>
        </button>
      </div>

      <!-- Quick Directory Summary -->
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
          Showing ${filtered.length} of ${patients.length} Registered Patients
        </span>
      </div>

      <!-- Patients Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${filtered.map((patient) => `
          <div class="uiverse-card p-5 space-y-4 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800">
            <div class="space-y-3.5">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    ${patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-slate-900 dark:text-white">${patient.name}</h3>
                    <span class="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold">${patient.patientCode} • ${patient.age}y, ${patient.gender}</span>
                  </div>
                </div>

                <span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${patient.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'}">
                  ${patient.status === 'Active' ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>' : ''}
                  <span>${patient.status}</span>
                </span>
              </div>

              <div class="space-y-2 text-xs bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div class="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span class="font-bold">Primary Condition:</span>
                  <span class="font-extrabold text-slate-900 dark:text-white">${patient.condition}</span>
                </div>
                <div class="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span class="font-bold">Blood Profile:</span>
                  <span class="font-mono font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">${patient.bloodGroup}</span>
                </div>
                <div class="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span class="font-bold">Allergies:</span>
                  <span class="font-bold text-amber-700 dark:text-amber-400">${patient.allergies || 'No known drug allergies'}</span>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-400 text-xs font-semibold">Last visit: ${patient.lastVisit}</span>
              <button data-view-patient="${patient.id}" class="btn-view-patient text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
                <span>Clinical File</span>
                ${getIcon('arrowRight', 'w-3.5 h-3.5')}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  setTimeout(() => {
    animateCardsIn('.uiverse-card');

    document.getElementById('btn-open-patient-modal')?.addEventListener('click', onOpenNewPatientModal);

    document.querySelectorAll('.btn-view-patient').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-view-patient');
        const patient = patients.find((p) => p.id === id);
        if (patient) onViewPatientModal(patient);
      });
    });
  }, 10);

  return html;
}
