const express = require('express');
const noteRouter = express.Router();
const zod = require('zod');
const Note = require('../models/noteModel.js');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const noteBody=zod.object({
    title:zod.string(),
    description:zod.string()
})

const noteUpdatedBody = zod.object({
    title:zod.string().optional(),
    description:zod.string().optional()
})

const addNote = async(req, res) => {
    try{
        const {success} = noteBody.safeParse(req.body);
        if(!success){
            res.json({
                message:"Fill the form"
            })
            return
        }
    
        // Extracting userId from the token
        const token = req.headers.authorization.split(' ')[1];
        // console.log(token)
        const decodedToken = jwt.verify(token, SECRET_KEY);
        // console.log(decodedToken)
        const userId = decodedToken.userId;

        const {title, description} = req.body;
    
        const noteCreated = await Note.create({
            userId,
            title,
            description
        })

        res.json({
            message:"Note created successfully",
            noteCreated,
            success:true
        })
        return
    }catch(error){
        res.json({
            message:error.message,
            success:false
        })
        return
    }
}

const showNotes = async(req, res) => {
    try{
        // Extracting the userId from the token which are present in header
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, SECRET_KEY);
        const userId = decodedToken.userId;

        // Now find all the notes in Note model 
        const notes = await Note.find({userId})
        // .toArray(function(error, notes) {
        //     if (error){
        //         res.json({
        //             message:err.message
        //         })
        //     }
        
        //     res.json({
        //         notes
        //     })
        // });

        // console.log("vinesh")

        res.json({
            message:"Here are the all notes present of the given userId",
            notes,
            success:true
        })
        return

    }catch(error){
        res.json({
            message:error.message,
            success:false
        })
        return
    }
}

const updateNote = async(req, res) => {
    try{
        // console.log(req.body)
        const {success} = noteUpdatedBody.safeParse(req.body);
        if(!success){
            res.json({
                message:"fields are required"
            })
            return
        }
        const id = req.headers.id;
        const {title, description} = req.body
        const updateFields = {};

        if (title !== undefined && title !== '') {
            updateFields.title = title;
        }

        if (description !== undefined && description !== '') {
            updateFields.description = description;
        }


        const updatedNote = await Note.updateOne({_id:id},{
            $set:updateFields
        } )

        res.json({
            message:"Note has been updated",
            success:true,
            updatedNote
        })
        // return

    }catch(error){
        res.json({
            message:error.message,
            success:false
        })
        return
    }
}

const deleteNote = async(req, res) => {
    try{
        await Note.deleteOne({_id:req.headers.id})
        res.json({
            success:true,
            message:"This note has been deleted successfully"
        })
        return
    }catch(error){
        res.json({
            success:false,
            message:error.message
        })
        return
    }
}

noteRouter
    .route('/')
    .post(addNote)
    .get(showNotes)
    .put(updateNote)
    .delete(deleteNote)

module.exports = {
    noteRouter
}    

