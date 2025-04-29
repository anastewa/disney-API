const apiURL = 'https://api.disneyapi.dev/character'; // ссылка на api
const listContainer = document.getElementById('characterList'); // контейнер для карточек персонажей
const searchInput = document.getElementById('searchInput'); // поле ввода для поиска
const searchBtn = document.getElementById('searchBtn'); // кнопка поиска
const randomBtn = document.getElementById('randomBtn'); // кнопка рандома
const prevPageBtn = document.getElementById('prevPage'); // кнопка "назад"
const nextPageBtn = document.getElementById('nextPage'); // кнопка "вперёд"
const pageNum = document.getElementById('pageNum'); // отображение номера страницы
const categories = document.getElementById('categories'); // список категорий

let currentPage = 1; // текущая страница

// список имён официальных принцесс
const princesses = [ "Rapunzel", "Cinderella", "Aurora", "Ariel", "Belle", "Jasmine", "Pocahontas", "Mulan", "Tiana", "Rapunzel", "Merida", "Moana", "Raya"];

// список моих любимчиков
const favorites = ['Ariel', 'Rapunzel', 'Adonis', 'Rapunzel', 'Baymax'];

// функция для отображения карточек персонажей
function renderCharacters(characters) {
  listContainer.innerHTML = ''; // очищаем список
  characters.forEach(c => {
    const card = document.createElement('div'); // создаём div-карточку
    card.className = 'character-card';
    card.innerHTML = `
      <img src="${c.imageUrl}" alt="${c.name}">
      <h4>${c.name}</h4>
    `;
    listContainer.appendChild(card); // добавляем карточку в контейнер
  });
}

// загрузка персонажей по страницам
async function fetchCharacters(page = 1) {
  const res = await fetch(`${apiURL}?page=${page}&pageSize=9`);
  const data = await res.json();
  renderCharacters(data.data); // отрисовываем полученных персонажей
  pageNum.textContent = page; // обновляем номер страницы
}

// поиск персонажа по имени
async function searchCharacter(name) {
  const res = await fetch(`${apiURL}?name=${name}`);
  const data = await res.json();

  if (data.data.length === 0) {
    showMessage('Персонажи не найдены'); // если нет результатов
  } else {
    renderCharacters(data.data); // если есть результаты
  }
}

// получение рандомного персонажа 
async function getRandomCharacter() {
  const allCharacters = await fetchAllCharacters(); // загрузить всех персонажей
  const randomIndex = Math.floor(Math.random() * allCharacters.length); // выбрать случайный индекс
  const randomCharacter = allCharacters[randomIndex]; // взять случайного персонажа
  renderCharacters([randomCharacter]); // показать его
}

// загрузить всех персонажей одной страницей для  фильтрации
async function fetchAllCharacters() {
  const res = await fetch(`${apiURL}?pageSize=500`); // загрузим много сразу
  const data = await res.json();
  return data.data; // вернём массив персонажей
}

// фильтрация по выбранной категории
async function filterByCategory(category) {
  const allCharacters = await fetchAllCharacters(); // загружаем всех один раз

  let filtered = [];

  if (category === 'princesses') {
    filtered = allCharacters.filter(c => princesses.includes(c.name));
  } else if (category === 'animals') {
    filtered = allCharacters.filter(c => 
      c.films.some(film => 
        film.includes('The Lion King') || 
        film.includes('Bambi') || 
        film.includes('Dumbo')
      ) && 
      !['Belle', 'Aladdin', 'Fiona Ashbury'].includes(c.name) // исключаем Бэль и Алладина
    );
  } else if (category === 'magic') {
    filtered = allCharacters.filter(c => c.sourceUrl && 
      (c.sourceUrl.includes('Merlin') || c.sourceUrl.includes('Fairy') || c.sourceUrl.includes('Sorcerer'))
    );
  } else if (category === 'fav') { // избранные
    filtered = allCharacters.filter(c => favorites.includes(c.name));
  }

  // Отображаем все отфильтрованные персонажи без пагинации
  renderCharacters(filtered);
}

// функция для отображения сообщений
function showMessage(message) {
  listContainer.innerHTML = `
    <div class="message">${message}</div>
  `;
}

// событие: клик по кнопке поиска
searchBtn.onclick = () => {
  const name = searchInput.value;
  if (name) searchCharacter(name); // запускаем поиск, если что-то введено
};

// событие: клик по кнопке рандома
randomBtn.onclick = getRandomCharacter;

// событие: клик по кнопке "назад"
prevPageBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    fetchCharacters(currentPage);
  }
};

// событие: клик по кнопке "вперёд"
nextPageBtn.onclick = () => {
  currentPage++;
  fetchCharacters(currentPage);
};

// событие: клик по элементам категорий
categories.onclick = (e) => {
  if (e.target.tagName === 'LI') {
    filterByCategory(e.target.dataset.category); // передаем категорию
  }
};

// при загрузке  первую страницу персонажей
fetchCharacters();
