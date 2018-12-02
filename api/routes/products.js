const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middlewar/check-auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

// const fileFilter = (req, file, cd) => {
//     if(file.mimetype === 'image/jpen' || file.mimetype === 'image/png'){
//         cd(null, true)
//     }else{
//         cd(null,false)
//     }
// };

const upload = multer({
    storage:storage,
    // limits:{
    //     fileSize: 1024 * 1024 *5
    // },
   // fileFilter:fileFilter
})

//const upload = multer({ storage: storage });

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product
        .find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                product: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc.id,

                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })

            }
            res.status(200).json(response)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

router.post('/',checkAuth, upload.single('productImage'), (req, res, next) => {

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    })
    product
        .save()
        .then(result => {
            console.log(result)
            res.status(201).json({
                message: "Created product sucesfully",
                creatProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result.id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });

});

router.get('/:productsId', (req, res, next) => {
    const id = req.params.productsId;
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            console.log("Form Database", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products'
                    }
                })
            } else {
                res.status(404).json({ message: 'no valid entry found provided id' })
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
});
router.patch('/:productsId', (req, res, next) => {
    const id = req.params.productsId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product Updated',
                url: 'http://localhost:3000/products/' + id
            })

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:productsId', (req, res, next) => {
    const id = req.params.productsId;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product Delete",
                request: {
                    type: "POST",
                    url: 'http://localhost:3000/products',
                    body: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

module.exports = router;