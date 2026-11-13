const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const currentYear = document.querySelector("#current-year");
const modifiedTime = document.querySelector("#last-modified");
const spotlightGrid = document.querySelector("#spotlights-grid");
const spotlightStatus = document.querySelector("#spotlights-status");
const weatherForm = document.querySelector("#weather-form");
const weatherKeyInput = document.querySelector("#weather-api-key");
const weatherSubmit = weatherForm.querySelector("button[type='submit']");
const weatherResults = document.querySelector("#weather-results");
const currentWeatherIcon = document.querySelector("#current-weather-icon");
const currentTemperature = document.querySelector("#current-temperature");
const currentDescription = document.querySelector("#current-description");
const forecastList = document.querySelector("#forecast-list");
const weatherStatus = document.querySelector("#weather-status");

const currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";
const weatherIconUrl = "https://openweathermap.org/img/wn/";
const harare = { latitude: -17.83, longitude: 31.05 };

currentYear.textContent = new Date().getFullYear();
const modifiedDate = new Date(document.lastModified);
if (!Number.isNaN(modifiedDate.getTime())) {
    modifiedTime.dateTime = modifiedDate.toISOString().slice(0, 10);
    modifiedTime.textContent = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(modifiedDate);
}

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    primaryNavigation.classList.toggle("is-open", !isExpanded);
});

primaryNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a") && window.matchMedia("(max-width: 639px)").matches) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        primaryNavigation.classList.remove("is-open");
    }
});

function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
}

function makeSpotlight(member) {
    const card = document.createElement("article");
    card.className = "spotlight-card";

    const cardHeader = document.createElement("div");
    cardHeader.className = "spotlight-header";

    const logo = document.createElement("img");
    logo.className = "spotlight-logo";
    logo.src = `images/${member.image}`;
    logo.alt = `${member.name} logo`;
    logo.width = 76;
    logo.height = 76;
    logo.loading = "lazy";

    const titleGroup = document.createElement("div");
    titleGroup.className = "spotlight-title-group";
    const category = document.createElement("p");
    category.className = "spotlight-category";
    category.textContent = member.category;
    const name = document.createElement("h3");
    name.textContent = member.name;
    titleGroup.append(category, name);
    cardHeader.append(logo, titleGroup);

    const description = document.createElement("p");
    description.className = "spotlight-description";
    description.textContent = member.description;

    const details = document.createElement("dl");
    details.className = "spotlight-details";
    const websiteHost = new URL(member.website).hostname.replace(/^www\./, "");
    const detailRows = [
        { label: "Phone", value: member.phone, href: `tel:${member.phone.replace(/[^+\d]/g, "")}` },
        { label: "Address", value: member.address },
        { label: "Website", value: websiteHost, href: member.website }
    ];

    detailRows.forEach(({ label, value, href }) => {
        const row = document.createElement("div");
        row.className = "spotlight-detail";
        const term = document.createElement("dt");
        term.textContent = label;
        const descriptionElement = document.createElement("dd");
        if (href) {
            const link = document.createElement("a");
            link.href = href;
            link.textContent = value;
            if (label === "Website") {
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            }
            descriptionElement.append(link);
        } else {
            descriptionElement.textContent = value;
        }
        row.append(term, descriptionElement);
        details.append(row);
    });

    const level = document.createElement("span");
    level.className = "spotlight-level";
    level.dataset.level = String(member.membershipLevel);
    level.textContent = `${member.membershipName} member`;

    card.append(cardHeader, description, details, level);
    return card;
}

async function loadSpotlights() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`Member data returned ${response.status}.`);
        }

        const members = await response.json();
        const eligibleMembers = members.filter((member) => [2, 3].includes(Number(member.membershipLevel)));
        const spotlights = shuffle(eligibleMembers).slice(0, 3);

        if (spotlights.length < 2) {
            throw new Error("At least two Gold or Silver members are needed for the spotlight.");
        }

        spotlightGrid.replaceChildren(...spotlights.map(makeSpotlight));
        spotlightGrid.setAttribute("aria-busy", "false");
        spotlightStatus.textContent = "";
    } catch (error) {
        spotlightGrid.setAttribute("aria-busy", "false");
        spotlightStatus.textContent = "Member spotlights are unavailable right now. Please visit the directory instead.";
        console.error("Unable to load member spotlights:", error);
    }
}

function buildWeatherUrl(endpoint, apiKey) {
    const requestUrl = new URL(endpoint);
    requestUrl.search = new URLSearchParams({
        lat: harare.latitude,
        lon: harare.longitude,
        units: "metric",
        appid: apiKey
    });
    return requestUrl;
}

async function fetchWeatherData(endpoint, apiKey) {
    const response = await fetch(buildWeatherUrl(endpoint, apiKey));
    if (!response.ok) {
        const error = new Error(`OpenWeatherMap returned ${response.status}.`);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

function localDateKey(unixSeconds, timezoneOffset) {
    return new Date((unixSeconds + timezoneOffset) * 1000).toISOString().slice(0, 10);
}

function addDays(dateKey, days) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function formatForecastDay(dateKey) {
    const date = new Date(`${dateKey}T00:00:00Z`);
    return {
        weekday: new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(date),
        date: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(date)
    };
}

function renderForecast(forecastData, currentData) {
    const offset = forecastData.city?.timezone ?? currentData.timezone ?? 0;
    const today = localDateKey(currentData.dt, currentData.timezone ?? offset);
    const forecastsByDay = new Map();

    forecastData.list.forEach((entry) => {
        const dateKey = localDateKey(entry.dt, offset);
        if (!forecastsByDay.has(dateKey)) {
            forecastsByDay.set(dateKey, []);
        }
        forecastsByDay.get(dateKey).push(entry);
    });

    const days = [1, 2, 3].map((increment) => {
        const dateKey = addDays(today, increment);
        const entries = forecastsByDay.get(dateKey) ?? [];
        if (entries.length === 0) {
            throw new Error(`No forecast data was returned for ${dateKey}.`);
        }

        const temperatures = entries.map((entry) => entry.main.temp);
        return {
            dateKey,
            low: Math.round(Math.min(...temperatures)),
            high: Math.round(Math.max(...temperatures)),
            icon: entries[Math.floor(entries.length / 2)].weather?.[0]?.icon
        };
    });

    forecastList.replaceChildren(...days.map((day) => {
        const item = document.createElement("li");
        item.className = "forecast-day-card";
        const { weekday, date } = formatForecastDay(day.dateKey);
        const dateLabel = document.createElement("p");
        dateLabel.className = "forecast-date";
        const weekdayLabel = document.createElement("strong");
        weekdayLabel.textContent = weekday;
        const calendarDate = document.createElement("span");
        calendarDate.textContent = date;
        dateLabel.append(weekdayLabel, calendarDate);

        if (day.icon) {
            const icon = document.createElement("img");
            icon.src = `${weatherIconUrl}${day.icon}.png`;
            icon.alt = "";
            icon.width = 44;
            icon.height = 44;
            icon.loading = "lazy";
            item.append(dateLabel, icon);
        } else {
            item.append(dateLabel);
        }

        const temperatures = document.createElement("p");
        temperatures.className = "forecast-temperatures";
        const high = document.createElement("span");
        high.textContent = `High ${day.high}°C`;
        const low = document.createElement("span");
        low.textContent = `Low ${day.low}°C`;
        temperatures.append(high, low);
        item.append(temperatures);
        return item;
    }));
}

function renderWeather(currentData, forecastData) {
    const current = currentData.weather?.[0];
    if (!Number.isFinite(currentData.main?.temp) || !current?.description || !current?.icon) {
        throw new Error("Current weather data is incomplete.");
    }

    currentTemperature.textContent = `${Math.round(currentData.main.temp)}°C`;
    currentDescription.textContent = current.description;
    currentWeatherIcon.src = `${weatherIconUrl}${current.icon}@2x.png`;
    currentWeatherIcon.alt = `Current conditions: ${current.description}.`;
    renderForecast(forecastData, currentData);
}

async function loadWeather(apiKey) {
    weatherStatus.textContent = "Loading Harare weather…";
    weatherSubmit.disabled = true;
    weatherResults.setAttribute("aria-busy", "true");

    try {
        const [currentData, forecastData] = await Promise.all([
            fetchWeatherData(currentWeatherUrl, apiKey),
            fetchWeatherData(forecastUrl, apiKey)
        ]);
        renderWeather(currentData, forecastData);
        weatherStatus.textContent = "Current conditions and the three-day forecast are up to date.";
    } catch (error) {
        console.error("Unable to load Harare weather:", error);
        weatherStatus.textContent = error.status === 401
            ? "OpenWeatherMap did not accept this key. Check it and allow time for a new key to activate."
            : "Weather could not be loaded. Check your connection and API key, then try again.";
    } finally {
        weatherResults.setAttribute("aria-busy", "false");
        weatherSubmit.disabled = false;
    }
}

weatherForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const apiKey = weatherKeyInput.value.trim();
    if (apiKey) {
        loadWeather(apiKey);
    }
});

loadSpotlights();
