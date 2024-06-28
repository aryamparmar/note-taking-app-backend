const express = require('express');
const routes = express.Router();
const {userRouter} = require('./userRoutes')
const {noteRouter} = require('./noteRoutes')

routes.use('/user', userRouter);
routes.use('/notes', noteRouter);


module.exports = {
    routes
}