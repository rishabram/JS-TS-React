const { ObjectId } = require('mongodb')
const { getDB } = require('../config/db');

const findAll = async () =>{
    return await getDB().collection('notes').find({}).sort({ updatedAt: -1}).toArray();
};

const findById = async(id)=>{
    return await getDB().collection('notes').findOne({ _id: new ObjectId(id) });
};

const create = async (noteData)=>{
    const note = {...noteData,createdAt: new Date(), updatedAt:new Date()};

    const result = await getDB().collection('notes').insertOne(note);
    return { _id: result.insertedId, ...note };

};

const update = async(id,noteData)=>{
    const updatedNote = await getDB().collection('notes').findOneAndUpdate({_id: new ObjectId(id)}, { $set : { ...noteData, updatedAt: new Date() } },{ returnDocument : 'after' });
    return updatedNote;
}

const remove = async(id)=>{
    const note = await findById(id);
    if (note){
        await getDB().collection('notes').deleteOne({ _id: new ObjectId(id) });
    }
    return note;
};
module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
};
