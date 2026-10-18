const USERS_URL = "https://jsonplaceholder.typicode.com/users";

const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];

function renderUsers(userList) {
  usersList.replaceChildren();

  userList.forEach((user) => {
    const item = document.createElement("li");
    const name = document.createElement("h2");
    const email = document.createElement("p");
    const city = document.createElement("p");
    const company = document.createElement("p");

    name.textContent = user.name;
    email.textContent = `Email: ${user.email}`;
    city.textContent = `City: ${user.address.city}`;
    company.textContent = `Company: ${user.company.name}`;

    item.append(name, email, city, company);
    usersList.appendChild(item);
  });
}

async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadButton.disabled = true;

  try {
    const response = await fetch(USERS_URL);
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    users = await response.json();
    const query = filterInput.value.trim().toLowerCase();
    const matchingUsers = users.filter((user) =>
      user.name.toLowerCase().includes(query),
    );
    renderUsers(matchingUsers);
    statusText.textContent = `Loaded ${users.length} users.`;
  } catch (error) {
    users = [];
    renderUsers([]);
    statusText.textContent = "Could not load users. Please try again.";
    console.error("Could not load users:", error);
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  const query = filterInput.value.trim().toLowerCase();
  const matchingUsers = users.filter((user) =>
    user.name.toLowerCase().includes(query),
  );

  renderUsers(matchingUsers);
  if (users.length > 0 && matchingUsers.length === 0) {
    statusText.textContent = "No users match your filter.";
  } else if (users.length > 0) {
    statusText.textContent = `Showing ${matchingUsers.length} of ${users.length} users.`;
  }
});
