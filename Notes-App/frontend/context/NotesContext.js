import React, { createContext, useState, useContext } from 'react';


const NotesContext = createContext();
export const useNotes = () =>{
    return useContext(NotesContext);
}

export default function NotesParent({children}){
    const [currentNote, setCurrentNote] = useState(null)
    const [allNotes,setAllNotes] = useState([])

    const loadAllNotes = async() =>{
        const res = await fetch('http://localhost:5000/api/notes')
        if (!res.ok){ throw new Error('Error loading note!')}
        const data = await res.json();
        setAllNotes(data);

    }

    const loadNote = async(_id)=>{
        const res = await fetch(`http://localhost:5000/api/notes/${_id}`)
        if (!res.ok){ throw new Error('Error loading note!')}
        const data= await res.json();
        setCurrentNote(data);
    }
    const saveNote = async(noteToSave)=>{
        const isNewNote = !noteToSave._id
        const method = noteToSave._id ? 'PUT' : 'POST';
        const URL = noteToSave._id ? `http://localhost:5000/api/notes/${noteToSave._id}`
            :'http://localhost:5000/api/notes';
        try {
            const res = await fetch(URL, {
                method: method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({title: noteToSave.title, content: noteToSave.content})
            })
            if (!res.ok) {
                throw new Error("Error saving note!")
            }
            const savedNote = await res.json();
            if (isNewNote) {
                setAllNotes((prevNotes) => [...prevNotes, savedNote])
            } else {
                setAllNotes((prevNotes) => prevNotes.map(note => (note._id === savedNote._id) ? savedNote : note))
            }
            setCurrentNote(savedNote);
            return savedNote;
        }
        catch(error){throw new Error(`Error saving note:${error}`)}
    };
    const createNote = async(title)=>{
        const NoteWrapper= {title:title, content:''};
       return await saveNote(NoteWrapper);
    }
    const deleteNote = async(_id)=>{
        try {
            const res = await fetch(`http://localhost:5000/api/notes/${_id}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                throw new Error('Error deleting note!')
            }
            const deletedNote = await res.json()
            setAllNotes((prevNotes) => prevNotes.filter(note => note._id !== deletedNote._id))
            if (currentNote && deletedNote._id === currentNote._id) {
                setCurrentNote(null);
            }
        }
        catch(error){
            throw new Error(`Error saving note:${error}`);
        }
    }
    const contextValues ={
        currentNote,
        setCurrentNote,
        allNotes,
        setAllNotes,
        loadAllNotes,
        loadNote,
        saveNote,
        createNote,
        deleteNote
    }
    return(
        <NotesContext.Provider value={contextValues}>
            {children}
        </NotesContext.Provider>
    );
}