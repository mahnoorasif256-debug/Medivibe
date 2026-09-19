import { getIcon } from '../icons.js';
import { animateCardsIn } from '../components/uiverse.js';

export function renderScheduleView({
  weeklySlots,
  doctorProfile,
  onToggleSlot,
  onUpdateDoctorStatus,
}) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const totalSlots = weeklySlots.length;
  const bookedSlots = weeklySlots.filter((s) => s.status === 'Booked').length;
  const openSlots = weeklySlots.filter((s) => s.status === 'Open').length;
  const disabledSlots = weeklySlots.filter((s) => s.status === 'Disabled').length;

  const html = `
    <div id="view-schedule" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Weekly Schedule & Clinic Availability
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Configure physician office hours, open consultation slots, and live clinic presence.
          </p>
        </div>

        <!-- Doctor Live Presence Selector -->
        <div class="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2 rounded-2xl shadow-xs">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">Doctor Status:</span>
          <select id="select-doctor-presence" class="text-xs font-bold px-3 py-1.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 cursor-pointer outline-none">
            <option value="In Clinic" ${doctorProfile.availabilityStatus === 'In Clinic' ? 'selected' : ''}>🏥 In Clinic</option>
            <option value="Online" ${doctorProfile.availabilityStatus === 'Online' ? 'selected' : ''}>🌐 Online Available</option>
            <option value="On Break" ${doctorProfile.availabilityStatus === 'On Break' ? 'selected' : ''}>☕ On Break</option>
            <option value="Unavailable" ${doctorProfile.availabilityStatus === 'Unavailable' ? 'selected' : ''}>⛔ Unavailable</option>
          </select>
        </div>
      </div>

      <!-- Schedule Quick Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="uiverse-card p-4 text-center border border-slate-200 dark:border-slate-800">
          <span class="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Total Slots</span>
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${totalSlots}</h3>
        </div>
        <div class="uiverse-card p-4 text-center border border-slate-200 dark:border-slate-800">
          <span class="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">Open Slots</span>
          <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${openSlots}</h3>
        </div>
        <div class="uiverse-card p-4 text-center border border-slate-200 dark:border-slate-800">
          <span class="text-xs text-sky-700 dark:text-sky-400 font-bold uppercase tracking-wider">Booked</span>
          <h3 class="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">${bookedSlots}</h3>
        </div>
        <div class="uiverse-card p-4 text-center border border-slate-200 dark:border-slate-800">
          <span class="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Blocked</span>
          <h3 class="text-2xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">${disabledSlots}</h3>
        </div>
      </div>

      <!-- Weekly Matrix Card -->
      <div class="uiverse-card p-6 space-y-4 border border-slate-200 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Click any hour cell to toggle slot availability (Open ⇄ Booked ⇄ Blocked)</span>
          <div class="flex items-center gap-3 text-xs font-bold">
            <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-400"></span> Open</span>
            <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-sky-100 dark:bg-sky-950 border border-sky-400"></span> Booked</span>
            <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-400"></span> Blocked</span>
          </div>
        </div>

        <div class="table-clean-scroll rounded-xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-center border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="p-3 text-xs font-bold text-slate-700 dark:text-slate-300 text-left w-20">Time</th>
                ${days.map((day) => `
                  <th class="p-3 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">${day}</th>
                `).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-xs">
              ${hours.map((hour) => `
                <tr>
                  <td class="p-3 font-bold text-slate-900 dark:text-slate-200 text-left">${hour}</td>
                  ${days.map((day) => {
                    const slot = weeklySlots.find((s) => s.day === day && s.time === hour) || {
                      id: `${day}-${hour}`,
                      status: 'Open',
                    };

                    let bgClass = 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300';
                    if (slot.status === 'Booked') {
                      bgClass = 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-300';
                    } else if (slot.status === 'Disabled') {
                      bgClass = 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                    }

                    return `
                      <td class="p-1.5">
                        <button
                          data-slot-id="${slot.id}"
                          class="btn-toggle-slot w-full py-2 px-1 rounded-xl border text-xs font-sans font-bold transition-all hover:scale-105 active:scale-95 shadow-xs ${bgClass}"
                        >
                          ${slot.status === 'Booked' ? 'Booked' : slot.status === 'Disabled' ? 'Off' : 'Open'}
                        </button>
                      </td>
                    `;
                  }).join('')}
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

    document.getElementById('select-doctor-presence')?.addEventListener('change', (e) => {
      onUpdateDoctorStatus(e.target.value);
    });

    document.querySelectorAll('.btn-toggle-slot').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-slot-id');
        onToggleSlot(id);
      });
    });
  }, 10);

  return html;
}
