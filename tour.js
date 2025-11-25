// tour.js — Final Employee Portal Tour (Full Enhanced Version)
// -------------------------------------------------------------
const TOUR_KEY = "employeePortalTourSeen";
const TOUR_STEP_KEY = "employeePortalTourStep";
const AUTO_START = true; // set false after testing
const BRAND_COLOR = "#4a6da7";

document.addEventListener("DOMContentLoaded", () => {
    const steps = [
        { selector: "#menu-home", text: "🏠 Home — your main dashboard for updates.", preview: "images/home_preview.png" },
        { selector: "#menu-profile", text: "👤 Profile — view and edit your personal details.", preview: "images/profile_preview.png" },
        { selector: "#menu-attendance", text: "🗓 Attendance — check your attendance records.", preview: "images/attendance_preview.png" },
        { selector: "#menu-salary", text: "💰 Salary Slip — download your monthly salary slips.", preview: "images/salary_preview.png" },
    ];

    injectTourStyles();
    setupFloatingMenu();

    // start automatically if not seen or mid-tour
    if (AUTO_START && (!localStorage.getItem(TOUR_KEY) || localStorage.getItem(TOUR_STEP_KEY))) {
        setTimeout(() => startTour(steps), 1200);
    }

    document.getElementById("tour-start").addEventListener("click", () => startTour(steps));
    document.getElementById("tour-reset").addEventListener("click", resetTour);
});

function startTour(steps) {
    let current = parseInt(localStorage.getItem(TOUR_STEP_KEY) || "0");
    createOverlay();

    function showStep(i) {
        const step = steps[i];
        const el = document.querySelector(step.selector);
        if (!el) return nextStep();

        const rect = el.getBoundingClientRect();
        fadeBackground(true);

        const highlight = document.createElement("div");
        highlight.className = "tour-highlight";
        highlight.style.top = `${rect.top + window.scrollY - 6}px`;
        highlight.style.left = `${rect.left - 6}px`;
        highlight.style.width = `${rect.width + 12}px`;
        highlight.style.height = `${rect.height + 12}px`;
        document.body.appendChild(highlight);

        const tooltip = document.createElement("div");
        tooltip.className = "tour-tooltip";
        tooltip.innerHTML = `
      <div class="tour-arrow"></div>
      ${step.preview ? `<div class="tour-preview"><span class="tour-label">Page Preview</span><img src="${step.preview}" alt="Preview"></div>` : ""}
      <p>${step.text}</p>
      <div class="tour-buttons">
        ${i > 0 ? `<button id="prev-step">← Back</button>` : ""}
        <button id="skip-step" class="skip">Skip</button>
        <button id="next-step">${i === steps.length - 1 ? "Finish" : "Next →"}</button>
      </div>
      <button id="replay-later" class="replay-later">Replay Later</button>
    `;
        document.body.appendChild(tooltip);
        positionTooltip(tooltip, rect);

        tooltip.querySelector("#next-step").addEventListener("click", nextStep);
        tooltip.querySelector("#skip-step").addEventListener("click", endTour);
        tooltip.querySelector("#replay-later").addEventListener("click", replayLater);
        if (tooltip.querySelector("#prev-step")) tooltip.querySelector("#prev-step").addEventListener("click", prevStep);
    }

    function positionTooltip(tooltip, rect) {
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            tooltip.style.position = "fixed";
            tooltip.style.top = "50%";
            tooltip.style.left = "50%";
            tooltip.style.transform = "translate(-50%, -50%)";
            tooltip.style.width = "90%";
            tooltip.style.maxWidth = "320px";

            const arrow = tooltip.querySelector(".tour-arrow");
            if (arrow) {
                arrow.style.position = "absolute";
                arrow.style.top = "100%";
                arrow.style.left = "50%";
                arrow.style.transform = "translateX(-50%) rotate(180deg)";
                arrow.style.borderBottom = "10px solid transparent";
                arrow.style.borderTop = `10px solid ${BRAND_COLOR}`;
                arrow.style.borderLeft = "10px solid transparent";
                arrow.style.borderRight = "10px solid transparent";
            }
        } else {
            const spaceBelow = window.innerHeight - rect.bottom;
            const showAbove = spaceBelow < 150;
            const top = showAbove
                ? rect.top + window.scrollY - tooltip.offsetHeight - 14
                : rect.bottom + window.scrollY + 14;

            tooltip.classList.toggle("above", showAbove);
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${Math.max(rect.left + rect.width / 2 - 140, 20)}px`;
            tooltip.style.transform = "none";

            const arrow = tooltip.querySelector(".tour-arrow");
            if (arrow) {
                arrow.style.position = "absolute";
                arrow.style.left = "40px";
                arrow.style.top = showAbove ? "auto" : "-10px";
                arrow.style.bottom = showAbove ? "-10px" : "auto";
                arrow.style.borderTop = showAbove ? `10px solid ${BRAND_COLOR}` : "none";
                arrow.style.borderBottom = showAbove ? "none" : `10px solid ${BRAND_COLOR}`;
            }
        }
    }

    function nextStep() {
        cleanupStep();
        current++;
        localStorage.setItem(TOUR_STEP_KEY, current);
        current < steps.length ? showStep(current) : endTour();
    }
    function prevStep() {
        cleanupStep();
        current--;
        localStorage.setItem(TOUR_STEP_KEY, current);
        showStep(current);
    }
    function cleanupStep() {
        fadeBackground(false);
        document.querySelectorAll(".tour-tooltip, .tour-highlight").forEach(el => el.remove());
    }
    function endTour() {
        cleanupStep();
        localStorage.removeItem(TOUR_STEP_KEY);
        removeOverlay();
        localStorage.setItem(TOUR_KEY, "true");
    }
    function replayLater() {
        cleanupStep();
        localStorage.removeItem(TOUR_STEP_KEY);
        removeOverlay();
        alert("🕓 The tour will show again next time you log in.");
    }

    showStep(current);
}

function resetTour() {
    localStorage.removeItem(TOUR_KEY);
    localStorage.removeItem(TOUR_STEP_KEY);
    alert("✅ Tour reset. It will auto-start next time.");
}

function createOverlay() {
    if (!document.getElementById("tour-overlay")) {
        const overlay = document.createElement("div");
        overlay.id = "tour-overlay";
        document.body.appendChild(overlay);
    }
}

function removeOverlay() {
    document.getElementById("tour-overlay")?.remove();
    document.querySelectorAll(".tour-tooltip, .tour-highlight").forEach(el => el.remove());
    fadeBackground(false);
}

// 🔅 Fade-to-dark transition layer
function fadeBackground(dark = true) {
    let layer = document.getElementById("tour-fade-layer");
    if (!layer) {
        layer = document.createElement("div");
        layer.id = "tour-fade-layer";
        document.body.appendChild(layer);
    }
    if (dark) layer.classList.add("active");
    else layer.classList.remove("active");
}

function setupFloatingMenu() {
    if (!document.getElementById("tour-menu")) {
        const menu = document.createElement("div");
        menu.id = "tour-menu";
        menu.className = "tour-menu";
        menu.innerHTML = `
      <button id="tour-main" class="tour-main">❓</button>
      <div class="tour-options">
        <button id="tour-start">▶ Start Tour</button>
        <button id="tour-reset">↺ Reset Tour</button>
      </div>`;
        document.body.appendChild(menu);
        document.getElementById("tour-main").addEventListener("click", () => menu.classList.toggle("expanded"));
    }
}

function injectTourStyles() {
    const style = document.createElement("style");
    style.textContent = `
    #tour-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);z-index:9998;animation:fadeIn .4s ease;}
    #tour-fade-layer{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0);z-index:9997;transition:background .5s ease;pointer-events:none;}
    #tour-fade-layer.active{background:rgba(0,0,0,0.35);}
    .tour-highlight{position:absolute;border:3px solid ${BRAND_COLOR};border-radius:8px;box-shadow:0 0 25px 6px ${BRAND_COLOR}80;z-index:9999;animation:pulse 1.2s infinite alternate;transition:all .4s;}
    @media(max-width:768px){.tour-highlight{opacity:.35;transform:scale(.9);box-shadow:0 0 12px 3px ${BRAND_COLOR}66;}}
    .tour-tooltip{position:absolute;background:#fff;color:#333;border-radius:10px;border:2px solid ${BRAND_COLOR};padding:14px 16px;z-index:10000;width:280px;box-shadow:0 6px 16px rgba(0,0,0,.25);animation:slideIn .4s ease;}
    .tour-tooltip.above .tour-arrow{bottom:-10px;top:auto;border-top:10px solid ${BRAND_COLOR};border-bottom:none;}
    .tour-arrow{position:absolute;top:-10px;left:40px;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:10px solid ${BRAND_COLOR};}
    .tour-preview{text-align:center;margin-bottom:10px;border-radius:6px;overflow:hidden;}
    .tour-preview img{width:100%;height:auto;border-radius:6px;border:1px solid #ddd;box-shadow:0 2px 6px rgba(0,0,0,.15);opacity:0;animation:fadeIn .5s ease forwards;}
    .tour-label{display:block;font-size:12px;color:#666;margin-bottom:4px;}
    .tour-buttons{display:flex;justify-content:space-between;margin-top:10px;}
    .tour-buttons button{background:${BRAND_COLOR};color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;transition:background .3s;}
    .tour-buttons .skip{background:transparent;color:${BRAND_COLOR};border:1px solid ${BRAND_COLOR};}
    #replay-later{margin-top:10px;background:transparent;color:${BRAND_COLOR};border:none;font-size:12px;text-decoration:underline;cursor:pointer;width:100%;text-align:right;}
    .tour-buttons button:hover,#replay-later:hover{background:#3c5d91;color:#fff;}
    .tour-menu{position:fixed;bottom:20px;right:20px;z-index:10001;display:flex;flex-direction:column;align-items:flex-end;}
    .tour-main{background:${BRAND_COLOR};color:#fff;border:none;border-radius:50%;width:55px;height:55px;font-size:22px;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.25);transition:transform .3s,background .3s;}
    .tour-options{display:none;flex-direction:column;gap:6px;margin-bottom:8px;}
    .tour-menu.expanded .tour-options{display:flex;animation:fadeIn .3s ease;}
    .tour-options button{background:${BRAND_COLOR};color:#fff;border:none;border-radius:6px;padding:8px 10px;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.25);cursor:pointer;}
    .tour-options button:hover{background:#3c5d91;}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes pulse{from{box-shadow:0 0 10px 2px ${BRAND_COLOR}66;}to{box-shadow:0 0 25px 6px ${BRAND_COLOR};}}
    @keyframes slideIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @media(max-width:768px){
      .tour-tooltip{position:fixed!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;width:90%!important;max-width:320px;text-align:center;}
      .tour-arrow{top:100%!important;left:50%!important;transform:translateX(-50%) rotate(180deg)!important;}
      .tour-buttons{justify-content:center;flex-wrap:wrap;gap:6px;}
      .tour-buttons button{flex:1 1 40%;font-size:14px;}
      .tour-menu{right:10px;bottom:10px;}
      .tour-main{width:50px;height:50px;font-size:20px;}
      .tour-preview img{max-height:120px;object-fit:contain;}
    }
  `;
    document.head.appendChild(style);
}
