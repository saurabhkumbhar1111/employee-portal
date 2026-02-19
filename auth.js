var SECRET_KEY = "5891239269021817"; 

function encryptPayload(payload) {
  return CryptoJS.AES.encrypt(JSON.stringify(payload), CryptoJS.enc.Utf8.parse(SECRET_KEY), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
  }).toString();
}

function decryptPayload(encrypted) {
  var bytes = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Utf8.parse(SECRET_KEY), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
  });
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

async function getFcmToken() {
    try {
        if (!('serviceWorker' in navigator)) throw new Error("Service Workers not supported");

        const registration = await navigator.serviceWorker.register('sw.js');

        // Wait until SW is active
        if (registration.installing) {
            await new Promise(res => registration.installing.addEventListener('statechange', e => {
                if (e.target.state === 'activated') res();
            }));
        } else if (registration.waiting) {
            await new Promise(res => registration.waiting.addEventListener('statechange', e => {
                if (e.target.state === 'activated') res();
            }));
        }

        const messaging = firebase.messaging();

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            return null;
        }

        const token = await messaging.getToken({
            vapidKey: "BLXIFrzowad4LYjYFWv8_JEnyGYPcQ7bXNvt6_Szy7HK8o22gcHOVbkvrr99qCIxpx9ijIQyZcS68GUBT0DlrCY",
            serviceWorkerRegistration: registration
        });

        return token;

    } catch (err) {
        return null;
    }
}

function getDeviceInfo() {
  const ua = navigator.userAgent.toLowerCase();

  let platform = "unknown";
  let device = "unknown";

  if (/android/.test(ua)) {
    platform = "android";
    device = "Android";
  } else if (/iphone|ipad|ipod/.test(ua)) {
    platform = "ios";
    device = "iOS";
  } else if (/windows/.test(ua)) {
    platform = "browser";
    device = "Windows";
  } else if (/mac/.test(ua)) {
    platform = "browser";
    device = "Mac";
  }

  // Detect PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    platform = "pwa";
    device += " (PWA)";
  }

  return { platform, device };
}


class AuthManager {
    constructor() {
        this.generatedOtp = null;
        this.employeeId = null;
        this.employeeName = null;
        this.otpSection = document.getElementById("otp-section");
        if (this.otpSection) this.otpSection.style.display = "none";

        this.bindEvents();

	const savedId = localStorage.getItem("employeeId");
        const savedLogin = localStorage.getItem("isLoggedIn");

        if (savedId && savedLogin === "true") {
            this.employeeId = savedId;

            if (window.employeePortal && typeof window.employeePortal.loadEmployeeDetails === "function") {
                window.employeePortal.loadEmployeeDetails();
                window.employeePortal.showPage("menu");
            }
        }
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
        error.style.display = "block";
        error.textContent = "Please enter employee ID";
        return;
    }

    if (!/^\d+$/.test(employeeId)) {
        error.style.display = "block";
        error.textContent = "Employee ID must contain digits only";
        return;
    }

    if (employeeId.length !== 8) {
        error.style.display = "block";
        error.textContent = "Employee ID must be exactly 8 characters";
        return;
    }

    try {
        // Generate OTP
        this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // Encrypt payload
        const encryptedPayload = encryptPayload({
            EmpID: employeeId,
            OTP: this.generatedOtp
        });
        const API_URL = window.APP_CONFIG.API_BASE_URL;
        const response = await fetch(
            `${API_URL}/api/ZohoPeople/EmployeeDetail_Revised`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: encryptedPayload })
            }
        );

        const data = await response.json();
        let employeeData = data?.data?.Data;

        // Normalize: ensure employeeData is always an array
        if (!employeeData) {
            alert("❌ Invalid Employee ID.");
            return;
        }

        if (!Array.isArray(employeeData)) {
            employeeData = [employeeData];
        }

        if (employeeData.length === 0) {
            alert("❌ Invalid Employee ID.");
            return;
        }

        alert("✅ OTP has been sent successfully!");

        // Extract ALL fields from employee JSON
        const employee = employeeData[0];
        const EmpCode = employee.Code || "N/A";
        const FullName = employee.FullName || "N/A";
        const FirstName = employee.FirstName || "N/A";
        const MiddleName = employee.MiddleName || "N/A";
        const LastName = employee.LastName || "N/A";
        const FatherName = employee.FatherName || "N/A";

        const DateOfBirth = employee.DateOfBirth || "N/A";
        const Religion = employee.Religion || "N/A";
        const Gender = employee.Gender || "N/A";
        const MaritalStatus = employee.MaritalStatus || "N/A";
        const BloodGroup = employee.BloodGroup || "N/A";

        const MobileNo = employee.MobileNo || "N/A";
        const WorkMobileNo = employee.WorkMobileNo || "N/A";

        const OfficialEmailID = employee.OfficialEmailID || "N/A";
        const PersonalEmailID = employee.PersonalEmailID || "N/A";

        const PresentAddress = employee.PresentAddress || "N/A";
        const PresentCity = employee.PresentCity || "N/A";
        const PresentState = employee.PresentState || "N/A";
        const PresentPinCode = employee.PresentPinCode || "N/A";

        const PermanentAddress = employee.PermanentAddress || "N/A";
        const PermanentCity = employee.PermanentCity || "N/A";
        const PermanentState = employee.PermanentState || "N/A";
        const PermanentPinCode = employee.PermanentPinCode || "N/A";

        const ReportingManager = employee.ReportingManager || "N/A";
        const Department = employee.Department || "N/A";
        const Designation = employee.Designation || "N/A";
        const WorkLocation = employee.WorkLocation || "N/A";
        const JoiningBranch = employee.JoiningBranch || "N/A";

        const PANNo = employee.PANNo || "N/A";
        const UANNO = employee.UANNO || "N/A";
        const AadharCardNo = employee.AadharCardNo || "N/A";

        const MedicalHistory = employee.MedicalHistory || "N/A";


                // Basic Details
        this.employeeId = EmpCode;
        this.employeeFullName = FullName;
        this.employeeFirstName = FirstName;
        this.employeeMiddleName = MiddleName;
        this.employeeLastName = LastName;
	this.employeeFatherName = FatherName;
        this.employeeDOB = DateOfBirth;
        this.employeeReligion = Religion;
        this.employeeGender = Gender;
        this.employeeMaritalStatus = MaritalStatus;
        this.employeeBloodGroup = BloodGroup;

        // Contact
        this.employeePhone = MobileNo;
        this.employeeWorkMobile = WorkMobileNo;
        this.employeeEmail = OfficialEmailID;
        this.employeePersonalEmail = PersonalEmailID;

        // Present Address
        this.employeePresentAddress = PresentAddress;
        this.employeePresentCity = PresentCity;
        this.employeePresentState = PresentState;
        this.employeePresentPin = PresentPinCode;

        // Permanent Address
        this.employeePermanentAddress = PermanentAddress;
        this.employeePermanentCity = PermanentCity;
        this.employeePermanentState = PermanentState;
        this.employeePermanentPin = PermanentPinCode;

        // Professional Details
        this.employeeReportingManager = ReportingManager;
        this.employeeDepartment = Department;
        this.employeeDesignation = Designation;
        this.employeeWorkLocation = WorkLocation;
        this.employeeJoiningBranch = JoiningBranch;

        // IDs
        this.employeePANNo = PANNo;
        this.employeeUANNo = UANNO;
        this.employeeAadhar = AadharCardNo;

        // Others
        this.employeeMedicalHistory = MedicalHistory;


        // Show OTP UI
        if (this.otpSection) this.otpSection.style.display = "block";

        if (otpMessage) {
            otpMessage.style.display = "block";
            // otpMessage.textContent = `OTP sent to mobile number ending with ${phone.slice(-4)}.`;
        }

    } catch (err) {
        alert("Server error while validating Employee ID.");
    }
}


    async verifyOtp() {
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
                localStorage.setItem("employeeFullName", this.employeeFullName);
                localStorage.setItem("employeeFirstName", this.employeeFirstName);
                localStorage.setItem("employeeMiddleName", this.employeeMiddleName);
                localStorage.setItem("employeeLastName", this.employeeLastName);
	            localStorage.setItem("employeeFatherName", this.employeeFatherName);

                localStorage.setItem("employeeDOB", this.employeeDOB);
                localStorage.setItem("employeeReligion", this.employeeReligion);
                localStorage.setItem("employeeGender", this.employeeGender);
                localStorage.setItem("employeeMaritalStatus", this.employeeMaritalStatus);
                localStorage.setItem("employeeBloodGroup", this.employeeBloodGroup);

                localStorage.setItem("employeePhone", this.employeePhone);
                localStorage.setItem("employeeWorkMobile", this.employeeWorkMobile);
                localStorage.setItem("employeeEmail", this.employeeEmail);
                localStorage.setItem("employeePersonalEmail", this.employeePersonalEmail);

                localStorage.setItem("employeePresentAddress", this.employeePresentAddress);
                localStorage.setItem("employeePresentCity", this.employeePresentCity);
                localStorage.setItem("employeePresentState", this.employeePresentState);
                localStorage.setItem("employeePresentPin", this.employeePresentPin);

                localStorage.setItem("employeePermanentAddress", this.employeePermanentAddress);
                localStorage.setItem("employeePermanentCity", this.employeePermanentCity);
                localStorage.setItem("employeePermanentState", this.employeePermanentState);
                localStorage.setItem("employeePermanentPin", this.employeePermanentPin);

                localStorage.setItem("employeeReportingManager", this.employeeReportingManager);
                localStorage.setItem("employeeDepartment", this.employeeDepartment);
                localStorage.setItem("employeeDesignation", this.employeeDesignation);
                localStorage.setItem("employeeWorkLocation", this.employeeWorkLocation);
                localStorage.setItem("employeeJoiningBranch", this.employeeJoiningBranch);

                localStorage.setItem("employeePANNo", this.employeePANNo);
                localStorage.setItem("employeeUANNo", this.employeeUANNo);
                localStorage.setItem("employeeAadhar", this.employeeAadhar);

                localStorage.setItem("employeeMedicalHistory", this.employeeMedicalHistory);
		        localStorage.setItem("isLoggedIn", "true");
                // localStorage.setItem("isManager", "true");


	// Generate Firebase Push Notification Token
            (async () => {

                const API_URL = window.APP_CONFIG.API_BASE_URL;
                const deviceInfo = getDeviceInfo();

                try {
                    const token = await getFcmToken();

                    const loginResponse = await fetch(`${API_URL}/api/ZohoPeople/PostLoginActivity`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            EmpID: this.employeeId,
                            LoginStatus: "Login",
                            Token: token || null,
                            LoginPlatform: deviceInfo.platform,
                            LoginDevice: deviceInfo.device
                        })
                    });

                    let isManager = false;
                    if (loginResponse.ok) {
                        const text = await loginResponse.text();
                        if (text) {
                            const loginData = JSON.parse(text);
                            if (loginData?.data?.IsManager === true) {
                                isManager = true;
                            }
                        }
                    }

                    localStorage.setItem("isManager", isManager ? "true" : "false");


                } catch (error) {
                    localStorage.setItem("isManager", "false");
                }

                if (window.employeePortal) {
                    window.employeePortal.updateManagerMenu();
                    window.employeePortal.loadEmployeeDetails();
                    window.employeePortal.showPage("menu");
                }

            })();


            if (window.employeePortal && typeof window.employeePortal.loadEmployeeDetails === "function") {
                window.employeePortal.loadEmployeeDetails();
                window.employeePortal.showPage("menu");
            } else {
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

	const employeeId = localStorage.getItem("employeeId");

        const API_URL = window.APP_CONFIG.API_BASE_URL;

        //  Call logout API
        fetch(`${API_URL}/api/ZohoPeople/PostLoginActivity`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                EmpID: employeeId,
                LoginStatus: "Logout"
            })
        });
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
        localStorage.removeItem("isManager");

        // Show login page
        if (window.employeePortal && typeof window.employeePortal.showPage === 'function') {
            window.employeePortal.showPage('login');
        } else {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('login-page').classList.add('active');
        }
    }
}

function redirectToUpdateForm() {
  const empCode = localStorage.getItem("employeeId");

  if (!empCode) {
    alert("Employee code not found. Please login again.");
    return;
  }

  const baseUrl =
    "https://forms.zohopublic.in/laxmigroup1/form/dfgdfg/formperma/zipZyemkN4aivmyGEvcRwQ2zN8W9xpI4W7gDfhbLUvI";

  const finalUrl = `${baseUrl}?code=${encodeURIComponent(empCode)}`;

  // Redirect
  window.location.href = finalUrl;
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

 async function  submitAcknowledgement(statusText) {

    const API_URL = window.APP_CONFIG.API_BASE_URL;
    const employeeId = localStorage.getItem('employeeId') || 'N/A';
    const payload = {
      EmpID: employeeId,
      AckText: statusText,
    };

    try {
      const response =await fetch(`${API_URL}/api/ZohoPeople/Employee_Acknowledgement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data =await response.json();
      if (data.status === 200) {
        alert("Thank You! Your response has been submitted.");
      } else {
        alert("Error submitting response.");
      }
    } catch (err) {
      alert("Network error!");
    }
  }


window.authManager = new AuthManager();
