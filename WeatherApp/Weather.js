import React, {useEffect, useState} from 'react'

function Weather(){
    const [longitude,setLongitude] = useState(0.0);
    const [latitude,setLatitude] = useState(0.0);
    const [forecastURL, setForecastURL] = useState('');

    const [temperature,setTemperature]=useState('')
    const locationURL='http://ip-api.com/json/'
    let weatherURL = ``


    async function fetchData(URL){
        const res = await fetch(URL)
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
            console.log(forecastURL)
        }
        else {
            setTemperature(data.properties.periods[0].temperature)
            console.log(data.properties.periods[0].temperature)
            console.log(temperature)
        }
    }
    if (latitude !== 0.0 && longitude !== 0.0){
        weatherURL = `https://api.weather.gov/points/${latitude},${longitude}`
    }

    useEffect(()=>{
        if (latitude === 0.0 && longitude === 0.0) {
            fetchData(locationURL)}
        else if (forecastURL ===''){
            fetchData(weatherURL)
        }
        else {
            fetchData(forecastURL)
        }




    },[latitude,longitude,forecastURL,weatherURL]);
    return(
        <div>
            <p>Latitude = {latitude}</p>
            <p>Longitude = {longitude}</p>
            <p>Temperature = {temperature}</p>


        </div>
    )
}
export default Weather;
