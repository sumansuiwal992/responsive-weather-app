// ⚠️ STEP 1: Apni API key yaha paste karo (OpenWeatherMap se free milegi)
const API_KEY = "YOUR_API_KEY_HERE";

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const statusText = document.getElementById('statusText');
const weatherCard = document.getElementById('weatherCard');
const recentCitiesEl = document.getElementById('recentCities');
const recentLabel = document.getElementById('recentLabel');
const themeToggle = document.getElementById('themeToggle');

let recentCities = [];
let isDark = true;

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  const root = document.documentElement.style;

  if (isDark) {
    root.setProperty('--bg-page-1', '#0f1729');
    root.setProperty('--bg-page-2', '#1a2138');
    root.setProperty('--bg-card', '#171f35');
    root.setProperty('--bg-panel', '#202b45');
    root.setProperty('--text-main', '#eef1f8');
    root.setProperty('--text-muted', '#8d96af');
    themeToggle.textContent = '☀️ Light';
  } else {
    root.setProperty('--bg-page-1', '#eef1f8');
    root.setProperty('--bg-page-2', '#dde3f0');
    root.setProperty('--bg-card', '#ffffff');
    root.setProperty('--bg-panel', '#f3f5fb');
    root.setProperty('--text-main', '#1c2536');
    root.setProperty('--text-muted', '#6b7686');
    themeToggle.textContent = '🌙 Dark';
  }
});

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherByCity(city);
  }
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showStatus("Geolocation is not supported by your browser.", true);
    return;
  }
  showStatus("Fetching your location...", false);
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeatherByCoords(lat, lon);
    },
    () => {
      showStatus("Unable to retrieve your location.", true);
    }
  );
});

async function fetchWeatherByCity(city) {
  showStatus("Loading weather data...", false);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod != 200) {
      showStatus("City not found. Please check the spelling.", true);
      return;
    }

    displayWeather(data);
    addToRecent(data.name);
  } catch (error) {
    showStatus("Something went wrong. Please try again.", true);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod != 200) {
      showStatus("Could not fetch weather for your location.", true);
      return;
    }

    displayWeather(data);
    addToRecent(data.name);
  } catch (error) {
    showStatus("Something went wrong. Please try again.", true);
  }
}

function displayWeather(data) {
  statusText.classList.add('hidden');
  weatherCard.classList.add('show');

  document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('condition').textContent = data.weather[0].description;
  document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('feelsLike').textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
  document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  document.getElementById('minMax').textContent = `${Math.round(data.main.temp_min)}° / ${Math.round(data.main.temp_max)}°`;

  document.getElementById('weatherIcon').textContent = getWeatherEmoji(data.weather[0].main);
}

function getWeatherEmoji(condition) {
  const map = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Fog: "🌫️",
    Haze: "🌫️"
  };
  return map[condition] || "🌈";
}

function showStatus(message, isError) {
  statusText.textContent = message;
  statusText.classList.remove('hidden');
  statusText.classList.toggle('error', isError);
  weatherCard.classList.remove('show');
}

function addToRecent(cityName) {
  if (!recentCities.includes(cityName)) {
    recentCities.unshift(cityName);
    if (recentCities.length > 5) recentCities.pop();
    renderRecentCities();
  }
}

function renderRecentCities() {
  recentLabel.textContent = recentCities.length > 0 ? "Recent Searches" : "";
  recentCitiesEl.innerHTML = "";
  recentCities.forEach((city) => {
    const chip = document.createElement('div');
    chip.classList.add('recent-chip');
    chip.textContent = city;
    chip.addEventListener('click', () => fetchWeatherByCity(city));
    recentCitiesEl.appendChild(chip);
  });
}