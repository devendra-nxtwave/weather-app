// ── Theme (Milestone 1) ──
const THEME_KEY = 'weather-app-theme';
const LAST_CITY_KEY = 'weather-app-last-city';
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

// ── DOM references ──
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearCityBtn = document.getElementById('clearCityBtn');
const errorBanner = document.getElementById('errorBanner');
const loadingSpinner = document.getElementById('loadingSpinner');

const weatherCard = document.getElementById('weatherCard');
const weatherCity = document.getElementById('weatherCity');
const weatherDate = document.getElementById('weatherDate');
const weatherTemp = document.getElementById('weatherTemp');
const weatherTempValue = document.getElementById('weatherTempValue');
const weatherUnit = document.getElementById('weatherUnit');
const weatherIcon = document.getElementById('weatherIcon');
const weatherCondition = document.getElementById('weatherCondition');
const weatherHumidity = document.getElementById('weatherHumidity');
const weatherWind = document.getElementById('weatherWind');
const weatherPressure = document.getElementById('weatherPressure');

const forecastStrip = document.getElementById('forecastStrip');
const insightsPanel = document.getElementById('insightsPanel');
const insightsList = document.getElementById('insightsList');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

function getWeatherInfo(code) {
  if (code === 0) return { label: 'Clear', icon: '☀️' };
  if (code === 1) return { label: 'Mainly Clear', icon: '🌤️' };
  if (code === 2) return { label: 'Partly Cloudy', icon: '⛅' };
  if (code === 3) return { label: 'Overcast', icon: '☁️' };
  if (code >= 45 && code <= 48) return { label: 'Foggy', icon: '🌫️' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: '🌦️' };
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: '❄️' };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', icon: '🌧️' };
  if (code >= 85 && code <= 86) return { label: 'Snow Showers', icon: '🌨️' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', icon: '⛈️' };
  return { label: 'Unknown', icon: '🌡️' };
}

function getTempAccentClass(temp) {
  if (temp < 10) return 'weather-card__temp--cold';
  if (temp <= 25) return 'weather-card__temp--mild';
  return 'weather-card__temp--warm';
}

function formatCurrentDate(timezone) {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  });
}

function formatDayLabel(dateStr, index, timezone) {
  if (index === 0) return 'TODAY';
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: timezone,
  }).toUpperCase();
}

function formatHour(timeStr, timezone) {
  return new Date(timeStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  });
}

function getTodayHourlyEntries(weather, count = 6) {
  const today = weather.daily.time[0];
  const { hourly } = weather;
  const currentHour = parseInt(weather.current.time.split('T')[1].split(':')[0], 10);
  const entries = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const time = hourly.time[i];
    if (!time.startsWith(today)) continue;

    const hour = parseInt(time.split('T')[1].split(':')[0], 10);
    if (hour < currentHour) continue;

    entries.push({
      time,
      temp: hourly.temperature_2m[i],
      code: hourly.weather_code[i],
    });

    if (entries.length === count) break;
  }

  return entries;
}

function renderWeatherCard(location, weather) {
  const current = weather.current;
  const units = weather.current_units;
  const temp = Math.round(current.temperature_2m);
  const { label, icon } = getWeatherInfo(current.weather_code);

  weatherCity.textContent = `${location.name}, ${location.country}`;
  weatherDate.textContent = formatCurrentDate(weather.timezone);

  weatherTemp.classList.remove(
    'weather-card__temp--cold',
    'weather-card__temp--mild',
    'weather-card__temp--warm'
  );
  weatherTemp.classList.add(getTempAccentClass(temp));

  weatherTempValue.textContent = temp;
  weatherUnit.textContent = units.temperature_2m;
  weatherIcon.textContent = icon;
  weatherCondition.textContent = label;

  weatherHumidity.textContent = `${current.relative_humidity_2m}${units.relative_humidity_2m}`;
  weatherWind.textContent = `${current.wind_speed_10m} ${units.wind_speed_10m}`;
  weatherPressure.textContent = `${Math.round(current.surface_pressure)} ${units.surface_pressure}`;

  weatherCard.classList.remove('hidden');
}

function renderForecastStrip(weather) {
  const { daily } = weather;
  const timezone = weather.timezone;

  forecastStrip.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const code = daily.weather_code[i];
    const { icon } = getWeatherInfo(code);
    const high = Math.round(daily.temperature_2m_max[i]);
    const low = Math.round(daily.temperature_2m_min[i]);
    const dayLabel = formatDayLabel(daily.time[i], i, timezone);

    const card = document.createElement('div');
    card.className = i === 0 ? 'forecast-card forecast-card--today' : 'forecast-card';

    card.innerHTML = `
      <span class="forecast-card__day">${dayLabel}</span>
      <span class="forecast-card__icon">${icon}</span>
      <span class="forecast-card__temps">
        <span class="forecast-card__high">${high}°</span>
        <span class="forecast-card__low"> / ${low}°</span>
      </span>
    `;

    forecastStrip.appendChild(card);
  }

  forecastStrip.classList.remove('hidden');
}

function renderInsightsPanel(weather) {
  const timezone = weather.timezone;
  const unit = weather.hourly_units.temperature_2m;
  const entries = getTodayHourlyEntries(weather, 6);

  insightsList.innerHTML = '';

  entries.forEach((entry) => {
    const { label } = getWeatherInfo(entry.code);

    const li = document.createElement('li');
    li.className = 'insights-row';
    li.innerHTML = `
      <span class="insights-row__time">${formatHour(entry.time, timezone)}</span>
      <span class="insights-row__condition">${label}</span>
      <span class="insights-row__temp">${entry.temp.toFixed(1)}${unit}</span>
    `;

    insightsList.appendChild(li);
  });

  insightsPanel.classList.remove('hidden');
}

function saveLastCity(cityName) {
  localStorage.setItem(LAST_CITY_KEY, cityName);
}

function getLastCity() {
  return localStorage.getItem(LAST_CITY_KEY);
}

function clearLastCity() {
  localStorage.removeItem(LAST_CITY_KEY);
}

function showClearButton() {
  clearCityBtn.classList.remove('hidden');
}

function hideClearButton() {
  clearCityBtn.classList.add('hidden');
}

function resetApp() {
  clearLastCity();
  hideError();
  searchInput.value = '';
  hideClearButton();

  weatherCard.classList.add('hidden');
  forecastStrip.classList.add('hidden');
  insightsPanel.classList.add('hidden');

  forecastStrip.innerHTML = '';
  insightsList.innerHTML = '';
}

function showLoading() {
  loadingSpinner.classList.remove('hidden');
  searchInput.disabled = true;
  searchBtn.disabled = true;
  clearCityBtn.disabled = true;
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
  searchInput.disabled = false;
  searchBtn.disabled = false;
  clearCityBtn.disabled = false;
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

  return data.results[0];
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

async function loadWeather(cityName) {
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

    renderWeatherCard(location, weather);
    renderForecastStrip(weather);
    renderInsightsPanel(weather);

    saveLastCity(trimmed);
    searchInput.value = trimmed;
    showClearButton();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

async function handleSearch(cityName) {
  await loadWeather(cityName);
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  handleSearch(searchInput.value);
});

clearCityBtn.addEventListener('click', () => {
  resetApp();
});

function initApp() {
  const lastCity = getLastCity();
  if (lastCity) {
    loadWeather(lastCity);
  }
}

initApp();