import React, {useState, useEffect} from 'react'
import { useNotes } from '../context/NotesContext'

export default function Page(){
    const { currentNote, saveNote, deleteNote } = useNotes();
    const [editedNote,setEditedNote] = useState({title: '', content: ''})

    useEffect(()=>{
        if(currentNote){
            setEditedNote({title:currentNote.title, content:currentNote.content})
        }
        else{
            setEditedNote({title: '', content: ''})
        }
    },[currentNote])
    const handleSave = () =>{
        if (currentNote){
            saveNote({...currentNote,title:editedNote.title,content:editedNote.content})
        }
    }
    if (!currentNote) {
        return <div>Select a note or create a new one</div>
    }

    return(
        <div className='page'>
            <input value={editedNote.title} onChange={(e)=>setEditedNote({...editedNote,title:e.target.value})}/>
            <button onClick={handleSave}>Save</button>
            <button onClick={()=>deleteNote(currentNote._id)}>Delete</button>
            <textarea
                value={editedNote.content}
                onChange={(e)=>setEditedNote({...editedNote,content:e.target.value})}
            />
        </div>
    )

}