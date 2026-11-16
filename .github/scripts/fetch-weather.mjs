import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
const outputPath = resolve("_site/chamber/data/weather.json");
const harare = { latitude: -17.83, longitude: 31.05 };
const currentEndpoint = "https://api.openweathermap.org/data/2.5/weather";
const forecastEndpoint = "https://api.openweathermap.org/data/2.5/forecast";

async function saveWeatherData(data) {
    await mkdir(resolve("_site/chamber/data"), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

if (!apiKey) {
    console.warn("OPENWEATHER_API_KEY is not configured; the site will show a weather setup message.");
    await saveWeatherData({ error: { code: "not_configured" } });
} else {
    async function requestWeather(endpoint) {
        const url = new URL(endpoint);
        url.search = new URLSearchParams({
            lat: String(harare.latitude),
            lon: String(harare.longitude),
            units: "metric",
            appid: apiKey
        });

        const response = await fetch(url);
        if (!response.ok) {
            const error = new Error(`OpenWeatherMap returned HTTP ${response.status}.`);
            error.status = response.status;
            throw error;
        }
        return response.json();
    }

    try {
        const [current, forecast] = await Promise.all([
            requestWeather(currentEndpoint),
            requestWeather(forecastEndpoint)
        ]);

        if (!Number.isFinite(current.main?.temp) || !current.weather?.[0]?.description || !Array.isArray(forecast.list)) {
            throw new Error("OpenWeatherMap returned incomplete weather data.");
        }

        await saveWeatherData({
            updatedAt: new Date().toISOString(),
            current,
            forecast
        });
        console.log("Harare current conditions and forecast were added to the Pages artifact.");
    } catch (error) {
        const code = error.status === 401 ? "api_rejected" : "weather_unavailable";
        console.warn(`Weather update failed (${error.status ?? "network or data error"}); publishing a temporary unavailable message.`);
        await saveWeatherData({ error: { code } });
    }
}
