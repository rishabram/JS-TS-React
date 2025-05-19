import logo from './logo.svg';
import './App.css';
import InputBox from "./Components/InputBox";
import {useState} from "react";
import TodoList from "./Components/TodoList";

function App() {
    const [todos,setTodos] = useState([])
    const [input,setInput] = useState('');
 const handleAdd=()=>{
     setTodos([...todos,input])
     setInput('')

    }
    return (
        <div className="App">
            <header className="App-header">
                ToDoList
            </header>
            <div className="app-body">
                <InputBox input={input} setInput={setInput}/>
                <button onClick={handleAdd}>Add Task</button>
                <TodoList todos={todos} setTodos={setTodos} />

            </div>
        </div>
    );
}

export default App;