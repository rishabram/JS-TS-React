import React, {useEffect, useState} from 'react'

function Weather(){
    const [longitude,setLongitude] = useState(0.0);
    const [latitude,setLatitude] = useState(0.0);
    const locationURL='http://ip-api.com/json/'
        async function fetchData(URL){
        const res = await fetch(URL)
        if (!res.ok){
            throw new(`Response Error: ${res.status}`)
        }
        const data = await res.json()
            if (URL === 'http://ip-api.com/json/'){
                setLongitude(data.lat)
                setLatitude(data.lon)
                console.log(data.lat)
                console.log(data.lon)

            }


    }
}
export default Weather;