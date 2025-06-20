document.addEventListener("DOMContentLoaded", () => {
    let cityInput = document.getElementById('city_Input'),
        searchBtn = document.getElementById('searchBtn'),
        locationBtn = document.getElementById('locationBtn'),
        api_key = 'e05b01298454d976a8a83ede7871e21c',
        currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
        fiveDaysForecastCard = document.querySelector('.day-forecast'),
        aqiCard = document.querySelectorAll('.highlights .card')[0],
        sunriseCard = document.querySelectorAll('.highlights .card')[1],
        humidityVal = document.getElementById('humidityVal'),
        pressureVal = document.getElementById('pressureVal'),
        windSpeedVal = document.getElementById('windSpeedVal'),
        feelsVal = document.getElementById('feelsVal'),
        hourlyForecastCard = document.querySelector('.hourly-forecast'),
        aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

    function getWeatherDetails(name, lat, lon, country, state) {
        const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
        const AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;

        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        // Air Pollution
        fetch(AIR_POLLUTION_API_URL)
            .then(res => res.json())
            .then(data => {
                const { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
                aqiCard.innerHTML = `
                    <div class="card-head">
                        <p>Air Quality Index</p>
                        <p class="air-index aqi-${data.list[0].main.aqi}">${aqiList[data.list[0].main.aqi - 1]}</p>
                    </div>
                    <div class="air-indices">
                        <i class="fa-regular fa-wind fa-3x"></i>
                        <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
                        <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
                        <div class="item"><p>SO2</p><h2>${so2}</h2></div>
                        <div class="item"><p>CO</p><h2>${co}</h2></div>
                        <div class="item"><p>NO</p><h2>${no}</h2></div>
                        <div class="item"><p>NO2</p><h2>${no2}</h2></div>
                        <div class="item"><p>NH3</p><h2>${nh3}</h2></div>
                        <div class="item"><p>O3</p><h2>${o3}</h2></div>
                    </div>`;
            }).catch(() => alert('Failed to fetch air quality index'));

        // Current Weather
        fetch(WEATHER_API_URL)
            .then(res => res.json())
            .then(data => {
                const date = new Date();
                currentWeatherCard.innerHTML = `
                    <div class="current-weather">
                        <div class="details">
                            <p>Now</p>
                            <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                            <p>${data.weather[0].description}</p>
                        </div>
                        <div class="weather-icon">
                            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                        </div>
                    </div>
                    <hr>
                    <div class="card-footer">
                        <p><i class="fa-light fa-calendar"></i> ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</p>
                        <p><i class="fa-light fa-location-dot"></i> ${name}, ${country}</p>
                    </div>`;

                let { sunrise, sunset } = data.sys,
                    {timezone} = data,
                    sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A'),
                    sSetTime = moment.utc(sunset, 'X').add(timezone , 'seconds').format('hh:mm A');

                sunriseCard.innerHTML = `
                    <div class="card-head"><p>Sunrise & Sunset</p></div>
                    <div class="sunrise-sunset">
                        <div class="item">
                            <div class="icon"><i class="fa-light fa-sunrise fa-4x"></i></div>
                            <div><p>Sunrise</p><h2>${sRiseTime}</h2></div>
                        </div>
                        <div class="item">
                            <div class="icon"><i class="fa-light fa-sunset fa-4x"></i></div>
                            <div><p>Sunset</p><h2>${sSetTime}</h2></div>
                        </div>
                    </div>`;

                humidityVal.innerHTML = `${data.main.humidity}%`;
                pressureVal.innerHTML = `${data.main.pressure}hPa`;
                windSpeedVal.innerHTML = `${(data.wind.speed * 18 / 5).toFixed(2)}Km/hr`;
                feelsVal.innerHTML = `${(data.main.feels_like - 273.15).toFixed(2)}&deg;C`;
            }).catch(() => alert('Failed to fetch current weather'));

        // Forecast
        fetch(FORECAST_API_URL)
            .then(res => res.json())
            .then(data => {
                hourlyForecastCard.innerHTML = '';
                const hourlyForecast = data.list.slice(0, 8); // 24 hours (3-hr intervals)

                hourlyForecast.forEach(item => {
                    const hrForecastDate = new Date(item.dt_txt);
                    let hr = hrForecastDate.getHours();
                    let a = 'AM';
                    if (hr >= 12) {
                        a = 'PM';
                        if (hr > 12) hr -= 12;
                    }
                    if (hr === 0) hr = 12;

                    hourlyForecastCard.innerHTML += `
                        <div class="card">
                            <p>${hr} ${a}</p>
                            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="">
                            <p>${(item.main.temp - 273.15).toFixed(2)}&deg;C</p>
                        </div>`;
                });

                // 5-day forecast
                const uniqueForecastDays = [];
                const fiveDaysForecast = data.list.filter(forecast => {
                    const forecastDate = new Date(forecast.dt_txt).getDate();
                    if (!uniqueForecastDays.includes(forecastDate)) {
                        uniqueForecastDays.push(forecastDate);
                        return true;
                    }
                    return false;
                });

                fiveDaysForecastCard.innerHTML = '';
                for (let i = 1; i < fiveDaysForecast.length; i++) {
                    const date = new Date(fiveDaysForecast[i].dt_txt);
                    fiveDaysForecastCard.innerHTML += `
                        <div class="forecast-item">
                            <div class="icon-wrapper">
                                <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
                                <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                            </div>
                            <p>${date.getDate()} ${months[date.getMonth()]}</p>
                            <p>${days[date.getDay()]}</p>
                        </div>`;
                }
            }).catch(() => alert('Failed to fetch weather forecast'));
    }

    function getCityCoordinates() {
        const cityName = cityInput.value.trim();
        cityInput.value = '';
        if (!cityName) return;

        const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
        fetch(GEOCODING_API_URL)
            .then(res => res.json())
            .then(data => {
                const { name, lat, lon, country, state } = data[0];
                getWeatherDetails(name, lat, lon, country, state);
            }).catch(() => alert(`Failed to fetch coordinates of ${cityName}`));
    }

    function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition(position => {
        let { latitude, longitude } = position.coords;
        let REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;

        fetch(REVERSE_GEOCODING_URL)
            .then(rev => rev.json())
            .then(data => {
                let { name, country, state } = data[0];
                getWeatherDetails(name, latitude, longitude, country, state);
            })
            .catch(() => {
                alert('Failed to fetch user coordinates');
            });
    }, error => {
        if (error.code === error.PERMISSION_DENIED) {
            alert('Geolocation permission denied. Please reset location permission to grant access again');
        }
    });
}


    searchBtn.addEventListener('click', getCityCoordinates);
    locationBtn.addEventListener('click', getUserCoordinates);
    cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates());
    window.addEventListener('load', getUserCoordinates);
});
