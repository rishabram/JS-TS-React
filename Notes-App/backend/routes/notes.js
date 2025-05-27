const express = require('express');
const router = express.Router();
const Note = require('../models/note')

router.get('/', async (req,res)=>{
    try{
        const notes = await Note.findAll();
        res.json(notes);
    }
    catch(error){
        console.error(error);
        res.status(500).send("Server Error")
    }
});
router.get('/:id', async (req,res)=>{
    try{
        const note = await Note.findById(req.params.id)
        if (!note){
            return res.status(404).json({ msg: 'Note not found' });
        }
        return res.json(note);
    }
    catch (err){
        console.error(err);
        res.status(500).send("Server Side Error");
    }
});
router.post('/', async (req,res)=>{
    try{
        const { title, content } = req.body;
        const newNote = await Note.create({ title, content: content || ''})
        res.json(newNote);
    }
    catch (err){
        console.error(err);
        res.status(500).send('Server Error:')
    }
})
router.put('/:id', async (req,res)=>{
    try{
        const { title, content } = req.body;
        const note = await Note.update(req.params.id, { title, content });
        res.json(note);
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.remove(req.params.id);
        if (!note) {
            return res.status(404).json({msg: 'Note not found'});
        }
        res.json(note);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
