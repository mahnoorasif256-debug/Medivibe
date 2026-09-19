import {
  collection,
  getDocs,
  setDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase.js';
import {
  initialPatients,
  initialAppointments,
  initialAppointmentRequests,
  initialPrescriptions,
  initialInvoices,
  initialDoctorProfile,
  initialNotificationSettings,
} from './mockData.js';

export const defaultWeeklySlots = [];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

hours.forEach((h, hIdx) => {
  days.forEach((d) => {
    let status = 'Open';
    if (d === 'Sat') {
      status = 'Disabled';
    } else if (
      (hIdx === 0 && d === 'Tue') ||
      (hIdx === 1 && d === 'Mon') ||
      (hIdx === 2 && d === 'Thu') ||
      (hIdx === 3 && d === 'Thu') ||
      (hIdx === 5 && d === 'Wed') ||
      (hIdx === 6 && d === 'Thu')
    ) {
      status = 'Booked';
    }
    const slot = {
      id: `${d}-${h}`,
      day: d,
      time: h,
      status,
    };
    if (status === 'Booked') {
      slot.patientName = 'Scheduled Patient';
    }
    defaultWeeklySlots.push(slot);
  });
});

export function sanitizeForFirestore(val, seen = new WeakSet()) {
  if (val === null || val === undefined) {
    return null;
  }
  if (typeof val !== 'object') {
    if (typeof val === 'function' || typeof val === 'symbol') {
      return null;
    }
    return val;
  }

  // Handle Date
  if (val instanceof Date) {
    return val.toISOString();
  }

  // Circular reference and DOM element protection
  if (typeof HTMLElement !== 'undefined' && val instanceof HTMLElement) {
    return null;
  }
  if (typeof Event !== 'undefined' && val instanceof Event) {
    return null;
  }
  if (val.window === val || val.document === val) {
    return null;
  }

  if (seen.has(val)) {
    return null;
  }
  seen.add(val);

  // Arrays
  if (Array.isArray(val)) {
    return val
      .map((item) => sanitizeForFirestore(item, seen))
      .filter((item) => item !== undefined && item !== null);
  }

  // Plain objects
  const cleanObj = {};
  for (const key of Object.keys(val)) {
    // Avoid non-serializable properties or internals
    if (key.startsWith('_') || key.startsWith('$')) continue;
    try {
      const cleanVal = sanitizeForFirestore(val[key], seen);
      if (cleanVal !== undefined) {
        cleanObj[key] = cleanVal;
      }
    } catch {
      // Ignore un-serializable child property
    }
  }
  return cleanObj;
}

export async function initializeFirestoreData() {
  if (!db) {
    console.info('Firestore instance unavailable; operating in local mode.');
    return;
  }
  try {
    const patSnap = await getDocs(collection(db, 'patients'));
    if (patSnap.empty) {
      for (const p of initialPatients) {
        await setDoc(doc(db, 'patients', p.id), sanitizeForFirestore(p));
      }
    }

    const aptSnap = await getDocs(collection(db, 'appointments'));
    if (aptSnap.empty) {
      for (const a of initialAppointments) {
        await setDoc(doc(db, 'appointments', a.id), sanitizeForFirestore(a));
      }
    }

    const reqSnap = await getDocs(collection(db, 'appointmentRequests'));
    if (reqSnap.empty) {
      for (const r of initialAppointmentRequests) {
        await setDoc(doc(db, 'appointmentRequests', r.id), sanitizeForFirestore(r));
      }
    }

    const rxSnap = await getDocs(collection(db, 'prescriptions'));
    if (rxSnap.empty) {
      for (const rx of initialPrescriptions) {
        await setDoc(doc(db, 'prescriptions', rx.id), sanitizeForFirestore(rx));
      }
    }

    const invSnap = await getDocs(collection(db, 'invoices'));
    if (invSnap.empty) {
      for (const inv of initialInvoices) {
        await setDoc(doc(db, 'invoices', inv.id), sanitizeForFirestore(inv));
      }
    }

    const profileSnap = await getDocs(collection(db, 'doctorProfile'));
    if (profileSnap.empty) {
      await setDoc(doc(db, 'doctorProfile', 'main'), sanitizeForFirestore(initialDoctorProfile));
    }

    const notifSnap = await getDocs(collection(db, 'notificationSettings'));
    if (notifSnap.empty) {
      await setDoc(doc(db, 'notificationSettings', 'main'), sanitizeForFirestore(initialNotificationSettings));
    }

    const slotSnap = await getDocs(collection(db, 'weeklySlots'));
    if (slotSnap.empty) {
      for (const s of defaultWeeklySlots) {
        await setDoc(doc(db, 'weeklySlots', s.id), sanitizeForFirestore(s));
      }
    }
  } catch (error) {
    console.warn('Firestore seeding offline or notice:', error?.message || String(error));
  }
}
