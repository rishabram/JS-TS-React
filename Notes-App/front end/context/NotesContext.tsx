import React, { createContext, useState, useContext, useRef } from 'react';
import { Note, NotesContextType, EditedNoteState } from '../types';

const NotesContext = createContext<NotesContextType | undefined>(undefined);
export const useNotes = () =>{
    return useContext(NotesContext);
}
type NotesParentProps = {
    children: React.ReactNode;
};
export default function NotesParent({children}: NotesParentProps){
    const [currentNote, setCurrentNote] = useState<Note | null>(null)
    const [allNotes,setAllNotes] = useState<Note[]>([])

    function useDebounce<T extends any[]>(callback: (...args: T) => void, delay: number) {
        const timeoutRef = useRef<NodeJS.Timeout | null>(null)

       return function debouncedFunction(...args: T) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        };
    }
    const autoSaveNote = useDebounce((updatedNote:Note)=>{
        saveNote(updatedNote)
    },1000)
    const loadAllNotes = async() => {
        try {
            const res = await fetch('http://localhost:5000/api/notes')
            if (!res.ok){ throw new Error('Error loading notes!')}
            const data = await res.json();
            setAllNotes(data);
        } catch (error) {
            console.error("Failed to load notes:", error);
        }
    }

    const loadNote = async(_id:string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/notes/${_id}`)
            if (!res.ok){ throw new Error('Error loading note!')}
            const data = await res.json();
            setCurrentNote(data);
        } catch (error) {
            console.error("Failed to load note:", error);
        }
    }
    const saveNote = async(noteToSave: Partial<Note>) =>{
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
    const createNote = async(title: string)=>{
        const NoteWrapper= {title:title, content:''};
       return await saveNote(NoteWrapper);
    }
    const deleteNote = async(_id: string)=>{
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
            throw new Error(`Error deleting note: ${error}`);
        }
    }
    const contextValues:NotesContextType ={
        currentNote,
        setCurrentNote,
        allNotes,
        setAllNotes,
        loadAllNotes,
        loadNote,
        saveNote,
        createNote,
        deleteNote,
        autoSaveNote
    }
    return(
        <NotesContext.Provider value={contextValues}>
            {children}
        </NotesContext.Provider>
    );
}