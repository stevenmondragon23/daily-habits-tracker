
// FUNCTIONS FROM UTILS
import { saveToLocalStorage, getFromLocalStorage } from "./js/utils.mjs";

// TESTING
const habits = [
  { name: "Drink water", completed: false },
  { name: "Exercise", completed: true }
];

// SAVE
saveToLocalStorage("habits", habits);

// PRINT
const savedHabits = getFromLocalStorage("habits");
console.log(savedHabits);