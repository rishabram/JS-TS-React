import {useState} from "react";

function TodoList({todos,setTodos}){
const handleDelete=(index)=>{
    setTodos(todos.filter((_,i)=> i !== index))
    console.log(todos)
}
    return(
        <ul>
       {todos.map((todo,index)=>(
           <li key={index}>{todo}
               <button onClick={()=>{handleDelete(index)}}>delete</button></li>
       ))}
        </ul>
    );
}
export default TodoList;