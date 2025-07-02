const { getDB } = require('../database');
const { ObjectId } = require('mongodb');

async function getAllRecipes(req,res){
    try{
        const db = getDB();
        const recipes = await db.collection('recipes').find({}).toArray();
        res.json(recipes)
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}
async function getRecipeById(req,res){
    try{
        const id = new ObjectId(req.params.id)
        const recipe = await getDB().collection('recipes').findOne({_id: id})
        if (!recipe){
            return res.status(404).json({ error: "Unable to find recipe" });
        }
        return res.json(recipe)
    }
    catch(error){ res.status(500).json({ error: error.message });}
}
async function createRecipe(req, res) {
    try {
        const recipeData = req.body;
        if (!recipeData || !recipeData.name || !Array.isArray(recipeData.ingredients)) {
            return res.status(400).json({ error: "Invalid recipe data" });
        }
        recipeData.createdAt = new Date();
        recipeData.updatedAt = new Date();
        const result = await getDB().collection('recipes').insertOne(recipeData);
        const createdRecipe = await getDB().collection('recipes').findOne({ _id: result.insertedId });
        res.status(201).json(createdRecipe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function updateRecipe(req, res) {
    try {
        const id = new ObjectId(req.params.id);
        const updateData = req.body;
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No update data provided" });
        }
        updateData.updatedAt = new Date();
        const result = await getDB().collection('recipes').findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        if (!result.value) {
            return res.status(404).json({ error: "Recipe not found" });
        }
        res.json(result.value);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function remove(req, res) {
    try {
        const id = new ObjectId(req.params.id);
        const recipe = await getDB().collection('recipes').findOne({ _id: id });
        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        const result = await getDB().collection('recipes').deleteOne({ _id: id });

        if (result.deletedCount === 1) {
            return res.status(200).json({ message: "Recipe deleted successfully" });
        } else {
            return res.status(500).json({ error: "Failed to delete recipe" });
        }
    }
    catch(error){}
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    remove,
    updateRecipe
};
