import gsap from 'gsap';
import { getIcon } from '../icons.js';

export function renderUiverseStatusBadge(status) {
  const norm = (status || '').toLowerCase().replace(/\s+/g, '');
  let badgeClass = 'uiverse-badge-waiting';
  let dotColor = '#d97706';

  if (norm === 'inprogress') {
    badgeClass = 'uiverse-badge-inprogress';
    dotColor = '#0284c7';
  } else if (norm === 'completed' || norm === 'paid' || norm === 'dispensed') {
    badgeClass = 'uiverse-badge-completed';
    dotColor = '#059669';
  } else if (norm === 'upcoming' || norm === 'issued') {
    badgeClass = 'uiverse-badge-upcoming';
    dotColor = '#7c3aed';
  } else if (norm === 'cancelled' || norm === 'unpaid' || norm === 'declined') {
    badgeClass = 'uiverse-badge-cancelled';
    dotColor = '#dc2626';
  }

  return `
    <span class="uiverse-badge ${badgeClass}">
      <span class="uiverse-dot-pulse" style="background-color: ${dotColor};"></span>
      <span>${status}</span>
    </span>
  `;
}

export function renderUiverseMetricCard({ id, title, value, subtitle, iconName, badgeText, theme = 'blue', sparkline = true }) {
  // Theme color maps for high vibrancy
  const themeMap = {
    blue: {
      iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
      badgeBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      sparklineColor: '#0284c7',
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      sparklineColor: '#059669',
    },
    violet: {
      iconBg: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800',
      badgeBg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      sparklineColor: '#7c3aed',
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      sparklineColor: '#d97706',
    },
  };

  const selectedTheme = themeMap[theme] || themeMap.blue;
  const iconSvg = getIcon(iconName, 'w-5 h-5');
  
  // Custom SVG Sparkline Path
  const sparklineSvg = sparkline ? `
    <svg class="w-16 h-6 overflow-visible" viewBox="0 0 80 28" fill="none">
      <path d="M 0 20 Q 15 5, 28 16 T 55 8 T 80 12" stroke="${selectedTheme.sparklineColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="80" cy="12" r="2.5" fill="${selectedTheme.sparklineColor}" />
    </svg>
  ` : '';

  return `
    <div id="${id}" class="uiverse-card p-4 cursor-default">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">${title}</span>
        <div class="p-2 rounded-xl ${selectedTheme.iconBg} border">
          ${iconSvg}
        </div>
      </div>
      <div class="mt-2.5 flex items-baseline justify-between gap-2">
        <h3 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">${value}</h3>
        ${sparklineSvg}
      </div>
      <div class="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">${subtitle}</p>
        ${badgeText ? `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedTheme.badgeBg} border whitespace-nowrap">${badgeText}</span>` : ''}
      </div>
    </div>
  `;
}

export function showToast(message, type = 'success') {
  let toast = document.getElementById('uiverse-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'uiverse-global-toast';
    toast.className = 'uiverse-toast';
    document.body.appendChild(toast);
  }

  const iconName = type === 'success' ? 'checkCircle' : (type === 'info' ? 'clock' : 'alertCircle');
  const iconColor = type === 'success' ? 'text-emerald-400' : (type === 'info' ? 'text-sky-400' : 'text-amber-400');
  toast.innerHTML = `
    <span class="${iconColor}">${getIcon(iconName, 'w-5 h-5')}</span>
    <span class="font-bold">${message}</span>
  `;

  toast.classList.add('show');
  gsap.fromTo(toast, { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' });

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    gsap.to(toast, {
      y: 40,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => toast.classList.remove('show'),
    });
  }, 3200);
}

export function animateCardsIn(selector = '.uiverse-card') {
  try {
    const els = document.querySelectorAll(selector);
    if (!els || els.length === 0) return;
    gsap.fromTo(
      selector,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.2,
        stagger: 0.02,
        ease: 'power1.out',
        clearProps: 'all',
      }
    );
  } catch (e) {
    console.debug('Animation notice:', e);
  }
}

export function animateViewIn(containerId = 'main-view-outlet') {
  try {
    const el = document.getElementById(containerId);
    if (!el) return;
    gsap.fromTo(
      `#${containerId}`,
      { opacity: 0 },
      { opacity: 1, duration: 0.18, ease: 'power1.out', clearProps: 'opacity' }
    );
  } catch (e) {
    console.debug('View animation notice:', e);
  }
}
