const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyPerser = require('body-parser');
const mongoose = require('mongoose');

const productRouter = require('./api/routes/products');
const oderRouter = require('./api/routes/orders');
const userRouter = require('./api/routes/user');

mongoose.connect('mongodb://localhost:27017/myShop');
mongoose.Promise = global.Promise

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyPerser.urlencoded({ extended: false }));
app.use(bodyPerser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization ');
    if(req.method === "OPTIONS"){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({})
    }
    next();
})

app.use('/products', productRouter);
app.use('/orders', oderRouter);
app.use('/user',userRouter);


app.use((req, res, next) => {
    const error = new Error('Not Found');
    res.status(404);
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })

})

module.exports = app;