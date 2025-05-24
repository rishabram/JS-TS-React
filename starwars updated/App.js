import { useState } from "react";

function App() {
  const URL = "https://akabab.github.io/starwars-api/api/all.json";
  const [roster, setRoster] = useState([]);

  async function handleAdd() {
    const res = await fetch(URL);
    const data = await res.json();
    const newChars = data.filter((char) => !roster.some(character => character.name === char.name));
    const index = Math.floor(Math.random() * newChars.length);
    const char = newChars[index];
    console.log(data)

    const res1 = await fetch('http://localhost:5000/api/starwars', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name: char })
    })
    const data1 = await res1.json();
    setRoster([...roster, data1]);
    console.log(roster);
  }

  async function handleDelete(id) {
      try {
          await fetch(`http://localhost:5000/api/starwars/${id}`, {
              method: 'DELETE'
          });
          setRoster(roster.filter(char => char.id !== id));
      } catch (error) {
          console.error("Error deleting character:", error);
      }
  }

  return (
      <div>
        <h1>Star Wars</h1>
        <button onClick={handleAdd}>Click for Random Star Wars Character</button>
        <h2>Characters: </h2>
        <ul>
          {roster.map((char) => (
              <li
                  key={char.id}
                  onClick={() => handleDelete(char.id)}
              >
                {char.name}
              </li>
          ))}
        </ul>
      </div>
  );
}

export default App;