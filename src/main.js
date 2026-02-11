import {
  saveToLocalStorage,
  getFromLocalStorage,
  loadPartial
} from "./js/utils.mjs";

function renderHabits(habits) {
  const list = document.querySelector("#habits-list");
  list.innerHTML = "";

  if (habits.length === 0) {
    list.innerHTML = "<li>No habits added yet</li>";
    return;
  }

  habits.forEach((habit) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed;

    const span = document.createElement("span");
    span.textContent = habit.name;

    if (habit.completed) {
      span.classList.add("completed");
    }

    checkbox.addEventListener("change", () => {
      habit.completed = checkbox.checked;
      saveToLocalStorage("habits", habits);
      renderHabits(habits);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    list.appendChild(li);
  });
}

// QUOTABLE API
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

// WORLD TIME API
async function fetchWorldTime() {
  try {
    const response = await fetch("https://worldtimeapi.org/api/ip");

    if (!response.ok) {
      throw new Error("WorldTime API failed");
    }

    const data = await response.json();
    return data.datetime;
  } catch (error) {
    console.error("WorldTime API error:", error);
    showError("Unable to fetch current time. Using local time.");
    return new Date().toISOString();
  }
}

// RESET DAILY 
function resetHabitsDaily(dateISO) {
  const today = new Date(dateISO).toDateString();
  const lastReset = localStorage.getItem("lastResetDate");

  if (lastReset !== today) {
    const habits = getFromLocalStorage("habits") || [];

    habits.forEach((habit) => {
      habit.completed = false;
    });

    saveToLocalStorage("habits", habits);
    localStorage.setItem("lastResetDate", today);
  }
}

// DISPLAY DATE 
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

// DISPLAY QUOTE
async function displayQuote() {
  const quoteText = await fetchQuote();
  const quoteSection = document.querySelector("#quote p");
  if (quoteSection) {
    quoteSection.textContent = quoteText;
  }
}

function showError(message) {
  let errorContainer = document.querySelector("#api-error");

  if (!errorContainer) {
    errorContainer = document.createElement("div");
    errorContainer.id = "api-error";
    errorContainer.style.color = "red";
    errorContainer.style.margin = "10px 0";

    const header = document.querySelector("header");
    if (header) {
      header.appendChild(errorContainer);
    }
  }

  errorContainer.textContent = message;
}





// INIT
async function init() {
  await loadPartial("#form-container", "/partials/add-habit.html");

  await displayQuote();

  // 🔥 Solo una llamada a WorldTimeAPI
  const dateISO = await fetchWorldTime();

  displayCurrentDate(dateISO);
  resetHabitsDaily(dateISO);

  const form = document.querySelector("#habit-form");
  const input = document.querySelector("#habit-name");

  const habits = getFromLocalStorage("habits") || [];
  renderHabits(habits);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const habitName = input.value.trim();
      if (!habitName) return;

      habits.push({
        name: habitName,
        completed: false
      });

      saveToLocalStorage("habits", habits);
      renderHabits(habits);

      input.value = "";
    });
  }
}

init();
