// ── Theme (keep your existing code) ──
const THEME_KEY = 'weather-app-theme';
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved === 'dark' || saved === 'light' ? saved : 'light';
  applyTheme(theme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

initTheme();

// ── Search & API (Milestone 2) ──
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const errorBanner = document.getElementById('errorBanner');
const loadingSpinner = document.getElementById('loadingSpinner');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

function showLoading() {
  loadingSpinner.classList.remove('hidden');
  searchInput.disabled = true;
  searchBtn.disabled = true;
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
  searchInput.disabled = false;
  searchBtn.disabled = false;
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.remove('hidden');
}

function hideError() {
  errorBanner.textContent = '';
  errorBanner.classList.add('hidden');
}

async function geocodeCity(cityName) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Network error. Please check your connection and try again.');
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${cityName}" not found. Please try another name.`);
  }

  return data.results[0]; // { name, country, latitude, longitude, ... }
}

async function fetchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure',
    hourly: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
  });

  const url = `${FORECAST_URL}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch weather data. Please try again.');
  }

  return response.json();
}

async function handleSearch(cityName) {
  const trimmed = cityName.trim();
  if (!trimmed) {
    showError('Please enter a city name.');
    return;
  }

  hideError();
  showLoading();

  try {
    const location = await geocodeCity(trimmed);
    const weather = await fetchWeather(location.latitude, location.longitude);

    // M2 deliverable: log the data (UI update comes in M3/M4)
    console.log('Location:', location);
    console.log('Weather:', weather);

  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handleSearch(searchInput.value);
});