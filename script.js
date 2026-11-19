const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherSection = document.getElementById("weatherSection");

// Search button event
searchBtn.addEventListener("click", searchWeather);

// Enter key event
cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});

// Weather information
function getWeatherInfo(code) {

    const weatherCodes = {
        0: ["Clear Sky", "☀️"],
        1: ["Mainly Clear", "🌤️"],
        2: ["Partly Cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Foggy", "🌫️"],
        48: ["Foggy", "🌫️"],
        51: ["Light Drizzle", "🌦️"],
        53: ["Drizzle", "🌦️"],
        55: ["Heavy Drizzle", "🌧️"],
        61: ["Light Rain", "🌧️"],
        63: ["Moderate Rain", "🌧️"],
        65: ["Heavy Rain", "⛈️"],
        71: ["Light Snow", "🌨️"],
        73: ["Snow", "❄️"],
        75: ["Heavy Snow", "❄️"],
        80: ["Rain Showers", "🌦️"],
        81: ["Rain Showers", "🌧️"],
        82: ["Heavy Rain Showers", "⛈️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm", "⛈️"],
        99: ["Heavy Thunderstorm", "⛈️"]
    };

    return weatherCodes[code] || ["Unknown Weather", "🌡️"];
}


// Main search function
async function searchWeather() {

    const city = cityInput.value.trim();

    // Input validation
    if (city === "") {
        message.textContent = "Please enter a city name!";
        weatherSection.classList.add("hidden");
        return;
    }

    message.style.color = "#536dfe";
    message.textContent = "Loading weather data...";
    searchBtn.disabled = true;

    try {

        // Step 1: Get city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to connect to location service.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found! Please enter a valid city name.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Get weather information
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather information.");
        }

        const weatherData = await weatherResponse.json();

        // Step 3: Display weather information
        displayWeather(location, weatherData);

        message.textContent = "";

    }

    catch (error) {

        message.style.color = "#e53935";
        message.textContent = error.message;
        weatherSection.classList.add("hidden");

    }

    finally {
        searchBtn.disabled = false;
    }
}


// Display current weather
function displayWeather(location, data) {

    weatherSection.classList.remove("hidden");

    const current = data.current;

    const weather = getWeatherInfo(current.weather_code);

    document.getElementById("cityName").textContent =
        `${location.name}, ${location.country}`;

    document.getElementById("currentDate").textContent =
        new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    document.getElementById("weatherIcon").textContent =
        current.is_day ? weather[1] :
        (current.weather_code === 0 ? "🌙" : weather[1]);

    document.getElementById("temperature").textContent =
        `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("description").textContent =
        weather[0];

    document.getElementById("feelsLike").textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
        `${current.wind_speed_10m} km/h`;


    // Display 5-day forecast
    displayForecast(data.daily);

}


// Forecast function
function displayForecast(daily) {

    const forecastContainer = document.getElementById("forecast");

    forecastContainer.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(daily.time[i] + "T12:00:00");

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const weather = getWeatherInfo(daily.weather_code[i]);

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${day}</h3>
            <div class="forecast-icon">${weather[1]}</div>
            <p>${weather[0]}</p>
            <p><strong>${Math.round(daily.temperature_2m_max[i])}°C</strong></p>
            <p>${Math.round(daily.temperature_2m_min[i])}°C</p>
        `;

        forecastContainer.appendChild(card);

    }

}