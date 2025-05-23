import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [items, setItems] = useState([]);
    const [newItem,setNewItem] = useState('')
    useEffect(()=>{
        fetch('http://localhost:5000/api/items')
            .then((res)=>res.json())
            .then((data)=>setItems(data))
    },[])
    async function handleSubmit(e){
        e.preventDefault();
        const res = await fetch('http://localhost:5000/api/items',{
            method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: newItem })
        })
        const data = await res.json();
        setItems([...items,data])
        setNewItem("");
    }
    async function handleDelete(id){
        const res = await fetch('http://localhost:5000/api/items',{
            method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id: id})
        })
        const data = await res.json();
        setItems(data)

    }
    return (
        <div>
            <h1>Items</h1>
            <ul>
                {items.map((item)=>(<li key={item.id}>{item.name}
                        <button onClick={()=>handleDelete(item.id)}>Delete Item</button>
                    </li>)
                    )}
            </ul>
           <form onSubmit={handleSubmit}>
               <input value={newItem}type='text' onChange={(e)=>setNewItem(e.target.value)} placeholder='Add a new item'
               />
               <button type='submit'>Add new text</button>
           </form>
        </div>
    )
}
export default App;
