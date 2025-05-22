import React, {useState, useEffect} from "react";


export default function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/api/hi')
            .then(res => res.json())
            .then(data => setMessage(data.message))
    }, [])
    console.log(message)

    return (
        <div>
            {message}
        </div>
    );
}
