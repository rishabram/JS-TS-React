import React, { useState } from 'react';
function InputBox({input,setInput, handleAdd}){
    console.log("InputBox component rendering");

    const handleInputChange = (e) =>{
        setInput(e.target.value);
    };
    const handleKeyDown=(e)=>{
        if (e.key === 'Enter'){
            handleAdd();
        }
    }

    return(
        <label>Enter tasks to do!:
        <input type="text" value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Enter tasks to do!"/>
        </label>
    );
}
export default InputBox;
