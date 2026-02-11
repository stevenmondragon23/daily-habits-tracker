import {
  saveToLocalStorage,
  getFromLocalStorage,
  loadPartial
} from "./js/utils.mjs";

/* =========================
   RENDER HABITS
========================= */
function renderHabits(habits) {
  const list = document.querySelector("#habits-list");
  list.innerHTML = "";

  if (habits.length === 0) {
    list.innerHTML = "<li>No habits added yet</li>";
    updateProgress(habits);
    return;
  }

  habits.forEach((habit, index) => {
    if (habit.streak === undefined) habit.streak = 0;
    if (habit.lastCompletedDate === undefined) habit.lastCompletedDate = null;

    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed;

    const span = document.createElement("span");
    span.textContent = habit.name;

    if (habit.completed) {
      span.classList.add("completed");
    }

    const streakInfo = document.createElement("small");
    streakInfo.textContent = ` 🔥 ${habit.streak} day streak`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", async () => {
      const confirmed = await showConfirmModal(
        `Are you sure you want to delete "${habit.name}"?`
      );

      if (!confirmed) return;

      habits.splice(index, 1);
      saveToLocalStorage("habits", habits);
      saveDailyProgress(habits);
      renderHabits(habits);
    });

    checkbox.addEventListener("change", () => {
      const today = new Date().toDateString();

      if (checkbox.checked) {
        if (habit.lastCompletedDate !== today) {
          habit.streak += 1;
          habit.lastCompletedDate = today;
        }
        habit.completed = true;
      } else {
        habit.completed = false;
      }

      saveToLocalStorage("habits", habits);
      saveDailyProgress(habits);
      renderHabits(habits);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(streakInfo);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });

  updateProgress(habits);
}

/* =========================
   SAVE DAILY PROGRESS
========================= */
function saveDailyProgress(habits) {
  const today = new Date().toDateString();

  const completedCount = habits.filter(h => h.completed).length;
  const percentage = habits.length === 0
    ? 0
    : Math.round((completedCount / habits.length) * 100);

  const progressData = getFromLocalStorage("progressData") || {};
  progressData[today] = percentage;

  saveToLocalStorage("progressData", progressData);
}

/* =========================
   UPDATE PROGRESS UI
========================= */
function updateProgress(habits) {
  const progressElement = document.querySelector("#progress");
  if (!progressElement) return;

  const completedCount = habits.filter(h => h.completed).length;
  const percentage = habits.length === 0
    ? 0
    : Math.round((completedCount / habits.length) * 100);

  progressElement.textContent = `Progress: ${percentage}%`;
}

/* =========================
   QUOTABLE API
========================= */
async function fetchQuote() {
  try {
    const response = await fetch("https://api.quotable.io/random");

    if (!response.ok) {
      throw new Error("Quote API failed");
    }

    const data = await response.json();
    return `${data.content} — ${data.author}`;
  } catch (error) {
    console.error("Quote API error:", error);
    showError("Unable to load motivational quote.");
    return "Stay consistent. Small progress is still progress.";
  }
}

async function displayQuote() {
  const quoteText = await fetchQuote();
  const quoteSection = document.querySelector("#quote p");

  if (quoteSection) {
    quoteSection.textContent = quoteText;
  }
}

/* =========================
   WORLD TIME API
========================= */
async function fetchWorldTime() {
  try {
    const response = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC");

    if (!response.ok) {
      throw new Error("WorldTime API failed");
    }

    const data = await response.json();
    console.log("WorldTime API connected");

    return data.datetime;

  } catch (error) {
    console.warn("WorldTime API failed, using local time.");
    return new Date().toISOString();
  }
}

/* =========================
   DATE CACHE SYSTEM
========================= */
async function getDateWithCache() {
  const todayLocal = new Date().toDateString();
  const storedDate = localStorage.getItem("lastApiDate");

  if (storedDate === todayLocal) {
    console.log("Using cached date");
    return new Date().toISOString();
  }

  const dateISO = await fetchWorldTime();
  localStorage.setItem("lastApiDate", todayLocal);

  return dateISO;
}

/* =========================
   RESET DAILY
========================= */
function resetHabitsDaily(dateISO) {
  const today = new Date(dateISO).toDateString();
  const lastReset = localStorage.getItem("lastResetDate");

  if (lastReset !== today) {
    const habits = getFromLocalStorage("habits") || [];

    habits.forEach(habit => {
      habit.completed = false;
    });

    saveToLocalStorage("habits", habits);
    saveDailyProgress(habits);
    localStorage.setItem("lastResetDate", today);
  }
}

/* =========================
   DISPLAY DATE
========================= */
function displayCurrentDate(dateISO) {
  const date = new Date(dateISO);

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const dateElement = document.querySelector("#current-date");
  if (dateElement) {
    dateElement.textContent = formattedDate;
  }
}

/* =========================
   CONFIRM MODAL
========================= */
function showConfirmModal(message) {
  return new Promise((resolve) => {
    const modal = document.querySelector("#confirm-modal");

    if (!modal) {
      resolve(confirm(message));
      return;
    }

    const text = document.querySelector("#confirm-text");
    const yesBtn = document.querySelector("#confirm-yes");
    const noBtn = document.querySelector("#confirm-no");

    text.textContent = message;
    modal.classList.remove("hidden");

    const cleanup = () => {
      modal.classList.add("hidden");
      yesBtn.onclick = null;
      noBtn.onclick = null;
    };

    yesBtn.onclick = () => {
      cleanup();
      resolve(true);
    };

    noBtn.onclick = () => {
      cleanup();
      resolve(false);
    };
  });
}

/* =========================
   ERROR HANDLER
========================= */
function showError(message) {
  let errorContainer = document.querySelector("#api-error");

  if (!errorContainer) {
    errorContainer = document.createElement("div");
    errorContainer.id = "api-error";
    errorContainer.classList.add("error-message");

    const header = document.querySelector("header");
    if (header) {
      header.appendChild(errorContainer);
    }
  }

  errorContainer.textContent = message;

  setTimeout(() => {
    errorContainer.textContent = "";
  }, 4000);
}

/* =========================
   INIT
========================= */
async function init() {
  await loadPartial("#form-container", "/partials/add-habit.html");

  await displayQuote();

  const dateISO = await getDateWithCache();

  displayCurrentDate(dateISO);
  resetHabitsDaily(dateISO);

  const habits = getFromLocalStorage("habits") || [];
  renderHabits(habits);

  const form = document.querySelector("#habit-form");
  const input = document.querySelector("#habit-name");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const habitName = input.value.trim();
      if (!habitName) return;

      habits.push({
        name: habitName,
        completed: false,
        streak: 0,
        lastCompletedDate: null
      });

      saveToLocalStorage("habits", habits);
      saveDailyProgress(habits);
      renderHabits(habits);

      input.value = "";
    });
  }
}

init();
