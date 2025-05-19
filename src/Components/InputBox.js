import React, { useState } from 'react';
function InputBox({input,setInput}){
    console.log("InputBox component rendering");

    const handleInputChange = (e) =>{
        setInput(e.target.value);
    };
    return(
        <label>Enter tasks to do!:
        <input type="text" value={input} onChange={handleInputChange} placeholder="Enter tasks to do!"/>
        </label>
    );
}
export default InputBox;
