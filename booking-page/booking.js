import { db, auth } from "../firebase.config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function showReceiptModal(bookingData) {
    document.getElementById("rcptPatientName").innerText = bookingData.patientName;
    document.getElementById("rcptPhone").innerText = bookingData.patientPhone;
    document.getElementById("rcptNotes").innerText = bookingData.patientNotes || "None";
    document.getElementById("rcptDoctor").innerText = bookingData.doctorName;
    document.getElementById("rcptSpec").innerText = bookingData.doctorSpec;
    document.getElementById("rcptDate").innerText = bookingData.date;
    document.getElementById("rcptTime").innerText = bookingData.timeSlot;
    document.getElementById("rcptBookedFor").innerText = bookingData.bookedFor;
    document.getElementById("rcptAmount").innerText = `Rs. ${bookingData.amount.toLocaleString()}/-`;

    const modal = document.getElementById("receiptModal");
    if (modal) {
        modal.classList.add("active");
    }
}

async function savePatientDetailsToFirestore(bookingData) {
    const user = auth ? auth.currentUser : null;

    try {
        // Target Collection: 'patient_details'
        await addDoc(collection(db, "patient_details"), {
            patientName: bookingData.patientName,
            patientPhone: bookingData.patientPhone,
            patientNotes: bookingData.patientNotes,
            patientId: user ? user.uid : "guest_user",
            patientAccountEmail: user ? user.email : "guest@medivibe.com",
            bookedFor: bookingData.bookedFor,
            doctorName: bookingData.doctorName,
            doctorSpec: bookingData.doctorSpec,
            date: bookingData.date,
            timeSlot: bookingData.timeSlot,
            amount: bookingData.amount,
            isHomeVisit: bookingData.isHomeVisit,
            status: "confirmed",
            createdAt: serverTimestamp()
        });
        console.log("Successfully added document to 'patient_details' collection!");
    } catch (error) {
        console.warn("Firestore save bypass/warning:", error);
    }

    showReceiptModal(bookingData);
}

document.addEventListener("DOMContentLoaded", () => {
    let selectedDoctor = {
        name: "Dr. Sarah Johnson",
        spec: "Cardiologist",
        fee: 3500
    };
    let selectedDate = null;
    let selectedTime = "10:00 - 11:00 AM";
    let isHomeService = false;
    let bookedFor = "Self";

    const doctorChips = document.querySelectorAll(".doctor-chip");
    const dateContainer = document.getElementById("dateContainer");
    const timeChips = document.querySelectorAll(".time-chip");
    const homeServiceCheck = document.getElementById("homeServiceCheck");
    const bookSelfSwitch = document.getElementById("bookSelf");
    const bookRelativeSwitch = document.getElementById("bookRelative");
    const nameInput = document.getElementById("patientName");

    const summaryDoctor = document.getElementById("summaryDoctor");
    const summarySpec = document.getElementById("summarySpec");
    const summaryDoctorPrice = document.getElementById("summaryDoctorPrice");
    const homeServiceRow = document.getElementById("homeServiceRow");
    const summaryDateTime = document.getElementById("summaryDateTime");
    const summaryPatientTag = document.getElementById("summaryPatientTag");
    const summaryPatientDisplayName = document.getElementById("summaryPatientDisplayName");
    const summaryTotal = document.getElementById("summaryTotal");

    function generateDatePills() {
        const days = ["SUN", "MON", "TUE", "WED", "THR", "FRI", "SAT"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const today = new Date();
        if (!dateContainer) return;
        dateContainer.innerHTML = "";

        for (let i = 0; i < 7; i++) {
            const dateObj = new Date();
            dateObj.setDate(today.getDate() + i);

            const dayName = days[dateObj.getDay()];
            const dayNum = dateObj.getDate().toString().padStart(2, '0');
            const monthName = months[dateObj.getMonth()];
            const fullYear = dateObj.getFullYear();

            const pill = document.createElement("div");
            pill.className = `date-pill ${i === 0 ? 'active' : ''}`;
            pill.dataset.fullDate = `${dayName} ${dayNum} ${monthName} ${fullYear}`;
            pill.innerHTML = `
                <span class="day-name">${dayName}</span>
                <span class="day-num">${dayNum}</span>
            `;

            if (i === 0) {
                selectedDate = `${dayName} ${dayNum} ${monthName} ${fullYear}`;
                const monthElem = document.getElementById("currentMonthYear");
                if (monthElem) monthElem.innerText = `${monthName} ${fullYear}`;
            }

            pill.addEventListener("click", () => {
                document.querySelectorAll(".date-pill").forEach(p => p.classList.remove("active"));
                pill.classList.add("active");
                selectedDate = pill.dataset.fullDate;
                updateSummary();
            });

            dateContainer.appendChild(pill);
        }
    }

    doctorChips.forEach(chip => {
        chip.addEventListener("click", () => {
            doctorChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            
            selectedDoctor.name = chip.dataset.name;
            selectedDoctor.spec = chip.dataset.spec;
            selectedDoctor.fee = parseInt(chip.dataset.fee);
            
            updateSummary();
        });
    });

    timeChips.forEach(chip => {
        chip.addEventListener("click", () => {
            timeChips.forEach(t => t.classList.remove("active"));
            chip.classList.add("active");
            selectedTime = chip.innerText;
            updateSummary();
        });
    });

    if (nameInput) {
        nameInput.addEventListener("input", updateSummary);
    }

    if (homeServiceCheck) {
        homeServiceCheck.addEventListener("change", (e) => {
            isHomeService = e.target.checked;
            if (homeServiceRow) homeServiceRow.style.display = isHomeService ? "flex" : "none";
            updateSummary();
        });
    }

    if (bookSelfSwitch && bookRelativeSwitch) {
        bookSelfSwitch.addEventListener("change", (e) => {
            if (e.target.checked) {
                bookRelativeSwitch.checked = false;
                bookedFor = "Self";
            } else if (!bookRelativeSwitch.checked) {
                e.target.checked = true;
            }
            updateSummary();
        });

        bookRelativeSwitch.addEventListener("change", (e) => {
            if (e.target.checked) {
                bookSelfSwitch.checked = false;
                bookedFor = "Relative / Dependent";
            } else if (!bookSelfSwitch.checked) {
                e.target.checked = true;
            }
            updateSummary();
        });
    }

    function updateSummary() {
        if (summaryDoctor) summaryDoctor.innerText = selectedDoctor.name;
        if (summarySpec) summarySpec.innerText = `${selectedDoctor.spec} - Consultation`;
        if (summaryDoctorPrice) summaryDoctorPrice.innerText = `Rs. ${selectedDoctor.fee.toLocaleString()}/-`;

        if (summaryDateTime) summaryDateTime.innerText = `${selectedTime}, ${selectedDate}`;
        if (summaryPatientTag) summaryPatientTag.innerText = bookedFor;
        if (summaryPatientDisplayName && nameInput) {
            summaryPatientDisplayName.innerText = nameInput.value || "Patient Name";
        }

        let total = selectedDoctor.fee;
        if (isHomeService) total += 500;

        if (summaryTotal) summaryTotal.innerText = `Rs. ${total.toLocaleString()}/-`;
    }

    generateDatePills();
    updateSummary();

    const confirmBtn = document.getElementById("btnConfirmBooking");
    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            const nameVal = nameInput ? nameInput.value : "Unknown Patient";
            const phoneVal = document.getElementById("patientPhone") ? document.getElementById("patientPhone").value : "03001234567";
            const notesVal = document.getElementById("patientNotes") ? document.getElementById("patientNotes").value : "";

            const totalAmount = selectedDoctor.fee + (isHomeService ? 500 : 0);

            const bookingData = {
                patientName: nameVal,
                patientPhone: phoneVal,
                patientNotes: notesVal,
                doctorName: selectedDoctor.name,
                doctorSpec: selectedDoctor.spec,
                bookedFor: bookedFor,
                date: selectedDate,
                timeSlot: selectedTime,
                isHomeVisit: isHomeService,
                amount: totalAmount
            };

            savePatientDetailsToFirestore(bookingData);
        });
    }

    const closeBtn = document.getElementById("closeModalBtn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.getElementById("receiptModal").classList.remove("active");
        });
    }
});