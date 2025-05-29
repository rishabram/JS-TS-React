import React, { useEffect } from 'react'
import { useNotes } from '../context/NotesContext'

export default function SideBar() {
    const {allNotes, loadAllNotes, loadNote, createNote} = useNotes();

    useEffect(()=>{
        loadAllNotes();
    },[]);

    const handleCreateNote=()=>{
        createNote('New Note');
    }

    return (
        <div className="w-64 bg-white p-4 overflow-auto">

            <h2 className="text-lg font-bold mb-4">My Notes</h2>

            <button
                onClick={handleCreateNote}
                className="w-full bg-blue-500 text-white p-2 rounded mb-4">
                Create New Note
            </button>

            <div className="space-y-2">
                {allNotes.map(note => (
                    <div
                        key={note._id}
                        onClick={() => loadNote(note._id)}
                        className="p-2 bg-gray-100 border rounded cursor-pointer"
                    >
                        {note.title}
                    </div>
                ))}
            </div>
        </div>
    )
}
