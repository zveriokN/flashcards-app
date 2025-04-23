
let allCards = [];
let filteredCards = [];
let currentCardIndex = 0;
let showTranslation = false;
let fromLang = 'русский';
let toLang = 'английский';

async function loadCards() {
  const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSxo3ndoMSpz1pCg--2q2yoYGyZU85EIEIKBtX9gpYejA10jtEJK0rOO38QIwHX7efUj3A9tEVyU6fd/pub?output=csv');
  const data = await response.text();
  const rows = data.trim().split('\n').slice(1);

  allCards = rows.map(row => {
    const [ru, en, topic] = row.split(',');
    return { 'русский': ru.trim(), 'английский': en.trim(), topic: topic?.trim() || 'Без темы' };
  });

  updateTopicOptions();
  applyFilters();
}

function updateTopicOptions() {
  const topicSelect = document.getElementById('topic-select');
  const topics = [...new Set(allCards.map(card => card.topic))];
  topics.sort();

  topicSelect.innerHTML = '<option value="all">Все темы</option>';
  topics.forEach(topic => {
    const option = document.createElement('option');
    option.value = topic;
    option.textContent = topic;
    topicSelect.appendChild(option);
  });
}

function applyFilters() {
  const selectedTopic = document.getElementById('topic-select').value;
  filteredCards = selectedTopic === 'all'
    ? allCards
    : allCards.filter(card => card.topic === selectedTopic);

  currentCardIndex = 0;
  showTranslation = false;
  showCard();
}

function showCard() {
  if (filteredCards.length === 0) {
    document.getElementById('card').textContent = 'Нет карточек';
    return;
  }
  const card = filteredCards[currentCardIndex];
  const text = showTranslation ? card[toLang] : card[fromLang];
  document.getElementById('card').textContent = text;
}

document.getElementById('card').addEventListener('click', () => {
  showTranslation = !showTranslation;
  showCard();
});

document.getElementById('next').addEventListener('click', () => {
  if (filteredCards.length === 0) return;
  currentCardIndex = (currentCardIndex + 1) % filteredCards.length;
  showTranslation = false;
  showCard();
});

document.getElementById('language-select').addEventListener('change', (e) => {
  const value = e.target.value;
  if (value === 'ru-en') {
    fromLang = 'русский';
    toLang = 'английский';
  } else {
    fromLang = 'английский';
    toLang = 'русский';
  }
  showTranslation = false;
  showCard();
});

document.getElementById('topic-select').addEventListener('change', () => {
  applyFilters();
});

loadCards();
