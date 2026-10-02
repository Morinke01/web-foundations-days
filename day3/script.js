let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

const categories = ["personal", "work", "study"];

function searchNotes(word) {
  const searchTerm = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(searchTerm));
}

function longestNote() {
  if (notes.length === 0) return null;

  return notes.reduce((longest, note) =>
    note.text.length > longest.text.length ? note : longest,
  );
}

function countByCategory() {
  const counts = {};

  for (const note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }

  return counts;
}

function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const categorySummary = categories
    .map((category) => `${counts[category] || 0} ${category}`)
    .join(", ");
  const noun = total === 1 ? "note" : "notes";

  return `${total} ${noun}: ${categorySummary}.`;
}

function isDuplicate(text) {
  const normalizedText = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === normalizedText);
}

function addNote(text, category) {
  if (typeof text !== "string" || text.trim().length < 1 || text.trim().length > 200) {
    console.log("❌ Note rejected: text must be 1–200 characters.");
    return false;
  }

  if (isDuplicate(text)) {
    console.log("❌ Note rejected: a note with that text already exists.");
    return false;
  }

  if (!categories.includes(category)) {
    console.log("❌ Note rejected: category must be personal, work or study.");
    return false;
  }

  const nextId = notes.reduce((maxId, note) => Math.max(maxId, note.id), 0) + 1;
  notes.push({ id: nextId, text: text.trim(), category });
  console.log(`✅ Added ${category} note: "${text.trim()}"`);
  return true;
}

// searchNotes: normal case (one match); edge case (empty result).
console.log("Search 'day':", searchNotes("day")); // [note 2]
console.log("Search 'holiday':", searchNotes("holiday")); // []

// longestNote: normal case; edge case with no notes.
console.log("Longest note:", longestNote()); // note 3, "Email the project report to Grace"
const savedNotes = notes;
notes = [];
console.log("Longest note when empty:", longestNote()); // null
notes = savedNotes;

// countByCategory: populated list; edge case with no notes.
console.log("Counts:", countByCategory()); // { personal: 2, study: 2, work: 1 }
notes = [];
console.log("Counts when empty:", countByCategory()); // {}
notes = savedNotes;

// getSummary: plural case; singular case using a one-note list.
console.log("Summary:", getSummary()); // "5 notes: 2 personal, 1 work, 2 study."
notes = [savedNotes[4]];
console.log("One-note summary:", getSummary()); // "1 note: 1 personal, 0 work, 0 study."
notes = savedNotes;

// isDuplicate: case/space-insensitive match; no match.
console.log("Duplicate check:", isDuplicate("  BUY MILK AND BREAD  ")); // true
console.log("New text check:", isDuplicate("Water the plants")); // false

// addNote: valid note; edge cases for empty text, duplicate text and category.
console.log("Add valid note result:", addNote("Water the plants", "personal")); // true
console.log("Add blank note result:", addNote("   ", "personal")); // false
console.log("Add overlong note result:", addNote("x".repeat(201), "study")); // false
console.log("Add duplicate result:", addNote(" water THE plants ", "work")); // false
console.log("Add invalid category result:", addNote("Prepare slides", "urgent")); // false
console.log("Final notes:", notes); // 6 notes; newly added note has id 6
