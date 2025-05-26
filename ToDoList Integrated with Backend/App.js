import logo from './logo.svg';
import './App.css';
import InputBox from "./Components/InputBox";
import {useState, useEffect} from "react";
import TodoList from "./Components/TodoList";

function App() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/toDo');
            if (!res.ok) throw new Error('Failed to fetch todos');
            const data = await res.json();
            setTodos(data);
            console.log("Fetched todos:", data);index.js
        } catch (err) {
            console.error('Error fetching todos:', err);
            setError('Failed to load todos');
        } finally {
            setLoading(false);
        }

    };
    const handleAdd = async () => {
        if (!input.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/toDo', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ text: input })
            });

            if (!res.ok) throw new Error('Failed to add todo');
            const data = await res.json();
            setTodos([...todos, data]);
            setInput('');
        } catch (err) {
            console.error('Error adding todo:', err);
            setError('Failed to add todo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                ToDoList
            </header>
            <div className="app-body">
                {error && <p className="error-message">{error}</p>}
                <InputBox input={input} setInput={setInput} handleAdd={handleAdd}/>
                <button onClick={handleAdd} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Task'}
                </button>
                {loading && <p>Loading...</p>}
                <TodoList todos={todos} setTodos={setTodos} />
            </div>
        </div>
    );
}

export default App;