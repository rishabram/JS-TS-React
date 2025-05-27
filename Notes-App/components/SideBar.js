import React, { useEffect } from 'react'
import { useNotes } from '../context/NotesContext'

export default function SideBar() {
    const {allNotes, loadAllNotes, loadNote, createNote} = useNotes();

    useEffect(()=>{
        loadAllNotes();
    },[]);

    const handleCreateNote=()=>{
        createNote('My New Note');
    }
    return (
        <div className='sidebar'>
            <h2>My Notes</h2>
            <button onClick={handleCreateNote}>Create New Note</button>
            <div className='Notes-List'>
                {allNotes.map(note=>(
                    <div key={note._id} className='Note-Item' onClick={()=>loadNote(note._id)}>
                        {note.title}
                    </div>
                ))}
            </div>
        </div>
    )
}