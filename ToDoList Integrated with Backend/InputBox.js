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
    /**
     * @param {string} s
     * @return {number}
     */
    var lengthOfLastWord = function(s) {
        const t = s.trim()
        const res = t.split(" ");
        const len = res.at(-1).length;
        return len

    };

    return(
        <label>Enter tasks to do!:
        <input type="text" value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Enter tasks to do!"/>
        </label>
    );
}
export default InputBox;
