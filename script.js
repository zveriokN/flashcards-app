
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSxo3ndoMSpz1pCg--2q2yoYGyZU85EIEIKBtX9gpYejA10jtEJK0rOO38QIwHX7efUj3A9tEVyU6fd/pub?output=csv";

let cards = [];
let filteredCards = [];
let currentCard = null;
let progress = {};
let flipped = false;
let language = "ru-en";
let topic = "all";

document.getElementById("language-select").addEventListener("change", (e) => {
  language = e.target.value;
  renderCard();
});
document.getElementById("topic-select").addEventListener("change", (e) => {
  topic = e.target.value;
  updateFilteredCards();
  renderCard();
});
document.getElementById("card").addEventListener("click", () => {
  if (!currentCard) return;
  flipped = !flipped;
  showCard();
});
document.getElementById("next").addEventListener("click", () => {
  renderCard();
});
document.getElementById("easy").addEventListener("click", () => {
  if (!currentCard) return;
  progress[currentCard.id] = Math.min((progress[currentCard.id] || 0) + 1, 5);
  renderCard();
});
document.getElementById("hard").addEventListener("click", () => {
  if (!currentCard) return;
  progress[currentCard.id] = Math.max((progress[currentCard.id] || 0) - 1, 0);
  renderCard();
});
document.getElementById("reset").addEventListener("click", () => {
  for (const card of filteredCards) {
    delete progress[card.id];
  }
  renderCard();
});

function updateFilteredCards() {
  filteredCards = cards.filter((card) => topic === "all" || card.topic === topic);
}

function renderCard() {
  if (filteredCards.length === 0) return;
  const weights = filteredCards.map(card => {
    const score = progress[card.id] || 0;
    return score >= 4 ? 0.2 : 1.0;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  let index = 0;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      index = i;
      break;
    }
  }

  currentCard = filteredCards[index];
  flipped = false;
  showCard();
  updateProgress();
}

function showCard() {
  const card = document.getElementById("card");
  if (!currentCard) return;
  const score = progress[currentCard.id] || 0;
  card.style.borderColor = score >= 4 ? "#4CAF50" : "#ccc";

  if (language === "ru-en") {
    card.textContent = flipped ? currentCard.en : currentCard.ru;
  } else {
    card.textContent = flipped ? currentCard.ru : currentCard.en;
  }
}

function updateProgress() {
  const learned = Object.values(progress).filter(score => score >= 4).length;
  const percent = Math.round((learned / cards.length) * 100);
  document.getElementById("progress-bar").style.width = percent + "%";
  document.getElementById("progress-text").textContent = `Выучено: ${learned} из ${cards.length} (${percent}%)`;
}

function loadCSV(url) {
  fetch(url)
    .then((response) => response.text())
    .then((csv) => {
      const lines = csv.trim().split("\n");
      cards = lines.slice(1).map((line, index) => {
        const [ru, en, topic] = line.split(",");
        return { id: index, ru, en, topic: topic || "Без темы" };
      });
      const topics = [...new Set(cards.map((c) => c.topic))];
      const select = document.getElementById("topic-select");
      topics.forEach((t) => {
        const option = document.createElement("option");
        option.value = t;
        option.textContent = t;
        select.appendChild(option);
      });
      updateFilteredCards();
      renderCard();
    });
}

loadCSV(sheetUrl);
