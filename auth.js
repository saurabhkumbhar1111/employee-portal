var SECRET_KEY = "IllusionDentalPortal@2025"; // SAME key must be used in backend

function encryptPayload(payload) {
    var cipherText = CryptoJS.AES.encrypt(JSON.stringify(payload), SECRET_KEY).toString();
    return cipherText;
}

function decryptPayload(cipherText) {
    var bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    var decoded = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decoded);
}
class AuthManager {
    constructor() {
        this.generatedOtp = null;
        this.employeeId = null;
        this.employeeName = null;
        this.otpSection = document.getElementById("otp-section");
        if (this.otpSection) this.otpSection.style.display = "none";

        this.bindEvents();
    }

    bindEvents() {
        const sendBtn = document.getElementById("send-otp-btn");
        const verifyBtn = document.getElementById("verify-otp-btn");

        sendBtn?.addEventListener("click", () => this.sendOtp());
        verifyBtn?.addEventListener("click", () => this.verifyOtp());
    }

    async sendOtp() {
        const employeeId = (document.getElementById("employee-id")?.value || "").trim();
        const error = document.getElementById("employee-id-error");
        const otpMessage = document.getElementById("otp-message");

        if (!employeeId) {
            if (error) { error.style.display = "block";
            error.textContent = "Please enter employee ID"; }
            return;
        }

        if (!/^\d+$/.test(employeeId)) {
            if (error) {
                error.style.display = "block";
                error.textContent = "Employee ID must contain digits only";
            }
            return;
        }

        if (employeeId.length !== 8) {
            error.style.display = "block";
            error.textContent = "Employee ID must be exactly 8 characters";
            return;
        }

        const response = await fetch(
                "https://live.illusiondentallab.com/API_2020_Revised/api/ZohoPeople/EmployeeDetail",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ EmpID: employeeId })
                }
            );
        const data = await response.json();
        const employeeList = data?.data?.Data;

            if (!Array.isArray(employeeList) || employeeList.length === 0) {
                alert("❌ Invalid Employee ID. Please enter a valid one.");
                return;
            }
        if (error) error.style.display = "none";

        try {
            // Generate OTP
            this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            

            // Validate Employee ID via API
            const response = await fetch(
                "https://live.illusiondentallab.com/API_2020_Revised/api/ZohoPeople/EmployeeDetail",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ EmpID: employeeId, OTP: this.generatedOtp })
                }
            );

            

            // const employeeList = data?.data?.Data;

            // if (!Array.isArray(employeeList) || employeeList.length === 0) {
            //     alert("❌ Invalid Employee ID. Please enter a valid one.");
            //     return;
            // }

            // ✅ Show toast message
            alert("✅ OTP has been sent successfully to your registered mobile number!");       


            const employee = data.data.Data[0];
            const name = employee.FullName || "Employee";
            const phone = employee.MobileNo || "N/A";

            this.employeeId = employeeId;
            this.employeeName = name;
            this.employeePhone = phone;

            // Show OTP UI
            if (this.otpSection) this.otpSection.style.display = "block";
            if (otpMessage) {
            otpMessage.style.display = "block";
            otpMessage.textContent = `✅ OTP has been sent successfully to your registered mobile number ending with ${phone.slice(-4)}.`;
        }

            // (Optionally) send OTP to a backend / SMS gateway here
        } catch (err) {
            alert("Server error while validating Employee ID.");
        }
    }

    verifyOtp() {
        const enteredOtp = (document.getElementById("otp")?.value || "").trim();
        const otpError = document.getElementById("otp-error");

        if (!enteredOtp) {
            if (otpError) { otpError.textContent = "Please enter OTP"; otpError.style.display = "block"; }
            return;
        }

        if (enteredOtp === this.generatedOtp) {
            if (otpError) otpError.style.display = "none";
            alert("✅ OTP verified successfully!");

            // Save to localStorage
            localStorage.setItem("employeeId", this.employeeId);
            localStorage.setItem("employeeName", this.employeeName);
            localStorage.setItem('employeePhone', this.employeePhone);
            localStorage.setItem("isLoggedIn", "true");

            // Update UI in EmployeePortal
            if (window.employeePortal && typeof window.employeePortal.loadEmployeeDetails === "function") {
                window.employeePortal.loadEmployeeDetails();
                window.employeePortal.showPage("menu");
            } else {
                // fallback: navigate to menu page
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById('menu-page').classList.add('active');
            }
        } else {
            if (otpError) { otpError.textContent = "Invalid OTP, please try again."; otpError.style.display = "block"; }
        }
    }

    getCurrentEmployee() {
        return localStorage.getItem("employeeId") || null;
    }

    logout() {
        this.generatedOtp = null;
        this.employeeId = null;
        this.employeeName = null;

        const idInput = document.getElementById("employee-id");
        const otpInput = document.getElementById("otp");
        if (idInput) idInput.value = "";
        if (otpInput) otpInput.value = "";

        if (this.otpSection) this.otpSection.style.display = "none";

        localStorage.removeItem("employeeId");
        localStorage.removeItem("employeeName");
        localStorage.removeItem("isLoggedIn");

        // Show login page
        if (window.employeePortal && typeof window.employeePortal.showPage === 'function') {
            window.employeePortal.showPage('login');
        } else {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('login-page').classList.add('active');
        }
    }
}

// Utility function for showing toast
function showToast(message, color = "#4caf50") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.style.backgroundColor = color;
  toast.classList.add("show");

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    toast.style.display = "none";
  }, 3000);

  // Make sure it's visible before animation
  toast.style.display = "block";
}


window.authManager = new AuthManager();
