// salary.js - PWA-ready Salary Manager
class SalaryManager {
    constructor() {
        this.monthList = document.getElementById('month-list');
        this.salarySlip = document.getElementById('salary-slip');

    }
    
    init() {
        this.renderMonthList();
    }
    
    async fetchSalaryData(employeeId) {
        // this.apiUrl = "https://live.illusiondentallab.com/API_2020_Revised/api/ZohoPeople/Payslip";     
        try {
            const API_URL = window.APP_CONFIG.API_BASE_URL;

            const response = await fetch(`${API_URL}/api/ZohoPeople/Payslip`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ EmpID: employeeId })
            });

            if (!response.ok) throw new Error("Server error: " + response.status);

            const result = await response.json();
            if (result.status !== 200 || !result.data?.Data?.length) {
                return null;
            }

            // Cache the response in IndexedDB or localStorage for offline
            localStorage.setItem(`salaryData_${employeeId}`, JSON.stringify(result.data.Data));

            return result.data.Data;
        } catch (error) {

            // Try to load from cache if offline or fetch fails
            const cachedData = localStorage.getItem(`salaryData_${employeeId}`);
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            return null;
        }
    }

    async renderMonthList() {
        this.monthList.innerHTML = '';
        this.salarySlip.style.display = 'none';

        const employeeId = window.authManager?.getCurrentEmployee();
        if (!employeeId) {
            this.monthList.innerHTML = '<p>Please login to view salary slips.</p>';
            return;
        }

        const slips = await this.fetchSalaryData(employeeId);

        if (!slips || slips.length === 0) {
            this.monthList.innerHTML = '<p>No salary slips found!</p>';
            return;
        }

        slips.forEach(item => {
            const slipRow = document.createElement('div');
            slipRow.classList.add('slip-row');

            slipRow.innerHTML = `
                <span class="month-label">${item.Month}</span>
                <button class="download-btn">Download PDF</button>
            `;

            slipRow.querySelector('.download-btn').addEventListener('click', async () => {
                if (!navigator.onLine) {
                    alert("You are offline. Cannot download PDF now.");
                    return;
                }

                try {
                    const pdfWindow = window.open(item.PaySlipURL, '_blank');
                    if (!pdfWindow) alert("Pop-up blocked. Please allow pop-ups for this site.");
                } catch (err) {
                    alert("Failed to open PDF. Please try again.");
                }
            });

            this.monthList.appendChild(slipRow);
        });
    }
}


