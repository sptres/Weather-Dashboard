let APIKey = "666568578caef2e381c26c375bb1bf55";
let cities = [];

//function to make sure city being searched is retrieved and incorrect city name or city that doesn't exist won't be retrieved
function getCity(cityName1) {
  
    document.getElementById("city-details").style.display = "block";
    document.getElementById("city-forecast").style.display = "block";
    let cityName = document.getElementById("city-name").value;
    
    if (cityName !== cityName1) {
        cityName = cityName1;
    }
    
    fetch(
        'https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=' + APIKey
    )
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        let cityLat = data[0].lat;
        let cityLon = data[0].lon;

        let forecastURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + cityLat + "&lon=" + cityLon + "&appid=" + APIKey + "&units=imperial";
        let currentUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + cityLat + "&lon=" + cityLon + "&appid=" + APIKey + "&units=imperial";

        currentWeather(currentUrl);
        projectedWeather(forecastURL);
    });
}
//function to retreive current weather
function currentWeather(currentUrl) {
    fetch(currentUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            let today = dayjs().format('MMMM D, YYYY');
            let cityDetailsHeader = document.getElementById("city-details-header");
            cityDetailsHeader.textContent = data.name + ' (' + today + ')';
            
            document.getElementById("current-city-temp").textContent = "Temperature: " + data.main.temp + " Fahrenheit";
            document.getElementById("current-city-wind").textContent = "Wind Speed: " + data.wind.speed + " MPH";
            document.getElementById("current-city-humid").textContent = "Humidity: " + data.main.humidity + "%";
            
            let weatherImage = 'https://openweathermap.org/img/w/' + data.weather[0].icon + '.png';

            let weatherIcon = document.createElement("img");
            weatherIcon.setAttribute("src", weatherImage);
            cityDetailsHeader.appendChild(weatherIcon);
        });
}

//function to retreive 5 days of weather forecast
let forecastContainerEl = $("#forecast-box");
function projectedWeather(forecastUrl) {
    let forecastContainer = document.getElementById("forecast-box");
    forecastContainer.innerHTML = "";
    fetch(forecastUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var dataList = data.list;

            for (let i = 0; i < dataList.length; i++) {
                let date = dataList[i].dt_txt.split(" ")[0];
                let time = dataList[i].dt_txt.split(" ")[1];

                let dateForecast = dayjs(date).format('MMMM D, YYYY');
                let today = dayjs().format('MMMM D, YYYY');

                if (time === '12:00:00' && dateForecast !== today) {
                    let dayForecastEl = document.createElement('section');
                    dayForecastEl.setAttribute('id', 'day-' + dateForecast);
                    dayForecastEl.setAttribute('class', 'col-sm bg-primary text-white m-1');

                    let dateForecastEl = document.createElement('h1');
                    dateForecastEl.setAttribute('id', 'day-date-' + dateForecast);
                    dateForecastEl.setAttribute('style', 'color: white;');
                    dateForecastEl.textContent = dateForecast;

                    let iconForecastEl = document.createElement('h1');
                    let iconURL = 'https://openweathermap.org/img/w/' + dataList[i].weather[0].icon + '.png';
                    let iconImage = document.createElement("img");
                    iconImage.setAttribute("src", iconURL);
                    iconForecastEl.setAttribute('id', 'day-icon-' + dateForecast);
                    iconForecastEl.appendChild(iconImage);

                    let tempForecastEl = document.createElement('p');
                    tempForecastEl.setAttribute('id', 'day-temp-' + dateForecast);
                    tempForecastEl.textContent = "Temperature: " + dataList[i].main.temp + " Fahrenheit";
                    tempForecastEl.setAttribute('style', 'color: white;');

                    let windForecastEl = document.createElement('p');
                    windForecastEl.setAttribute('id', 'day-wind-' + dateForecast);
                    windForecastEl.textContent = "Wind Speed: " + dataList[i].wind.speed + " MPH";
                    windForecastEl.setAttribute('style', 'color: white;');

                    let humForecastEl = document.createElement('p');
                    humForecastEl.setAttribute('id', 'day-hum-' + dateForecast);
                    humForecastEl.textContent = "Humidity: " + dataList[i].main.humidity + "%";
                    humForecastEl.setAttribute('style', 'color: white;');

                    dayForecastEl.appendChild(dateForecastEl);
                    dayForecastEl.appendChild(iconForecastEl);
                    dayForecastEl.appendChild(tempForecastEl);
                    dayForecastEl.appendChild(windForecastEl);
                    dayForecastEl.appendChild(humForecastEl);

                    forecastContainer.appendChild(dayForecastEl);
                }
            }
        });
}

//function to get new city while storing old search in local storage
function appendCity(newCity) {
    const previousCities = [...cities];
    cities.length = 0; 
    cities.push(newCity); 

    for (let i = 0; i < previousCities.length; i++) {
        cities.push(previousCities[i]);
    }
    cityList();
    storeCity();
}


//function to organize city search list
let recentSearchResultsEl = document.getElementById("recent-search-container");
function cityList() {
    let citiesHtml = "";
    for (let i = 0; i < cities.length; i++) {
        citiesHtml += '<button class="btn">' + cities[i].name + '</button>';
    }
    recentSearchResultsEl.innerHTML = citiesHtml;
    console.log(cities[0]);
}

//adding click button for city-searching 
const recentSearchResults = document.getElementById("recent-search-container");
recentSearchResults.addEventListener("click", function(event) {
    if (event.target.tagName === "BUTTON") {
        let recentCityName = event.target.textContent;
        getCity(recentCityName);
    }
});

// This function is to search the City
function citySearch() {
    let citySearchForm = document.getElementById("city-search-form");
    citySearchForm.addEventListener("submit", function(event) {
        event.preventDefault();
        let newCityName = document.getElementById("city-name").value;
        let newCity = {
            name: newCityName
        };
        appendCity(newCity);
        getCity(newCityName);
    });
}
window.addEventListener('load', function() {
    citySearch();
    loadCities();
    let cities = JSON.parse(localStorage.getItem("cities"));
    if (cities) {
        let lastCity = cities[0].name;  
        getCity(lastCity); 
        cityList();

    } else {
        document.getElementById("city-details").style.display = "none"; 
        document.getElementById("city-forecast").style.display = "none";
    }
});

//store city in local storange
var storeCity = function() {
    localStorage.setItem( "cities", JSON.stringify(cities) );
 }
 
 //retreive data from local storage
 var loadCities = function() {
     cities = JSON.parse(localStorage.getItem("cities"));
     if (!cities){
         cities = [];   
     }
     console.log("load cities", cities);
     cityList();
 }

 //function to clear recent city search history 
 function clearSearches() {
    cities = []; // Clear the cities array
    localStorage.removeItem("cities"); // Remove the cities data from localStorage
    cityList(); // Update the list of cities in the UI
  }
  window.addEventListener('load', function() {
    document.getElementById("clear-searches-btn").addEventListener("click", clearSearches);
  });
  

 

 


