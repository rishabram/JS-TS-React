import React, {useState, useEffect
} from 'react'
import { useNotes } from '../context/NotesContext'
import { Note, NotesContextType, EditedNoteState } from '../types';




export default function Page(): React.ReactElement {
    const { currentNote, autoSaveNote, deleteNote } = useNotes() as NotesContextType;
    const [editedNote,setEditedNote] = useState<EditedNoteState>({title: '', content: ''})

    useEffect(()=>{
        if(currentNote){
            setEditedNote({title:currentNote.title, content:currentNote.content})
        }
        else{
            setEditedNote({title: '', content: ''})
        }
    },[currentNote])

    if (!currentNote) {
        return(
        <div className="flex-1 flex items-center justify-center">
            Select a note or create a new one
        </div>
        ); }

    return(
        <div className="p-4 flex-1 flex flex-col">
            <div className="flex mb-4">
            <input value={editedNote.title} onChange={(e)=>{
                const newTitle = e.target.value;
                setEditedNote(prev => ({...prev, title: newTitle}));
                if (currentNote){
                    autoSaveNote({...currentNote, title: newTitle, content: editedNote.content})
                }
            }} className="p-2 flex-1 border-b"
            />
            <button onClick={()=>deleteNote(currentNote._id)} className="bg-red-500 text-white p-2 ml-2 rounded"
            >Delete</button>
            </div>
            <textarea
                value={editedNote.content}
                onChange={(e) => {
                    const newContent = e.target.value;
                    setEditedNote(prev => ({...prev, content: newContent}));
                    if (currentNote) {
                        autoSaveNote({...currentNote, title: editedNote.title, content: newContent});
                    }
                }} className="flex-1 p-2 border rounded"

            />
        </div>
    )

}