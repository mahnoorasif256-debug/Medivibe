import { getIcon } from '../icons.js';
import { showToast, animateCardsIn } from '../components/uiverse.js';

let micEnabled = true;
let videoEnabled = true;
let ecgAnimationId = null;

export function renderOnlineConsultationsView({ onIssuePrescription }) {
  const html = `
    <div id="view-consultations" class="space-y-6">
      <!-- Title & Live Session Status -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              MediVibe Telehealth Suite
            </h1>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span class="uiverse-dot-pulse" style="background-color: #059669;"></span>
              Encrypted WebRTC Active
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Virtual clinic room with continuous clinical telemetry, real-time audio/video, and electronic prescription integration.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <span class="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">
            Room: #MV-9921
          </span>
          <span class="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300">
            Latency: 14ms (Optimal)
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Video Screen & Live Telemetry (2 Cols) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="relative bg-slate-950 rounded-2xl overflow-hidden shadow-xl aspect-video flex items-center justify-center border border-slate-800">
            <!-- Simulated Patient Video Feed -->
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200"
              alt="Sofia Marchetti"
              class="w-full h-full object-cover"
            />

            <!-- Patient Overlay Badge -->
            <div class="absolute top-4 left-4 flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold border border-slate-700 shadow-lg">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sofia Marchetti (P-4819)</span>
              <span class="text-[11px] text-emerald-400 font-mono">● 1080p 60fps</span>
            </div>

            <!-- Doctor Picture-in-Picture Preview -->
            <div class="absolute top-4 right-4 w-36 sm:w-48 aspect-video rounded-xl overflow-hidden border-2 border-sky-500 shadow-2xl bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
                alt="Dr. Amara Okafor"
                class="w-full h-full object-cover"
              />
              <div class="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white font-bold">
                You (Dr. Amara)
              </div>
            </div>

            <!-- In-Call Floating Controls Bar -->
            <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-2xl">
              <button id="btn-toggle-mic" class="p-3 rounded-xl ${micEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'} transition-all active:scale-95 border border-slate-700" title="Toggle Microphone">
                ${getIcon(micEnabled ? 'mic' : 'micOff', 'w-5 h-5')}
              </button>
              <button id="btn-toggle-video" class="p-3 rounded-xl ${videoEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'} transition-all active:scale-95 border border-slate-700" title="Toggle Camera">
                ${getIcon(videoEnabled ? 'video' : 'videoOff', 'w-5 h-5')}
              </button>
              <button id="btn-share-screen" class="p-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-all active:scale-95 border border-slate-700" title="Share Screen / Lab Scan">
                ${getIcon('activity', 'w-5 h-5 text-sky-400')}
              </button>
              <button id="btn-end-call" class="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-rose-900/40" title="End Consultation">
                ${getIcon('phoneOff', 'w-4 h-4')}
                <span>End Call</span>
              </button>
            </div>
          </div>

          <!-- Real-Time Hospital Telemetry & Live ECG Canvas -->
          <div class="uiverse-card p-5 space-y-4 border border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ${getIcon('activity', 'w-4 h-4 text-rose-500')}
                <span>Continuous Cardiac Sinus & Telemetry</span>
              </h3>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Telemetry Stream Active
                </span>
              </div>
            </div>

            <!-- ECG Canvas Monitor Screen -->
            <div class="rounded-xl overflow-hidden border border-slate-800 bg-[#070d18] relative shadow-inner">
              <canvas id="ecg-monitor-canvas" width="680" height="110" class="w-full h-24 block"></canvas>
              <div class="absolute top-2 left-3 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider opacity-90">
                Lead II • 25mm/s • 10mm/mV
              </div>
              <div class="absolute bottom-2 right-3 text-[10px] font-mono text-emerald-400 font-bold">
                QRS: 88ms • PR: 154ms • QTc: 412ms
              </div>
            </div>

            <!-- Vitals Metrics Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3.5 rounded-2xl bg-white dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span class="text-xs text-slate-700 dark:text-slate-300 font-bold block">Blood Pressure</span>
                <span class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">120 / 80</span>
                <span class="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">● Optimal mmHg</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-white dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span class="text-xs text-slate-700 dark:text-slate-300 font-bold block">Heart Rate</span>
                <span id="vitals-bpm" class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">74 bpm</span>
                <span class="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">● Regular Sinus</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-white dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span class="text-xs text-slate-700 dark:text-slate-300 font-bold block">SpO₂ Blood Oxygen</span>
                <span class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">99%</span>
                <span class="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">● Stable Saturation</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-white dark:bg-[#111a2e] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span class="text-xs text-slate-700 dark:text-slate-300 font-bold block">Body Temp & Resp</span>
                <span class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">36.7 °C</span>
                <span class="text-xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">● 16 Resp / min</span>
              </div>
            </div>
          </div>
        </div>

        <!-- In-Session Prescription & Clinical Notepad (1 Col) -->
        <div class="space-y-4">
          <!-- Quick Prescription E-Form -->
          <div class="uiverse-card p-5 space-y-3.5 border border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ${getIcon('fileText', 'w-4 h-4 text-sky-600 dark:text-sky-400')}
                <span>Issue Prescription</span>
              </h3>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-800">RX-LIVE</span>
            </div>

            <form id="form-consult-rx" class="space-y-3 text-xs">
              <div>
                <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Medication & Strength</label>
                <input
                  id="rx-meds"
                  type="text"
                  placeholder="e.g. Amlodipine 5mg, Paracetamol 500mg"
                  required
                  class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:border-sky-500 shadow-xs"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Dosage Pattern</label>
                  <input
                    id="rx-dosage"
                    type="text"
                    placeholder="1-0-1 (Morning-Night)"
                    required
                    class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none focus:border-sky-500 shadow-xs"
                  />
                </div>
                <div>
                  <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Duration (Days)</label>
                  <input
                    id="rx-days"
                    type="number"
                    value="7"
                    min="1"
                    required
                    class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-sky-500 shadow-xs"
                  />
                </div>
              </div>

              <button type="submit" class="w-full uiverse-btn uiverse-btn-primary mt-2">
                ${getIcon('check', 'w-4 h-4')}
                <span>Sign & Issue E-Prescription</span>
              </button>
            </form>
          </div>

          <!-- Doctor Observation Notes -->
          <div class="uiverse-card p-5 space-y-3 border border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ${getIcon('shieldCheck', 'w-4 h-4 text-sky-600 dark:text-sky-400')}
                <span>Consultation Notes</span>
              </h3>
              <span id="notes-save-status" class="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                ${getIcon('checkCircle', 'w-3.5 h-3.5')}
                Saved to EHR
              </span>
            </div>

            <!-- Quick Diagnosis Badges -->
            <div class="flex flex-wrap gap-1.5">
              <button type="button" class="btn-tag-diagnosis text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors">
                + Hypertension
              </button>
              <button type="button" class="btn-tag-diagnosis text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors">
                + Routine Check
              </button>
              <button type="button" class="btn-tag-diagnosis text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors">
                + Occipital Headache
              </button>
            </div>

            <textarea
              id="consult-notes"
              rows="5"
              placeholder="Record clinical observations, differential diagnosis, and recommended lifestyle adjustments..."
              class="w-full px-3 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none outline-none focus:border-sky-500 shadow-xs font-medium"
            >Patient reports mild occipital throbbing in mornings. Vitals stable. Advised 2L daily hydration and daily BP log.</textarea>
            
            <button id="btn-save-notes" class="w-full uiverse-btn uiverse-btn-outline text-xs font-bold">
              ${getIcon('save', 'w-4 h-4')}
              <span>Save Clinical Notes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Start animated ECG monitor on canvas
  function startEcgWave() {
    const canvas = document.getElementById('ecg-monitor-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;
    let x = 0;
    let prevY = midY;

    // Background grid
    ctx.fillStyle = '#070d18';
    ctx.fillRect(0, 0, width, height);

    function step() {
      // Semi-transparent sweep bar
      ctx.fillStyle = 'rgba(7, 13, 24, 0.15)';
      ctx.fillRect(x, 0, 18, height);

      // Cardiac rhythm formula
      const phase = x % 160;
      let y = midY;

      if (phase > 20 && phase < 35) {
        // P wave
        y = midY - Math.sin(((phase - 20) / 15) * Math.PI) * 9;
      } else if (phase >= 44 && phase < 48) {
        // Q dip
        y = midY + 8;
      } else if (phase >= 48 && phase < 56) {
        // R spike
        y = midY - 38;
      } else if (phase >= 56 && phase < 64) {
        // S dip
        y = midY + 14;
      } else if (phase >= 88 && phase < 118) {
        // T wave
        y = midY - Math.sin(((phase - 88) / 30) * Math.PI) * 12;
      }

      ctx.beginPath();
      ctx.moveTo(x === 0 ? 0 : x - 2, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#38bdf8';
      ctx.stroke();

      prevY = y;
      x = (x + 2) % width;
      ecgAnimationId = requestAnimationFrame(step);
    }

    if (ecgAnimationId) cancelAnimationFrame(ecgAnimationId);
    ecgAnimationId = requestAnimationFrame(step);
  }

  setTimeout(() => {
    animateCardsIn('.uiverse-card');
    startEcgWave();

    // Mic Toggle
    document.getElementById('btn-toggle-mic')?.addEventListener('click', () => {
      micEnabled = !micEnabled;
      showToast(micEnabled ? 'Microphone unmuted' : 'Microphone muted', 'info');
      const btn = document.getElementById('btn-toggle-mic');
      if (btn) {
        btn.className = `p-3 rounded-xl ${micEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'} transition-all active:scale-95 border border-slate-700`;
        btn.innerHTML = getIcon(micEnabled ? 'mic' : 'micOff', 'w-5 h-5');
      }
    });

    // Camera Toggle
    document.getElementById('btn-toggle-video')?.addEventListener('click', () => {
      videoEnabled = !videoEnabled;
      showToast(videoEnabled ? 'Camera activated' : 'Camera paused', 'info');
      const btn = document.getElementById('btn-toggle-video');
      if (btn) {
        btn.className = `p-3 rounded-xl ${videoEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'} transition-all active:scale-95 border border-slate-700`;
        btn.innerHTML = getIcon(videoEnabled ? 'video' : 'videoOff', 'w-5 h-5');
      }
    });

    // Screen Share Toggle
    document.getElementById('btn-share-screen')?.addEventListener('click', () => {
      showToast('Screen sharing dialog opened for patient review', 'info');
    });

    // End Call
    document.getElementById('btn-end-call')?.addEventListener('click', () => {
      showToast('Consultation ended safely. Session telemetry and notes archived.', 'success');
    });

    // Form Issue Prescription
    document.getElementById('form-consult-rx')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const meds = document.getElementById('rx-meds')?.value;
      const dosage = document.getElementById('rx-dosage')?.value;
      const days = parseInt(document.getElementById('rx-days')?.value || '7', 10);

      onIssuePrescription({
        rxNumber: `RX-${Math.floor(2050 + Math.random() * 50)}`,
        patientName: 'Sofia Marchetti',
        medicines: meds,
        date: '2024-04-14',
        status: 'Issued',
        dosage,
        days,
      });

      showToast(`Prescription "${meds}" issued to Sofia Marchetti!`, 'success');
      e.target.reset();
    });

    // Diagnosis Quick Tags
    document.querySelectorAll('.btn-tag-diagnosis').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tag = btn.innerText.replace('+ ', '');
        const notes = document.getElementById('consult-notes');
        if (notes) {
          notes.value += `\n- Diagnosis added: ${tag}.`;
          showToast(`Added "${tag}" to clinical notes`, 'info');
        }
      });
    });

    // Save Clinical Notes
    document.getElementById('btn-save-notes')?.addEventListener('click', () => {
      const status = document.getElementById('notes-save-status');
      if (status) {
        status.innerHTML = `${getIcon('checkCircle', 'w-3.5 h-3.5')} Saved to EHR`;
      }
      showToast('Clinical notes updated and saved to EHR record.', 'success');
    });
  }, 10);

  return html;
}
