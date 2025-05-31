import { ObjectId, Collection } from 'mongodb';
import { getDB } from '../config/db';

export interface Note {
    _id?: string | ObjectId;
    title: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}
const findAll = async (): Promise<Note[]> =>{
    return await getDB().collection('notes').find({}).sort({ updatedAt: -1}).toArray();
};

const findById = async(id:string): Promise<Note | null>=>{
    return await getDB().collection('notes').findOne({ _id: new ObjectId(id) });
};

const create = async (noteData: Omit<Note, '_id'>):Promise<Note>=>{
    const note = {...noteData,createdAt: new Date(), updatedAt:new Date()};

    const result = await getDB().collection('notes').insertOne(note);
    return { _id: result.insertedId, ...note };

};

const update = async (id:string, noteData:Partial<Note>):Promise<Note | null> => {

        const result = await getDB().collection('notes').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...noteData, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

       return result
};


const remove = async(id:string)=>{
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
