// ---------- 1. Select the elements we need ----------
const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearButton = document.querySelector("#clear-btn");
const themeButton = document.querySelector("#theme-toggle");

const DRAFT_KEY = "quicknotes-day4-draft";
const THEME_KEY = "quicknotes-day4-theme";

// ---------- 2. Update the character and word counts ----------
function updateCounts() {
  const text = noteText.value;
  const characters = text.length;
  const trimmedText = text.trim();
  const words = trimmedText === "" ? 0 : trimmedText.split(/\s+/).length;

  charCount.textContent = `${characters} / 200 characters`;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;

  charCount.classList.toggle("warning", characters > 180);
  charCount.classList.toggle("over", characters > 200);
}

// ---------- 3. Restore the draft and theme ----------
const savedDraft = localStorage.getItem(DRAFT_KEY);
if (savedDraft !== null) {
  noteText.value = savedDraft;
}

function updateThemeButton() {
  themeButton.textContent = document.body.classList.contains("dark")
    ? "Light mode"
    : "Dark mode";
}

if (localStorage.getItem(THEME_KEY) === "dark") {
  document.body.classList.add("dark");
}
updateThemeButton();

// ---------- 4. Save drafts and update counts while typing ----------
noteText.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem(DRAFT_KEY, noteText.value);
});

// ---------- 5. Clear the note and its saved draft ----------
function clearNote() {
  noteText.value = "";
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
}

clearButton.addEventListener("click", clearNote);

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearNote();
  }
});

// ---------- 6. Toggle and remember the color theme ----------
themeButton.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  updateThemeButton();
});

// ---------- 7. Draw the correct counts for the restored draft ----------
updateCounts();
