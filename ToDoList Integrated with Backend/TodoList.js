import {useState} from "react";

function TodoList({todos, setTodos}) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async (id, index) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/toDo/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete');

            setTodos(todos.filter((_, i) => i !== index));
        } catch (err) {
            console.error('Error deleting todo:', err);
            alert('Failed to delete todo');
        } finally {
            setLoading(false);
        }
    };

    return(
        <ul>
            {todos.map((todo, index) => (
                <li key={todo.id || index}>
                    {typeof todo === 'object' ? (todo.text || 'No description') : todo}                    <button
                        onClick={() => handleDelete(todo.id, index)}
                        disabled={loading}
                    >
                        delete
                    </button>
                    <label>
                        <input type="checkbox" />Mark Completed
                    </label>
                </li>
            ))}
        </ul>
    );
}

export default TodoList;