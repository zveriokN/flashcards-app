let allCards = [];
let filteredCards = [];
let currentCardIndex = 0;
let showTranslation = false;
let fromLang = 'русский';
let toLang = 'английский';
let progress = {};

async function loadCards() {
  const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSxo3ndoMSpz1pCg--2q2yoYGyZU85EIEIKBtX9gpYejA10jtEJK0rOO38QIwHX7efUj3A9tEVyU6fd/pub?output=csv');
  const data = await response.text();
  const rows = data.trim().split('\n').slice(1);

  allCards = rows.map(row => {
    const [ru, en, topic] = row.split(',');
    const id = ru.trim() + '-' + en.trim();
    return { 
      id: id,
      'русский': ru.trim(), 
      'английский': en.trim(), 
      topic: topic?.trim() || 'Без темы',
      weight: getWeight(id)
    };
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
    ? [...allCards]
    : allCards.filter(card => card.topic === selectedTopic);

  currentCardIndex = 0;
  showTranslation = false;
  shuffleWeighted(filteredCards);
  showCard();
  updateProgress();
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
  selectNextCard();
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

document.getElementById('easy').addEventListener('click', () => {
  const card = filteredCards[currentCardIndex];
  updateWeight(card.id, 0.5);
  selectNextCard();
});

document.getElementById('hard').addEventListener('click', () => {
  const card = filteredCards[currentCardIndex];
  updateWeight(card.id, 1);
  selectNextCard();
});

function shuffleWeighted(array) {
  array.sort(() => Math.random() - 0.5);
}

function selectNextCard() {
  if (filteredCards.length === 0) return;

  const hardCards = filteredCards.filter(card => card.weight >= 0.5);
  const easyCards = filteredCards.filter(card => card.weight < 0.5);

  let useHard = Math.random() < 0.8; // 80% вероятность выбора трудной карточки

  let pool = useHard && hardCards.length ? hardCards : easyCards.length ? easyCards : filteredCards;
  currentCardIndex = filteredCards.indexOf(pool[Math.floor(Math.random() * pool.length)]);

  showTranslation = false;
  showCard();
}

function getWeight(id) {
  const savedProgress = JSON.parse(localStorage.getItem('progress') || '{}');
  progress = savedProgress;
  return savedProgress[id] ? savedProgress[id] : 1;
}

function updateWeight(id, factor) {
  progress[id] = Math.max((progress[id] || 1) * factor, 0.1);
  localStorage.setItem('progress', JSON.stringify(progress));
  applyFilters();
}

function updateProgress() {
  const total = allCards.length;
  const learned = Object.values(progress).filter(w => w < 0.5).length;
  const percent = total ? (learned / total) * 100 : 0;
  document.getElementById('progress-bar').style.width = percent + '%';
  document.getElementById('progress-text').textContent = `Выучено: ${learned} из ${total}`;
}

loadCards();
