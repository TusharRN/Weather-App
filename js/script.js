let weatherAPIKey = 'e4f2ba0702c0090504c859d78418a916'
let weatherBaseEndPoint =
  'https://api.openweathermap.org/data/2.5/weather?appid=' +
  weatherAPIKey +
  '&units=metric'

let forecastBaseEndpoint =
  'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' +
  weatherAPIKey

let geocodingBaseEndpoint =
  'https://api.openweathermap.org/geo/1.0/direct?limit=5&appid=' +
  weatherAPIKey +
  '&q='

let reverseGeocodingBaseEndpoint =
  'https://api.openweathermap.org/geo/1.0/reverse?limit=5&appid=' +
  weatherAPIKey

// Variable declaration for selecting HTML input value

let datalist = document.querySelector('#suggestions')

let searchInp = document.querySelector('.weather_search')
let city = document.querySelector('.weather_city')
let day = document.querySelector('.weather_day')
let humidity = document.querySelector('.weather_indicator--humidity>.value')
let wind = document.querySelector('.weather_indicator--wind>.value')
let pressure = document.querySelector('.weather_indicator--pressure>.value')
let temperature = document.querySelector('.weather_temperature>.value')
let image = document.querySelector('.weather_image')
let forecastBlock = document.querySelector('.weather_forecast')
let weatherImages = [
  {
    url: 'images/broken-clouds.png',
    ids: [803, 804],
  },
  {
    url: 'images/clear-sky.png',
    ids: [800],
  },
  {
    url: 'images/few-clouds.png',
    ids: [801],
  },
  {
    url: 'images/mist.png',
    ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
  },
  {
    url: 'images/rain.png',
    ids: [500, 501, 502, 503, 504],
  },
  {
    url: 'images/scattered-clouds.png',
    ids: [802],
  },
  {
    url: 'images/shower-rain.png',
    ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321],
  },
  {
    url: 'images/snow.png',
    ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
  },
  {
    url: 'images/thunderstorm.png',
    ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
  },
]

let getWeatherByCityName = async (city) => {
  let endPoint = weatherBaseEndPoint + '&q=' + city
  let response = await fetch(endPoint)
  let weather = await response.json()
  return weather
}

let getForecastByCityID = async (id) => {
  let endPoint = forecastBaseEndpoint + '&id=' + id
  let result = await fetch(endPoint)
  let forecast = await result.json()
  // console.log(forecast)
  let forecastList = forecast.list
  let daily = []
  forecastList.forEach((day) => {
    let date_txt = day.dt_txt
    date_txt = date_txt.replace(' ', 'T')
    let date = new Date(date_txt)
    let hours = date.getHours()
    if (hours === 12) {
      daily.push(day)
    }
  })
  // console.log('daily weather:' + daily)
  return daily
}

let updateCurrentWeather = (data) => {
  city.innerText = data.name
  day.innerText = dayOfWeek()
  humidity.innerText = data.main.humidity
  pressure.innerText = data.main.pressure

  let windDirection
  let deg = data.wind.deg
  if (deg > 22.5 && deg <= 67.5) {
    windDirection = 'North-East'
  } else if (deg > 67.5 && deg <= 112.5) {
    windDirection = 'East'
  } else if (deg > 112.5 && deg <= 157.5) {
    windDirection = 'South-East'
  } else if (deg > 157.5 && deg <= 202.5) {
    windDirection = 'South'
  } else if (deg > 202.5 && deg <= 247.5) {
    windDirection = 'South-West'
  } else if (deg > 247.5 && deg <= 292.5) {
    windDirection = 'West'
  } else if (deg > 292.5 && deg <= 337.5) {
    windDirection = 'North-West'
  } else {
    windDirection = 'North'
  }
  wind.innerText = windDirection + ',' + data.wind.speed

  temperature.innerText =
    data.main.temp > 0
      ? '+' + Math.round(data.main.temp)
      : Math.round(data.main.temp)

  let imgID = data.weather[0].id
  weatherImages.forEach((obj) => {
    if (obj.ids.indexOf(imgID) != -1) {
      image.src = obj.url
    }
  })
}
let dayOfWeek = (
  dt = new Date().getTime() /* generating current time into milli seconds if date (dt in milliseconds) is not passed */,
) => {
  // if (dt === undefined) {
  //   dt = new Date().getTime() // generating current time into milli seconds
  // }
  let today = new Date(dt).toLocaleDateString('en-En', { weekday: 'long' }) //getting day of week from generating date object from millisec.
  return today
}

let weatherForCity = async (city) => {
  let weather = await getWeatherByCityName(city)
  if (weather.cod === '404') {
    Swal.fire({
      icon: 'error',
      title: 'OOPs...',
      text: 'You Typed wrong city name',
    })
    return
  }
  updateCurrentWeather(weather)
  // console.log(weather)
  let cityID = weather.id
  let forecast = await getForecastByCityID(cityID)
  updateForecast(forecast)
}
searchInp.addEventListener('keydown', async (e) => {
  if (e.keyCode === 13) {
    weatherForCity(searchInp.value)
  }
})
searchInp.addEventListener('input', async () => {
  if (searchInp.value.length <= 2) {
    return
  }
  let endpoint = geocodingBaseEndpoint + searchInp.value
  let result = await fetch(endpoint)
  result = await result.json()
  // console.log('Suggestions of city :' + result)
  datalist.innerHTML = ''

  result.forEach((city) => {
    let option = document.createElement('option')
    option.value = `${city.name},${city.state ? ',' + city.state : ''},${
      city.country
    }` //all cities are not having state therefore by use of ternary operator we can handle display of state
    datalist.appendChild(option)
    // console.log(`${city.name},${city.state},${city.country}`)
  })
})

let updateForecast = (forecast) => {
  forecastBlock.innerHTML = ''
  let forecastItem = ''
  forecast.forEach((day) => {
    let iconUrl =
      'https://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png'
    let temperature =
      day.main.temp > 0
        ? '+' + Math.round(day.main.temp)
        : Math.round(day.main.temp)
    let dayName = dayOfWeek(day.dt * 1000) //day.dt*1000 converting seconds into milliseconds
    // console.log(dayName)
    forecastItem += `<article class="weather_forecast_item">
    <img
      src="${iconUrl}"
      alt="${day.weather[0].description}"
      class="weather_forecast_icon"
    />
    <h3 class="weather_forecast_day">${dayName}</h3>
    <p class="weather_forecast_temperature">
      <span class="value">${temperature}</span>
      &deg;C
    </p>
  </article>`
  })
  forecastBlock.innerHTML = forecastItem
}

window.onload = () => {
  let options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  navigator.geolocation.getCurrentPosition(success, error, options)
}

async function success(position) {
  let latitude = position.coords.latitude
  let longitude = position.coords.longitude
  let endPoint =
    reverseGeocodingBaseEndpoint + '&lat=' + latitude + '&lon=' + longitude
  let result = await fetch(endPoint)
  let city = await result.json()
  console.log(city)
  let name = city[0].name
  let cityname = name.split(' ')
  let location = cityname + ', ' + city[0].state + ', ' + city[0].country
  weatherForCity(location)
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`)
}
