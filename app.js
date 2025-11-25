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
    const empId = localStorage.getItem('employeeId') || '-';
    const empName = localStorage.getItem('employeeName') ;
    const empPhone = localStorage.getItem('employeePhone') || 'N/A';

    if (this.profileNameElem) this.profileNameElem.textContent = empName;
    if (this.profileIdElem) this.profileIdElem.textContent = empId;
    if (this.profilePhoneElem) this.profilePhoneElem.textContent = empPhone;

    if (this.sidebarNameElem) this.sidebarNameElem.textContent = empName;
    if (this.sidebarIdElem) this.sidebarIdElem.textContent = `ID: ${empId}`;
    if (this.sidebarPhoneElem) this.sidebarPhoneElem.textContent = `📞 ${empPhone}`;

    const homeNameElem = document.getElementById('home-employee-name');
    if (homeNameElem) homeNameElem.textContent = empName;
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


