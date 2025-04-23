
let cards = [];
let currentCardIndex = 0;
let showTranslation = false;
let fromLang = 'русский';
let toLang = 'английский';

async function loadCards() {
  const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSxo3ndoMSpz1pCg--2q2yoYGyZU85EIEIKBtX9gpYejA10jtEJK0rOO38QIwHX7efUj3A9tEVyU6fd/pub?output=csv');
  const data = await response.text();
  const rows = data.trim().split('\n').slice(1);
  
  cards = rows.map(row => {
    const [ru, en, topic] = row.split(',');
    return { 'русский': ru.trim(), 'английский': en.trim(), topic: topic?.trim() };
  });

  showCard();
}

function showCard() {
  const card = cards[currentCardIndex];
  const text = showTranslation ? card[toLang] : card[fromLang];
  document.getElementById('card').textContent = text;
}

document.getElementById('card').addEventListener('click', () => {
  showTranslation = !showTranslation;
  showCard();
});

document.getElementById('next').addEventListener('click', () => {
  currentCardIndex = (currentCardIndex + 1) % cards.length;
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

loadCards();
