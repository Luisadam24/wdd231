const currentTemp = document.querySelector('#current-temp');
const weatherIcon = document.querySelector('#weather-icon');
const weatherDescription = document.querySelector('#weather-description');
const weatherForm = document.querySelector('#weather-form');
const apiKeyInput = document.querySelector('#api-key');
const weatherStatus = document.querySelector('#weather-status');
const submitButton = weatherForm.querySelector('button[type="submit"]');

const url = 'https://api.openweathermap.org/data/2.5/weather';
const latitude = 49.76;
const longitude = 6.64;
const iconUrl = 'https://openweathermap.org/img/wn/';

async function apiFetch(apiKey) {
    weatherStatus.textContent = 'Loading current conditions…';
    submitButton.disabled = true;

    try {
        const query = new URLSearchParams({
            lat: latitude,
            lon: longitude,
            units: 'imperial',
            appid: apiKey
        });
        const response = await fetch(`${url}?${query}`);

        if (!response.ok) {
            const errorDetails = await response.text();
            const error = new Error(
                `OpenWeatherMap request failed (${response.status}): ${errorDetails || response.statusText}`
            );
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        console.log(data);
        displayResults(data);
        weatherStatus.textContent = 'Current conditions for Trier, Germany loaded.';
    } catch (error) {
        console.error('Unable to load current weather data.', error);

        if (error.status === 401) {
            weatherStatus.textContent = 'OpenWeatherMap did not accept this key. Check it, and allow time for a new key to activate.';
        } else {
            weatherStatus.textContent = 'Weather could not be loaded. Check your connection and API key, then try again.';
        }
    } finally {
        submitButton.disabled = false;
    }
}

function displayResults(data) {
    const firstWeather = data.weather?.[0];

    if (!Number.isFinite(data.main?.temp) || !firstWeather?.description || !firstWeather?.icon) {
        throw new Error('The weather response did not include temperature and condition details.');
    }

    const description = firstWeather.description;
    const readableDescription = description.charAt(0).toUpperCase() + description.slice(1);

    currentTemp.textContent = `${Math.round(data.main.temp)} °F`;
    weatherDescription.textContent = readableDescription;
    weatherIcon.src = `${iconUrl}${firstWeather.icon}@2x.png`;
    weatherIcon.alt = `Weather icon showing ${description}.`;
}

weatherForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const apiKey = apiKeyInput.value.trim();

    if (apiKey) {
        apiFetch(apiKey);
    }
});
