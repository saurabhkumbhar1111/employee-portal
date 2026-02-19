class AttendanceCalendar {
    constructor(isTeam = false ) {
        this.isTeam = isTeam;
        if (this.isTeam) {
            this.currentMonthElement = document.getElementById("team-current-month");
            this.calendarBody = document.getElementById("team-calendar-body");
        } else {
            this.currentMonthElement = document.getElementById("current-month");
            this.calendarBody = document.getElementById("calendar-body");
        }
        this.prevMonthBtn = document.getElementById(isTeam ? "team-prev-month-btn" : "prev-month-btn");
        this.nextMonthBtn = document.getElementById(isTeam ? "team-next-month-btn" : "next-month-btn");
        this.employeeId = null;
        this.currentDate = new Date();
        this.attendanceData = {};
        this.minDate = new Date(2025, 8, 1);
        this.teamAttendanceData = {};
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.renderCalendar(this.currentDate);
    }

    setupEventListeners() {
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());
    }

    getEmployeeId() {
        if (this.employeeId) return this.employeeId;
        return window.authManager?.getCurrentEmployee?.() || localStorage.getItem("employeeId");
    }

    async fetchAttendance(empId = null, isTeamView = false) {
        let employeeId;

        if (this.isTeam) {
            employeeId = empId || this.employeeId;
        } else {
            employeeId = this.getEmployeeId();
        }

        if (!employeeId) return null;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const startDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${new Date(year, month + 1, 0).getDate().toString().padStart(2, '0')}`;

        try {
            const API_URL = window.APP_CONFIG.API_BASE_URL;

            const response = await fetch(`${API_URL}/api/ZohoPeople/Attendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    StartDate: startDate,
                    EndDate: endDate,
                    EmpID: employeeId
                })
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const result = await response.json();
            if (!result || !result.data) return null;

            const formattedAttendance = {};
            result.data.forEach(item => {
                let normalizedDate = this.normalizeDate(item.Date);
                formattedAttendance[normalizedDate] = item;
            });            
            const storageKey = isTeamView
                ? `team-attendance-${employeeId}-${year}-${month + 1}`
                : `attendance-${year}-${month + 1}`;

            localStorage.setItem(storageKey, JSON.stringify(formattedAttendance));
            
            if (isTeamView) {
                this.teamAttendanceData = formattedAttendance;
            } else {
                this.attendanceData = formattedAttendance;
            }

            return true;

        } catch (error) {

            const storageKey = isTeamView
                ? `team-attendance-${employeeId}-${year}-${month + 1}`
                : `attendance-${year}-${month + 1}`;

            const cached = localStorage.getItem(storageKey);

            if (cached) {
                if (isTeamView) {
                    this.teamAttendanceData = JSON.parse(cached);
                } else {
                    this.attendanceData = JSON.parse(cached);
                }
                return true;
            } else {
                alert("Cannot fetch attendance. Check your internet connection.");
                return false;
            }
        }
    }

    normalizeDate(dateStr) {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async renderCalendar(date) {
        this.showAttendanceLoader();
        const success = await this.fetchAttendance(
            this.isTeam ? this.employeeId : null,
            this.isTeam
        );
        if (!success) {
            this.hideAttendanceLoader();
            return;
        }

        const year = date.getFullYear();
        const month = date.getMonth();
        const today = new Date();

        this.currentMonthElement.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        this.calendarBody.innerHTML = '';

        // ✅ Legend (top-right)
        const existingLegend = document.getElementById('calendar-legend');
        if (!existingLegend) {
            const legend = document.createElement('div');
            legend.id = 'calendar-legend';
            legend.style.position = 'absolute';
            legend.style.top = '10px';
            legend.style.right = '10px';
            legend.style.display = 'flex';
            legend.style.flexWrap = 'wrap';
            legend.style.gap = '6px';
            legend.innerHTML = `
                <span style="background:#a5d6a7;padding:2px 6px;border-radius:6px;font-size:0.75rem;">P - Present</span>
                <span style="background:#ef9a9a;padding:2px 6px;border-radius:6px;font-size:0.75rem;">A - Absent</span>
                <span style="background:#fff59d;padding:2px 6px;border-radius:6px;font-size:0.75rem;">H - Holiday</span>
                <span style="background:#eeeeee;padding:2px 6px;border-radius:6px;font-size:0.75rem;">W - Weekend</span>
            `;
            this.currentMonthElement.parentElement.style.position = 'relative';
            this.currentMonthElement.parentElement.appendChild(legend);
        }

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        let dateCounter = 1;

        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                cell.style.position = "relative";

                if ((i === 0 && j < startingDay) || dateCounter > daysInMonth) {
                    cell.innerHTML = '';
                } else {
                    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dateCounter.toString().padStart(2, '0')}`;                
                    const dataSource = this.isTeam ? this.teamAttendanceData : this.attendanceData;
                    const attendance = dataSource ? dataSource[dateStr] : null;
                    const currentDay = new Date(year, month, dateCounter);

                    const dateDiv = document.createElement('div');
                    dateDiv.className = 'date';
                    dateDiv.textContent = dateCounter;

                    const statusDiv = document.createElement('div');
                    statusDiv.className = 'status';

                    if (currentDay > today) {
                        cell.classList.add('future');
                        cell.appendChild(dateDiv);
                        row.appendChild(cell);
                        dateCounter++;
                        continue;
                    }

                    if (attendance) {
                        const totalTime = attendance.TotalTime || "00:00";
                        const hasWork = totalTime !== "00:00";
                        const statusText = attendance.Status.toLowerCase();

                        const isAbsent = statusText.includes("absent");
                        const isHoliday = statusText.includes("holiday");
                        const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6;

                        let displayChar = "";
                        let bgColor = "#e0e0e0";

                        if (isAbsent && !hasWork) {
                            displayChar = "A";
                            bgColor = "#ef9a9a";
                        } else if (isHoliday && !hasWork) {
                            displayChar = "H";
                            bgColor = "#fff59d";
                        } else if (isWeekend && !hasWork && !isHoliday) {
                            displayChar = "W";
                            bgColor = "#eeeeee";
                        } else if (hasWork) {
                            displayChar = "P";
                            bgColor = "#a5d6a7";
                        }

                        cell.style.backgroundColor = bgColor;

                        // ✅ Only show P/A/H/W and total time
                        statusDiv.innerHTML = `<strong>${displayChar}</strong>`;
                        if (hasWork) {
                            const totalTimeEl = document.createElement("span");
                            totalTimeEl.textContent = ` (${attendance.TotalTime})`;
                            totalTimeEl.style.cursor = "pointer";
                            totalTimeEl.style.fontWeight = "500";
                            totalTimeEl.style.color = "#0d47a1";

                            // 🟢 Popup on click
                            totalTimeEl.addEventListener("click", () => {
                                document.getElementById("attendance-popup").style.display = "flex";
                                document.getElementById("popup-intime").textContent = attendance.InTime || "-";
                                document.getElementById("popup-outtime").textContent = attendance.OutTime || "-";
                            });

                            statusDiv.appendChild(totalTimeEl);
                        }

                        cell.appendChild(dateDiv);
                        cell.appendChild(statusDiv);
                    }



                    if (dateCounter === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                        cell.classList.add('today');
                        cell.style.border = "2px solid #1976d2";
                    }

                    dateCounter++;
                }

                row.appendChild(cell);
            }

            this.calendarBody.appendChild(row);
            if (dateCounter > daysInMonth) break;
        }

        this.prevMonthBtn.disabled = year < this.minDate.getFullYear() ||
            (year === this.minDate.getFullYear() && month <= this.minDate.getMonth());
        this.nextMonthBtn.disabled = year > today.getFullYear() ||
            (year === today.getFullYear() && month >= today.getMonth());

            // Popup close logic
            if (!this.popupListenerBound) {
            document.getElementById("popup-close")?.addEventListener("click", () => {
                document.getElementById("attendance-popup").style.display = "none";
            });
            window.addEventListener("click", (e) => {
                if (e.target.id === "attendance-popup")
                    document.getElementById("attendance-popup").style.display = "none";
            });
            this.popupListenerBound = true;
        }
        this.hideAttendanceLoader();
    }

    attachTimePopup(statusDiv, attendance, displayChar, dateStr, totalTime) {
        const timeSpan = statusDiv.querySelector(".total-time");
        timeSpan.addEventListener("click", (e) => {
            e.stopPropagation();
            const inTime = attendance.InTime ? attendance.InTime.split(' ').slice(-2).join(' ') : '-';
            const outTime = attendance.OutTime ? attendance.OutTime.split(' ').slice(-2).join(' ') : '-';
            document.querySelectorAll(".popup, .bottom-sheet").forEach(el => el.remove());

            if (window.innerWidth <= 600) {
                // Mobile bottom sheet
                const sheet = document.createElement("div");
                sheet.className = "bottom-sheet";
                sheet.innerHTML = `
                    <div class="sheet-content">
                        <h4>${displayChar} - ${dateStr}</h4>
                        <p><strong>In:</strong> ${inTime}</p>
                        <p><strong>Out:</strong> ${outTime}</p>
                        <p><strong>Total:</strong> ${totalTime}</p>
                        <button class="close-sheet">Close</button>
                    </div>`;
                document.body.appendChild(sheet);
                setTimeout(() => sheet.classList.add("show"), 10);
                sheet.querySelector(".close-sheet").addEventListener("click", () => {
                    sheet.classList.remove("show");
                    setTimeout(() => sheet.remove(), 300);
                });
            } else {
                // Desktop tooltip
                const popup = document.createElement("div");
                popup.className = "popup";
                popup.innerHTML = `In: ${inTime}<br>Out: ${outTime}`;
                statusDiv.appendChild(popup);
                setTimeout(() => popup.remove(), 4000);
            }
        });
    }

    previousMonth() {
        const prevDate = new Date(this.currentDate);
        prevDate.setMonth(this.currentDate.getMonth() - 1);
        if (prevDate < this.minDate) return;
        this.currentDate = prevDate;
        this.renderCalendar(this.currentDate);
    }

    nextMonth() {
        const nextDate = new Date(this.currentDate);
        const today = new Date();
        if (nextDate > today) return;
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar(this.currentDate);
    }

    showAttendanceLoader() {
        const loader = document.getElementById('attendance-loader');
        if (loader) loader.style.display = 'flex';
    }

    hideAttendanceLoader() {
        const loader = document.getElementById('attendance-loader');
        if (loader) loader.style.display = 'none';
    }  
}