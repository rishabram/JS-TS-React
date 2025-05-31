import express, { Request, Response } from 'express';
const router = express.Router();
import { ObjectId } from 'mongodb'
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
router.get('/:id', async (req, res: Response) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            res.status(404).json({ message: 'Note not found' });
            return
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving note' });
    }
});

router.post('/', async (req: Request,res)=>{
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
        if (!note) {
            res.status(404).json({msg: 'Note not found'});
            return
        }
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
            res.status(404).json({msg: 'Note not found'});
            return
        }
        res.json(note);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
