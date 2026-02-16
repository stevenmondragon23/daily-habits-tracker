const defaultPreferences = {
  themeColor: "green",
  fontSize: "medium",
  showDailyQuote: true
};


/* =========================
   LOAD
========================= */
export function loadPreferences() {
  return JSON.parse(localStorage.getItem("preferences")) || defaultPreferences;
}


/* =========================
   SAVE
========================= */
function savePreferences(prefs) {
  localStorage.setItem("preferences", JSON.stringify(prefs));
}


/* =========================
   APPLY
========================= */
export function applyPreferences(prefs) {

  // THEME
  document.body.classList.remove("green", "blue", "dark");
  document.body.classList.add(prefs.themeColor);

  // FONT SIZE
  document.body.classList.remove("small", "medium", "large");
  document.body.classList.add(prefs.fontSize);

  // QUOTE VISIBILITY
  const quoteSection = document.querySelector("#quote");
  if (quoteSection) {
    quoteSection.style.display = prefs.showDailyQuote ? "block" : "none";
  }
}


/* =========================
   INIT UI
========================= */
export function initSettingsUI() {

  const modal = document.querySelector("#settingsModal");
  const openBtn = document.querySelector("#openSettings");
  const closeBtn = document.querySelector("#closeSettings");

  if (!modal || !openBtn || !closeBtn) return;

  const prefs = loadPreferences();

  // SET INITIAL VALUES
  document.querySelector("#themeColor").value = prefs.themeColor;
  document.querySelector("#fontSize").value = prefs.fontSize;
  document.querySelector("#showDailyQuote").checked = prefs.showDailyQuote;

  openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  const inputs = modal.querySelectorAll("input, select");

  inputs.forEach(input => {
    input.addEventListener("change", (e) => {

      const value =
        input.type === "checkbox"
          ? e.target.checked
          : e.target.value;

      prefs[input.name] = value;

      savePreferences(prefs);
      applyPreferences(prefs);
    });
  });
}
