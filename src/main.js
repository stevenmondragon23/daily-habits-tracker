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
    li.textContent = habit.name;
    list.appendChild(li);
  });
}

async function init() {
  await loadPartial("#form-container", "/partials/add-habit.html");

  const form = document.querySelector("#habit-form");
  const input = document.querySelector("#habit-name");

  const habits = getFromLocalStorage("habits") || [];
  renderHabits(habits);

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

init();
