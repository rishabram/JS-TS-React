import React, {useEffect, useState} from 'react'

function Weather(){
    const [longitude,setLongitude] = useState(0.0);
    const [latitude,setLatitude] = useState(0.0);
    const [forecastURL, setForecastURL] = useState('');

    const [temperature,setTemperature]=useState('')
    const [weatherURL,setWeatherURL] = useState(``)


    const [temperatureUnit,setTemperatureUnit] = useState('');
    let [icon,setIcon]=useState('')
    const locationURL='http://ip-api.com/json/'


    async function fetchData(URL){
       try{ const res = await fetch(URL)
        if (!res.ok){
            throw new Error(`Response Error: ${res.status}`)
        }
        const data = await res.json()
            if (URL === locationURL) {
                setLongitude(data.lon)
                setLatitude(data.lat)
                console.log(data.lat)
                console.log(data.lon)
            }
           else if (URL.includes('https://api.weather.gov/points/')){
                setForecastURL(data.properties.forecast)
                console.log(data.properties.forecast)
            }
           else {
                setTemperature(data.properties.periods[0].temperature)
                setTemperatureUnit(data.properties.periods[0].temperatureUnit)
                setIcon(data.properties.periods[0].icon)
                console.log(data.properties.periods[0].temperature)
                console.log(data.properties.periods[0].temperatureUnit)
                console.log(data.properties.periods[0].icon)
            }
    }
    catch (error){
        console.error("Error fetching data:", error, "from URL:", URL)
    }
    }
    useEffect(()=>{
        if (latitude !== 0.0 && longitude !== 0.0){
            setWeatherURL(`https://api.weather.gov/points/${latitude},${longitude}`);
        }
    },[latitude,longitude])

    useEffect(()=>{
        if (latitude === 0.0 && longitude === 0.0) {
            fetchData(locationURL)}
        else if (weatherURL && forecastURL === ''){
            fetchData(weatherURL)
        }
        else if(forecastURL){
            fetchData(forecastURL)
        }
    },[forecastURL,weatherURL]);

    return(
        <div>
            <p>Latitude = {latitude}</p>
            <p>Longitude = {longitude}</p>
            <p>Temperature = {temperature} {temperatureUnit} {icon && <img src={icon} alt="Weather icon" width="50" />}</p>



        </div>
    )
}
export default Weather;
