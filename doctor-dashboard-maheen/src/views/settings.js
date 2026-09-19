import { getIcon } from '../icons.js';
import { showToast, animateCardsIn } from '../components/uiverse.js';

let activeSettingsTab = 'profile';

export function renderSettingsView({
  doctorProfile,
  notificationSettings,
  onUpdateProfile,
  onUpdateNotifications,
}) {
  const html = `
    <div id="view-settings" class="space-y-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings & Practice Configuration
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
          Manage physician credentials, practice hours, cybersecurity preferences, and clinical alerts.
        </p>
      </div>

      <!-- Settings Sub-Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button data-stab="profile" class="settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeSettingsTab === 'profile' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
          ${getIcon('user', 'w-3.5 h-3.5 inline mr-1.5')}
          Doctor Profile
        </button>
        <button data-stab="security" class="settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeSettingsTab === 'security' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
          ${getIcon('key', 'w-3.5 h-3.5 inline mr-1.5')}
          Password & Security
        </button>
        <button data-stab="notifications" class="settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeSettingsTab === 'notifications' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
          ${getIcon('bell', 'w-3.5 h-3.5 inline mr-1.5')}
          Notifications & Alerts
        </button>
      </div>

      <!-- Tab Content 1: Doctor Profile -->
      <div id="stab-content-profile" class="${activeSettingsTab === 'profile' ? 'block' : 'hidden'} space-y-4">
        <div class="uiverse-card p-6 border border-slate-200 dark:border-slate-800">
          <form id="form-doctor-profile" class="space-y-5">
            <div class="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <img
                src="${doctorProfile.avatarUrl}"
                alt="${doctorProfile.fullName}"
                class="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500 shadow-md"
              />
              <div>
                <h3 class="font-bold text-base text-slate-900 dark:text-white">${doctorProfile.fullName}</h3>
                <span class="text-xs text-sky-600 dark:text-sky-400 font-bold">${doctorProfile.specialty} • ${doctorProfile.medicalLicense}</span>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Licensed Physician • ${doctorProfile.experience}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Legal Name</label>
                <input
                  id="prof-name"
                  type="text"
                  value="${doctorProfile.fullName}"
                  required
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <div>
                <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Medical Specialty</label>
                <input
                  id="prof-specialty"
                  type="text"
                  value="${doctorProfile.specialty}"
                  required
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <div>
                <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">License & Registration #</label>
                <input
                  id="prof-license"
                  type="text"
                  value="${doctorProfile.medicalLicense}"
                  required
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <div>
                <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Clinic Name</label>
                <input
                  id="prof-clinic"
                  type="text"
                  value="${doctorProfile.clinicName}"
                  required
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <div>
                <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Clinic Phone Contact</label>
                <input
                  id="prof-phone"
                  type="text"
                  value="${doctorProfile.phone}"
                  required
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <div>
                <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Working Hours</label>
                <input
                  id="prof-hours"
                  type="text"
                  value="${doctorProfile.workingHours}"
                  required
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Clinic Address & Chamber Location</label>
                <input
                  id="prof-address"
                  type="text"
                  value="${doctorProfile.clinicAddress}"
                  required
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:border-sky-500 shadow-xs"
                />
              </div>
            </div>

            <div class="flex justify-end pt-3">
              <button type="submit" class="uiverse-btn uiverse-btn-primary shadow-sm">
                ${getIcon('save', 'w-4 h-4')}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tab Content 2: Password & Security -->
      <div id="stab-content-security" class="${activeSettingsTab === 'security' ? 'block' : 'hidden'} space-y-4">
        <div class="uiverse-card p-6 space-y-5 border border-slate-200 dark:border-slate-800">
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Security & Login Credentials</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 font-medium">Ensure high-entropy password compliance for electronic medical records (EMR).</p>
          </div>

          <form id="form-security-password" class="space-y-4 text-xs max-w-md">
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Current Password</label>
              <input
                id="sec-cur-pw"
                type="password"
                placeholder="••••••••••••"
                required
                class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-sky-500 shadow-xs font-semibold"
              />
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">New Password</label>
              <input
                id="sec-new-pw"
                type="password"
                placeholder="At least 8 characters with numbers & symbols"
                required
                class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-sky-500 shadow-xs font-semibold"
              />
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Confirm New Password</label>
              <input
                id="sec-conf-pw"
                type="password"
                placeholder="Confirm matching password"
                required
                class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-sky-500 shadow-xs font-semibold"
              />
            </div>

            <button type="submit" class="uiverse-btn uiverse-btn-primary shadow-sm">
              ${getIcon('key', 'w-4 h-4')}
              <span>Update Password</span>
            </button>
          </form>

          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 font-medium">Require an authenticator app code on login to protect patient data.</p>
            </div>
            <label class="uiverse-switch">
              <input type="checkbox" id="toggle-2fa" checked>
              <span class="uiverse-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Tab Content 3: Notification Preferences -->
      <div id="stab-content-notifications" class="${activeSettingsTab === 'notifications' ? 'block' : 'hidden'} space-y-4">
        <div class="uiverse-card p-6 space-y-5 border border-slate-200 dark:border-slate-800">
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Clinical Notifications & Alerts</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 font-medium">Configure how and when you receive alerts regarding appointments and emergencies.</p>
          </div>

          <div class="divide-y divide-slate-200 dark:divide-slate-800 space-y-3">
            <div class="flex items-center justify-between pt-3">
              <div>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white">Appointment Reminders</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 font-medium">Alert 15 minutes before scheduled clinic visits and telehealth sessions.</p>
              </div>
              <label class="uiverse-switch">
                <input type="checkbox" id="notif-reminders" ${notificationSettings.appointmentReminders ? 'checked' : ''}>
                <span class="uiverse-slider"></span>
              </label>
            </div>

            <div class="flex items-center justify-between pt-3">
              <div>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white">New Booking Requests</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 font-medium">Instant notification when a patient requests a new appointment slot.</p>
              </div>
              <label class="uiverse-switch">
                <input type="checkbox" id="notif-bookings" ${notificationSettings.newBookingRequests ? 'checked' : ''}>
                <span class="uiverse-slider"></span>
              </label>
            </div>

            <div class="flex items-center justify-between pt-3">
              <div>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white">Urgent Case & Vitals Alerts</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 font-medium">High priority flash notification for abnormal telemetry or chest pain referrals.</p>
              </div>
              <label class="uiverse-switch">
                <input type="checkbox" id="notif-urgent" ${notificationSettings.urgentCaseAlerts ? 'checked' : ''}>
                <span class="uiverse-slider"></span>
              </label>
            </div>

            <div class="flex items-center justify-between pt-3">
              <div>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white">Email Digest & Summaries</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 font-medium">Daily clinic summary emailed every evening at 18:00.</p>
              </div>
              <label class="uiverse-switch">
                <input type="checkbox" id="notif-email" ${notificationSettings.emailAlerts ? 'checked' : ''}>
                <span class="uiverse-slider"></span>
              </label>
            </div>

            <div class="flex items-center justify-between pt-3">
              <div>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white">SMS Urgent Broadcast</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 font-medium">Send SMS to registered phone for emergency schedule cancellations.</p>
              </div>
              <label class="uiverse-switch">
                <input type="checkbox" id="notif-sms" ${notificationSettings.smsUrgentCases ? 'checked' : ''}>
                <span class="uiverse-slider"></span>
              </label>
            </div>
          </div>

          <div class="flex justify-end pt-3">
            <button id="btn-save-notifs" class="uiverse-btn uiverse-btn-primary shadow-sm">
              ${getIcon('save', 'w-4 h-4')}
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    animateCardsIn('.uiverse-card');

    // Sub tabs
    document.querySelectorAll('.settings-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeSettingsTab = btn.getAttribute('data-stab');
        const container = document.getElementById('main-view-outlet');
        if (container) {
          container.innerHTML = renderSettingsView({
            doctorProfile,
            notificationSettings,
            onUpdateProfile,
            onUpdateNotifications,
          });
        }
      });
    });

    // Profile form
    document.getElementById('form-doctor-profile')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        ...doctorProfile,
        fullName: document.getElementById('prof-name').value,
        specialty: document.getElementById('prof-specialty').value,
        medicalLicense: document.getElementById('prof-license').value,
        clinicName: document.getElementById('prof-clinic').value,
        phone: document.getElementById('prof-phone').value,
        workingHours: document.getElementById('prof-hours').value,
        clinicAddress: document.getElementById('prof-address').value,
      };
      onUpdateProfile(updated);
      showToast('Doctor Profile updated successfully!', 'success');
    });

    // Password form
    document.getElementById('form-security-password')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPw = document.getElementById('sec-new-pw').value;
      const confPw = document.getElementById('sec-conf-pw').value;
      if (newPw !== confPw) {
        showToast('Passwords do not match. Please re-enter.', 'warning');
        return;
      }
      showToast('Password credentials updated successfully!', 'success');
      e.target.reset();
    });

    // 2FA toggle
    document.getElementById('toggle-2fa')?.addEventListener('change', (e) => {
      showToast(e.target.checked ? '2FA enabled' : '2FA disabled', 'info');
    });

    // Notification save
    document.getElementById('btn-save-notifs')?.addEventListener('click', () => {
      const updated = {
        ...notificationSettings,
        appointmentReminders: document.getElementById('notif-reminders').checked,
        newBookingRequests: document.getElementById('notif-bookings').checked,
        urgentCaseAlerts: document.getElementById('notif-urgent').checked,
        emailAlerts: document.getElementById('notif-email').checked,
        smsUrgentCases: document.getElementById('notif-sms').checked,
      };
      onUpdateNotifications(updated);
      showToast('Notification preferences saved!', 'success');
    });
  }, 10);

  return html;
}
