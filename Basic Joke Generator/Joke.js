import React, { useState } from "react";
 function Joke(){
  const [joke,setJoke] =  useState('');

     async function handleJoke(){
         const res =await fetch('https://sv443.net/jokeapi/v2/joke/Programming?type=single')
             .then((res)=>res.json())
             .then((data)=>setJoke(data.joke))

     }

     return(
    <>
     <button onClick={handleJoke}>Click here to generate a joke</button>
        <div>{joke}</div>
    </>
)
 }
 export default Joke;
