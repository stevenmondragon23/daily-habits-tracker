// Save localStorage
export function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Get localStorage
export function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export async function loadPartial(selector, partialPath) {
  const response = await fetch(partialPath);
  const html = await response.text();
  document.querySelector(selector).innerHTML = html;
}