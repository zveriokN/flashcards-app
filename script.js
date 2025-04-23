
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxo3ndoMSpz1pCg--2q2yoYGyZU85EIEIKBtX9gpYejA10jtEJK0rOO38QIwHX7efUj3A9tEVyU6fd/pub?output=csv';

let words = [];
let currentTopic = "all";

fetch(sheetUrl)
  .then(response => response.text())
  .then(data => {
    const rows = data.split("\n").slice(1);
    words = rows.map(row => {
      const [native, foreign, topic] = row.split(",");
      return { native, foreign, topic };
    }).filter(word => word.native && word.foreign);

    populateTopics();
    renderCards();
  });

function populateTopics() {
  const topics = new Set(words.map(word => word.topic.trim()));
  const select = document.getElementById("topicSelect");

  topics.forEach(topic => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    select.appendChild(option);
  });

  select.addEventListener("change", (e) => {
    currentTopic = e.target.value;
    renderCards();
  });
}

function renderCards() {
  const container = document.getElementById("cardsContainer");
  container.innerHTML = "";

  const filtered = currentTopic === "all"
    ? words
    : words.filter(word => word.topic.trim() === currentTopic);

  filtered.forEach(word => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = word.native;
    card.addEventListener("click", () => {
      card.textContent = card.textContent === word.native ? word.foreign : word.native;
    });
    container.appendChild(card);
  });
}
