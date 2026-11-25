// footer dates
document.querySelector("#current-year").textContent =
    new Date().getFullYear();

document.querySelector("#last-modified").textContent =
    document.lastModified;


const spotlightContainer = document.querySelector("#spotlight-container");

async function displaySpotlights() {
    try {
        const response = await fetch("data/members.json");

        if (!response.ok) {
            throw new Error("Could not load business data.");
        }

        const members = await response.json();

        // Only select Silver and Gold members.
        const eligibleMembers = members.filter(member =>
            Number(member.membership) === 2 ||
            Number(member.membership) === 3
        );

        // Random select three different businesses.
        const shuffledMembers = eligibleMembers.sort(
            () => Math.random() - 0.5
        );

        const selectedMembers = shuffledMembers.slice(0, 3);

        spotlightContainer.innerHTML = "";

        selectedMembers.forEach(member => {
            const card = document.createElement("article");
            card.classList.add("spotlight-card");

            const image = document.createElement("img");
            image.src = `images/${member.image}`;
            image.alt = `${member.name} logo`;
            image.loading = "lazy";
            image.width = 180;
            image.height = 110;

            const name = document.createElement("h3");
            name.textContent = member.name;

            const membership = document.createElement("p");
            membership.textContent = Number(member.membership) === 3
                ? "Gold Member"
                : "Silver Member";

            const description = document.createElement("p");
            description.textContent = member.description;

            const address = document.createElement("p");
            address.textContent = `Address: ${member.address}`;

            const phone = document.createElement("p");
            phone.textContent = `Phone: ${member.phone}`;

            const website = document.createElement("a");
            website.href = member.website;
            website.textContent = "Visit Website";
            website.target = "_blank";
            website.rel = "noopener noreferrer";

            card.append(image, name, membership, description, address, phone, website);

            spotlightContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Spotlight error:", error);
        spotlightContainer.textContent ="Business spotlights are currently unavailable.";
    }
}

displaySpotlights();

const API_KEY = "8b704b7bbac0841bce2d4adf6bc8cdee";
const LATITUDE = -17.8252;
const LONGITUDE = 31.0335;
const currentWeather = document.querySelector("#current-weather");
const weatherForecast = document.querySelector("#weather-forecast");

async function getWeather() {
    try {
        const currentURL =
            `https://api.openweathermap.org/data/2.5/weather?lat=${LATITUDE}&lon=${LONGITUDE}&units=metric&appid=${API_KEY}`;

        const forecastURL =
            `https://api.openweathermap.org/data/2.5/forecast?lat=${LATITUDE}&lon=${LONGITUDE}&units=metric&appid=${API_KEY}`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentURL),
            fetch(forecastURL)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error("Weather information could not be loaded.");
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

    } catch (error) {
        console.error("Weather error:", error);
        currentWeather.textContent ="Current weather is currently unavailable.";
        weatherForecast.textContent ="The weather forecast is currently unavailable.";
    }
}

function displayCurrentWeather(data) {
    currentWeather.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = data.name;

    const icon = document.createElement("img");
    icon.src =`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    icon.alt = data.weather[0].description;

    const temperature = document.createElement("p");
    temperature.textContent =`Temperature: ${Math.round(data.main.temp)}°C`;

    const description = document.createElement("p");
    description.textContent =`Conditions: ${data.weather[0].description}`;

    const humidity = document.createElement("p");
    humidity.textContent =`Humidity: ${data.main.humidity}%`;

    currentWeather.append(heading,icon,temperature,description,humidity);
}

function displayForecast(data) {
    weatherForecast.innerHTML = "";

    const dailyForecasts = {};

    data.list.forEach(item => {
        const localDate = new Date((item.dt + data.city.timezone) * 1000);

        const dateKey = localDate.toISOString().slice(0, 10);
        const localHour = localDate.getUTCHours();

        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                temperatures: [],
                selectedWeather: item,
                closestHour: Math.abs(localHour - 12)
            };
        }

        const day = dailyForecasts[dateKey];

        day.temperatures.push(item.main.temp);

        // Use the forecast closest to midday for weather icon.
        if (Math.abs(localHour - 12) < day.closestHour) {
            day.selectedWeather = item;
            day.closestHour = Math.abs(localHour - 12);
        }
    });

    const dates = Object.keys(dailyForecasts).slice(0, 3);

    dates.forEach(dateKey => {
        const day = dailyForecasts[dateKey];
        const weather = day.selectedWeather;
        const card = document.createElement("article");
        card.classList.add("forecast-card");
        const date = document.createElement("h3");
        date.textContent = new Date(`${dateKey}T12:00:00+02:00`).toLocaleDateString("en-ZW", {weekday: "long"});

        const icon = document.createElement("img");
        icon.src =`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
        icon.alt = weather.weather[0].description;
        const description = document.createElement("p");
        description.textContent = weather.weather[0].description;
        const high = Math.round(Math.max(...day.temperatures));
        const low = Math.round(Math.min(...day.temperatures));
        const temperature = document.createElement("p");
        temperature.textContent = `High: ${high}°C | Low: ${low}°C`;

        card.append(date, icon, description, temperature);
        weatherForecast.appendChild(card);
    });
}

getWeather();
