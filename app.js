class EmployeePortal {
  constructor() {
    // Elements
    this.sidebar = document.getElementById('sidebar');
    this.sidebarOverlay = document.getElementById('sidebar-overlay');
    this.menuToggle = document.getElementById('menu-toggle'); // hamburger button
    this.topLogoutBtn = document.getElementById('top-logout-btn');

    this.menuHome = document.getElementById('menu-home');
    this.menuProfile = document.getElementById('menu-profile');
    this.menuAttendance = document.getElementById('menu-attendance');
    this.menuSalary = document.getElementById('menu-salary');
    this.menuLogout = document.getElementById('menu-logout');

    this.pages = {
      login: document.getElementById('login-page'),
      menu: document.getElementById('menu-page'),
      attendance: document.getElementById('attendance-page'),
      salary: document.getElementById('salary-page'),
    };

    // Profile + Sidebar elements
    this.profileNameElem = document.getElementById('employee-name');
    this.profileIdElem = document.getElementById('employee-id-display');
    this.profilePhoneElem = document.getElementById('employee-phone');
    this.profileEmailElem = document.getElementById('employee-email');
    this.profileDepartmentElem = document.getElementById('employee-department');
    this.profileDOBElem = document.getElementById('employee-dob');
    this.profileReportingManagerElem = document.getElementById('employee-reporting-manager');
    this.profileLocationElem = document.getElementById('employee-location');
    this.profileBranchElem = document.getElementById('employee-branch');
    this.profileHRManagerElem = document.getElementById('employee-hr-manager');
    this.profilePhotoElem = document.getElementById('employee-photo');
    this.profileEmergencyContactElem = document.getElementById('employee-emergency-contact');
    this.profileBloodGroupElem = document.getElementById('employee-blood-group');
    this.profileAddressElem = document.getElementById('employee-address');
    this.profileFatherNameElem = document.getElementById('employee-father-name');
    // NEW FIELDS
    this.profileFirstNameElem = document.getElementById('employee-first-name');
    this.profileMiddleNameElem = document.getElementById('employee-middle-name');
    this.profileLastNameElem = document.getElementById('employee-last-name');
    this.profilePresentCityElem = document.getElementById('employee-present-city');
    this.profilePresentStateElem = document.getElementById('employee-present-state');
    this.profilePresentPinCodeElem = document.getElementById('employee-present-pincode');
    this.profilePermanentCityElem = document.getElementById('employee-permanent-city');
    this.profilePermanentStateElem = document.getElementById('employee-permanent-state');
    this.profilePermanentPinCodeElem = document.getElementById('employee-permanent-pincode');

    this.profileReligionElem = document.getElementById('employee-religion');
    this.profileGenderElem = document.getElementById('employee-gender');
    this.profileMaritalStatusElem = document.getElementById('employee-marital-status');

    this.profileWorkMobileElem = document.getElementById('employee-work-mobile');

    this.profilePersonalEmailElem = document.getElementById('employee-personal-email');

    this.profilePresentAddressElem = document.getElementById('employee-present-address');
    this.profilePermanentAddressElem = document.getElementById('employee-permanent-address');
    this.profileDesignationElem = document.getElementById('employee-designation');
    this.profilePANElem = document.getElementById('employee-pan');
    this.profileUANElem = document.getElementById('employee-uan');
    this.profileAadharElem = document.getElementById('employee-aadhar');
    this.profileMedicalHistoryElem = document.getElementById('employee-medical-history');
    this.profileFullNameElem = document.getElementById('employee-full-name');
    this.profilePhotoElem = document.getElementById('profile-pic');

    this.sidebarNameElem = document.getElementById('sidebar-employee-name');
    this.sidebarIdElem = document.getElementById('sidebar-employee-id');
    this.sidebarPhoneElem = document.getElementById('sidebar-employee-phone');

    this.loader = document.getElementById('attendance-loader');

    this.bindEvents();
    this.init();
  }

  bindEvents() {
    // open sidebar
    this.menuToggle?.addEventListener('click', () => this.openSidebar());

    // overlay click closes
    this.sidebarOverlay?.addEventListener('click', () => this.closeSidebar());

    // sidebar menu items
    this.menuHome?.addEventListener('click', () => {
      this.closeSidebar();
      this.showHome();
    });

    this.menuProfile?.addEventListener('click', () => {
      this.closeSidebar();
      this.showProfile();
    });

    this.menuAttendance?.addEventListener('click', () => {
      this.closeSidebar();
      this.loadAttendance();
    });

    this.menuSalary?.addEventListener('click', () => {
      this.closeSidebar();
      this.loadSalary();
    });

    // logout actions
    this.menuLogout?.addEventListener('click', () => this.logout());
    this.topLogoutBtn?.addEventListener('click', () => this.logout());
    document.getElementById('attendance-logout-btn')?.addEventListener('click', () => this.logout());
    document.getElementById('salary-logout-btn')?.addEventListener('click', () => this.logout());

    // back buttons → redirect to home
    document.getElementById('attendance-back-btn')?.addEventListener('click', () => {
      this.showPage('menu');
      this.showHome();
    });

    document.getElementById('salary-back-btn')?.addEventListener('click', () => {
      this.showPage('menu');
      this.showHome();
    });
  }

  init() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      this.loadEmployeeDetails();
      this.showPage('menu');
      this.showHome();
    } else {
      this.showPage('login');
    }
  }

  openSidebar() {
    this.sidebar?.classList.add('active');
    this.sidebar?.setAttribute('aria-hidden', 'false');
    this.sidebarOverlay?.classList.add('active');
    this.sidebarOverlay?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sidebar-open');
    this.menuToggle.style.display = "none"; 
  }

  closeSidebar() {
    this.sidebar?.classList.remove('active');
    this.sidebar?.setAttribute('aria-hidden', 'true');
    this.sidebarOverlay?.classList.remove('active');
    this.sidebarOverlay?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sidebar-open');
    this.menuToggle.style.display = "block"; 
  }

  loadEmployeeDetails() {
    const employeeId = localStorage.getItem('employeeId') || 'N/A';
    const employeeFullName = localStorage.getItem('employeeFullName') || 'N/A';
    const employeeFirstName = localStorage.getItem('employeeFirstName') || 'N/A';
    const employeeMiddleName = localStorage.getItem('employeeMiddleName') || 'N/A';
    const employeeLastName = localStorage.getItem('employeeLastName') || 'N/A';
    const employeeFatherName = localStorage.getItem('employeeFatherName') || 'N/A';

    // PERSONAL DETAILS
    const employeeDOB = localStorage.getItem('employeeDOB') || 'N/A';
    const employeeReligion = localStorage.getItem('employeeReligion') || 'N/A';
    const employeeGender = localStorage.getItem('employeeGender') || 'N/A';
    const employeeMaritalStatus = localStorage.getItem('employeeMaritalStatus') || 'N/A';
    const employeeBloodGroup = localStorage.getItem('employeeBloodGroup') || 'N/A';

    // CONTACT DETAILS
    const employeePhone = localStorage.getItem('employeePhone') || 'N/A';
    const employeeWorkMobile = localStorage.getItem('employeeWorkMobile') || 'N/A';
    const employeeEmail = localStorage.getItem('employeeEmail') || 'N/A';
    const employeePersonalEmail = localStorage.getItem('employeePersonalEmail') || 'N/A';

    // PRESENT ADDRESS
    const employeePresentAddress = localStorage.getItem('employeePresentAddress') || 'N/A';
    const employeePresentCity = localStorage.getItem('employeePresentCity') || 'N/A';
    const employeePresentState = localStorage.getItem('employeePresentState') || 'N/A';
    const employeePresentPin = localStorage.getItem('employeePresentPin') || 'N/A';

    // PERMANENT ADDRESS
    const employeePermanentAddress = localStorage.getItem('employeePermanentAddress') || 'N/A';
    const employeePermanentCity = localStorage.getItem('employeePermanentCity') || 'N/A';
    const employeePermanentState = localStorage.getItem('employeePermanentState') || 'N/A';
    const employeePermanentPin = localStorage.getItem('employeePermanentPin') || 'N/A';

    // WORK DETAILS
    const employeeReportingManager = localStorage.getItem('employeeReportingManager') || 'N/A';
    const employeeDepartment = localStorage.getItem('employeeDepartment') || 'N/A';
    const employeeDesignation = localStorage.getItem('employeeDesignation') || 'N/A';
    const employeeWorkLocation = localStorage.getItem('employeeWorkLocation') || 'N/A';
    const employeeJoiningBranch = localStorage.getItem('employeeJoiningBranch') || 'N/A';

    // GOV. DETAILS
    const employeePANNo = localStorage.getItem('employeePANNo') || 'N/A';
    const employeeUANNo = localStorage.getItem('employeeUANNo') || 'N/A';
    const employeeAadhar = localStorage.getItem('employeeAadhar') || 'N/A';

    // MEDICAL
    const employeeMedicalHistory = localStorage.getItem('employeeMedicalHistory') || 'N/A';

    // PHOTO
    const employeePhoto = localStorage.getItem('employeePhoto') || '';


    if (this.profileIdElem) this.profileIdElem.textContent = employeeId;
    if (this.profileFullNameElem) this.profileFullNameElem.textContent = employeeFullName;

    if (this.profileFirstNameElem) this.profileFirstNameElem.textContent = employeeFirstName;
    if (this.profileMiddleNameElem) this.profileMiddleNameElem.textContent = employeeMiddleName;
    if (this.profileLastNameElem) this.profileLastNameElem.textContent = employeeLastName;
    if (this.profileFatherNameElem) this.profileFatherNameElem.textContent = employeeFatherName;  
    if (this.profilePresentCityElem) this.profilePresentCityElem.textContent = employeePresentCity;
    if (this.profilePresentStateElem) this.profilePresentStateElem.textContent = employeePresentState;
    if (this.profilePresentPinCodeElem) this.profilePresentPinCodeElem.textContent = employeePresentPin;

    if (this.profilePermanentCityElem) this.profilePermanentCityElem.textContent = employeePermanentCity;
    if (this.profilePermanentStateElem) this.profilePermanentStateElem.textContent = employeePermanentState;
    if (this.profilePermanentPinCodeElem) this.profilePermanentPinCodeElem.textContent = employeePermanentPin;
    // PERSONAL
    if (this.profileDOBElem) this.profileDOBElem.textContent = employeeDOB;
    if (this.profileReligionElem) this.profileReligionElem.textContent = employeeReligion;
    if (this.profileGenderElem) this.profileGenderElem.textContent = employeeGender;
    if (this.profileMaritalStatusElem) this.profileMaritalStatusElem.textContent = employeeMaritalStatus;
    if (this.profileBloodGroupElem) this.profileBloodGroupElem.textContent = employeeBloodGroup;

    // CONTACT
    if (this.profilePhoneElem) this.profilePhoneElem.textContent = employeePhone;
    if (this.profileWorkMobileElem) this.profileWorkMobileElem.textContent = employeeWorkMobile;
    if (this.profileEmailElem) this.profileEmailElem.textContent = employeeEmail;
    if (this.profilePersonalEmailElem) this.profilePersonalEmailElem.textContent = employeePersonalEmail;

    // PRESENT ADDRESS
    if (this.profilePresentAddressElem)
      this.profilePresentAddressElem.textContent =
        `${employeePresentAddress}, ${employeePresentCity}, ${employeePresentState} - ${employeePresentPin}`;

    // PERMANENT ADDRESS
    if (this.profilePermanentAddressElem)
      this.profilePermanentAddressElem.textContent =
        `${employeePermanentAddress}, ${employeePermanentCity}, ${employeePermanentState} - ${employeePermanentPin}`;

    // WORK
    if (this.profileReportingManagerElem) this.profileReportingManagerElem.textContent = employeeReportingManager;
    if (this.profileDepartmentElem) this.profileDepartmentElem.textContent = employeeDepartment;
    if (this.profileDesignationElem) this.profileDesignationElem.textContent = employeeDesignation;
    if (this.profileLocationElem) this.profileLocationElem.textContent = employeeWorkLocation;
    if (this.profileBranchElem) this.profileBranchElem.textContent = employeeJoiningBranch;

    // GOV
    if (this.profilePANElem) this.profilePANElem.textContent = employeePANNo;
    if (this.profileUANElem) this.profileUANElem.textContent = employeeUANNo;
    if (this.profileAadharElem) this.profileAadharElem.textContent = employeeAadhar;

    // MEDICAL
    if (this.profileMedicalHistoryElem) this.profileMedicalHistoryElem.textContent = employeeMedicalHistory;

    // PHOTO
    if (this.profilePhotoElem) this.profilePhotoElem.src = employeePhoto || 'icons/LDL_logo (1).png';



    if (this.sidebarNameElem) this.sidebarNameElem.textContent = employeeFullName;
    if (this.sidebarIdElem) this.sidebarIdElem.textContent = `ID: ${employeeId}`;
    if (this.sidebarPhoneElem) this.sidebarPhoneElem.textContent = `📞 ${employeePhone}`;

    const homeNameElem = document.getElementById('home-employee-name');
    if (homeNameElem) homeNameElem.textContent = employeeFullName;
  }


  showPage(pageName) {
    Object.values(this.pages).forEach(p => p?.classList.remove('active'));
    this.pages[pageName]?.classList.add('active');
    this.closeSidebar();

    // 🔄 Re-render attendance if user navigates back
    if (pageName === "attendance" && window.attendanceCalendar) {
      window.attendanceCalendar.renderCalendar(window.attendanceCalendar.currentDate);
    }
  }

  showAttendanceLoader() {
    if (this.loader) this.loader.style.display = 'flex';
  }

  hideAttendanceLoader() {
    if (this.loader) this.loader.style.display = 'none';
  }

  async loadAttendance() {
    this.showAttendanceLoader();
    try {
      this.showPage('attendance');
      if (!window.attendanceCalendar) {
        window.attendanceCalendar = new AttendanceCalendar();
      } else {
        await window.attendanceCalendar.renderCalendar(new Date());
      }
    } catch (err) {
      alert('Failed to load attendance. Please try again.');
    } finally {
      this.hideAttendanceLoader();
    }
  }

  loadSalary() {
    this.showPage('salary');
    if (window.salaryManager && typeof window.salaryManager.renderMonthList === 'function') {
      window.salaryManager.renderMonthList();
    } else if (typeof SalaryManager === 'function') {
      window.salaryManager = new SalaryManager();
      window.salaryManager.renderMonthList?.();
    }
  }

  showHome() {
    const home = document.getElementById('home-page');
    const profile = document.getElementById('profile-page');

    if (home && profile) {
      home.style.display = 'block';
      profile.style.display = 'none';
    }

    // Load all employee details (Profile, Sidebar, Home)
    this.loadEmployeeDetails();
  }



  showProfile() {
    const home = document.getElementById('home-page');
    const profile = document.getElementById('profile-page');
    if (home && profile) {
      home.style.display = 'none';
      profile.style.display = 'block';
    }
  }

  logout() {
    if (window.authManager && typeof window.authManager.logout === 'function') {
      window.authManager.logout();
    } else {
      localStorage.removeItem('employeeId');
      localStorage.removeItem('employeeName');
      localStorage.removeItem('employeePhone');
      localStorage.removeItem('isLoggedIn');
      this.showPage('login');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.employeePortal = new EmployeePortal();
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (let reg of regs) {
      reg.update(); // Force re-check for new version
    }
  });  
}


