const DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const RING_CIRCUMFERENCE = 565.5;
const STORAGE_KEY = "pomodoroFlow.sessions";

let mode = "work";
let secondsLeft = DURATIONS[mode];
let timerId = null;
let running = false;

const timeDisplay = document.getElementById("timeDisplay");
const ringProgress = document.querySelector(".ring-progress");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const modeButtons = document.querySelectorAll(".mode-btn");
const todayCountEl = document.getElementById("todayCount");
const streakCountEl = document.getElementById("streakCount");
const totalCountEl = document.getElementById("totalCount");
const logList = document.getElementById("logList");

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateRing() {
  const fraction = secondsLeft / DURATIONS[mode];
  ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - fraction);
  ringProgress.style.stroke = mode === "work" ? "var(--accent)" : "var(--accent-soft)";
}

function render() {
  timeDisplay.textContent = formatTime(secondsLeft);
  updateRing();
}

function setMode(newMode) {
  mode = newMode;
  secondsLeft = DURATIONS[mode];
  running = false;
  clearInterval(timerId);
  startPauseBtn.textContent = "Start";
  modeButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === newMode));
  render();
}

function tick() {
  secondsLeft -= 1;
  if (secondsLeft <= 0) {
    completeSession();
    return;
  }
  render();
}

function completeSession() {
  clearInterval(timerId);
  running = false;
  startPauseBtn.textContent = "Start";

  if (mode === "work") {
    logSession();
  }

  secondsLeft = DURATIONS[mode];
  render();
  renderStats();

  new Audio(
    "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
  ).play().catch(() => {});
}

function logSession() {
  const sessions = loadSessions();
  sessions.push({ timestamp: Date.now() });
  saveSessions(sessions);
}

function toggleStartPause() {
  if (running) {
    clearInterval(timerId);
    running = false;
    startPauseBtn.textContent = "Start";
  } else {
    running = true;
    startPauseBtn.textContent = "Pause";
    timerId = setInterval(tick, 1000);
  }
}

function resetTimer() {
  clearInterval(timerId);
  running = false;
  secondsLeft = DURATIONS[mode];
  startPauseBtn.textContent = "Start";
  render();
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function computeStreak(sessions) {
  if (sessions.length === 0) return 0;
  const days = [...new Set(sessions.map((s) => new Date(s.timestamp).toDateString()))]
    .map((d) => new Date(d))
    .sort((a, b) => b - a);

  let streak = 0;
  let cursor = new Date();
  for (const day of days) {
    if (isSameDay(day, cursor)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (day < cursor) {
      break;
    }
  }
  return streak;
}

function renderStats() {
  const sessions = loadSessions();
  const today = new Date();
  const todayCount = sessions.filter((s) => isSameDay(new Date(s.timestamp), today)).length;

  todayCountEl.textContent = todayCount;
  streakCountEl.textContent = computeStreak(sessions);
  totalCountEl.textContent = sessions.length;

  logList.innerHTML = "";
  sessions
    .slice(-8)
    .reverse()
    .forEach((s) => {
      const li = document.createElement("li");
      const date = new Date(s.timestamp);
      li.innerHTML = `<span>Focus session</span><span>${date.toLocaleDateString()} ${date.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}</span>`;
      logList.appendChild(li);
    });
}

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

startPauseBtn.addEventListener("click", toggleStartPause);
resetBtn.addEventListener("click", resetTimer);

render();
renderStats();
