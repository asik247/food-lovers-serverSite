const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//?firebase admin;
const admin = require("firebase-admin");
//!JWT admin✔️✔️
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;
const app = express();
//Todo: middleware code;
app.use(cors())
app.use(express.json())
//Todo: root apis code;
app.get('/', (req, res) => {
    res.send('root api here')
})
//Todo: listiner code;
app.listen(port, () => {
    console.log(`This server ruining in port:${port}`);
})
//! mongodb uri code;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdzc9ua.mongodb.net/?appName=Cluster0`;
//! Create a MongoClient;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
//Todo:firebase relative;
const serviceAccount = require("./food-lovers-network-key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
//?Veryfiy firebase Token;
// const verifyFireBaseToken = async (req, res, next) => {
//     // console.log('Headder:-',req.headers);
//     const authorzed = req.headers.authorization;
//     if (!authorzed) {
//         return res.status(401).send({ message: 'unauthorized access' })
//     }
//     const token = authorzed.split(' ')[1]
//     // console.log(token);
//     if (!token) {
//         return res.status(401).send({ message: 'unauthorzed access' })
//     }
//     try {
//         const decoded = await admin.auth().verifyIdToken(token);
//         // console.log(decoded);
//         req.validEmail = decoded.email;
//         next()
//     } catch {
//         return res.status(401).send({ message: 'unauthorzed access' })
//     }

// }
//?VEryfi Firebase Token2;
const verifyFireBaseToken2 = async (req, res, next) => {
    const authorized = req.headers.authorization;
    if (!authorized) {
        return res.status(401).send({ message: 'unauthorization access' })
    }
    const token = authorized.split(' ')[1];
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        // console.log(decoded);
        req.validEmail = decoded.email
        next()
    }
    catch {
        return res.status(401).send({ message: 'unauthorzed access' })
    }
}
//? JWT Token Verify code here✔️✔️
const jwtTokenVerify = async (req, res, next) => {
    // console.log('jwt token in verfify code',req.headers.authorization);
    const author = req.headers.authorization;
    if (!author) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = author.split(' ')[1]
    // console.log('token here',token);
    jwt.verify(token, process.env.JWT_SECURITE, (error, decoded) => {
        if (error) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.tokenEmail = decoded.email
        next()
    })
}
//! mongodb run funk code;
async function run() {
    try {
        await client.connect();
        //! mydb & collection code;
        const myDB = client.db("food-lovers-networked");
        const myProducts = myDB.collection("products");
        const totalReviews = myDB.collection("allReviews");
        const createNewFoods = myDB.collection("creatNewFood");
        const allFevoritesReviews = myDB.collection("favoritesReviewsColl")
        //Todo:JWTToken generate apis✔️✔️
        app.post('/getJWTToken', (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.JWT_SECURITE, { expiresIn: '1h' })
            res.send({ token: token })
        })
        //!favoritesReviews post in db;
        app.post('/favoritesReviewsColl', async (req, res) => {
            // console.log(req.body);
            const allReviews = req.body;
            const result = await allFevoritesReviews.insertOne(allReviews)
            res.send(result)

        })
         //!favoritesReviews get in db;
         //!favoritesReviews get query using email;
        app.get('/favoritesReviewsColl',async (req,res)=>{
            const emailQuery = req.query.email;
            console.log(emailQuery);
            const query = {};
            if(emailQuery){
                query.userEmail = emailQuery
            }
            const cursor = allFevoritesReviews.find(query).sort({addedAt:-1})
            const result = await cursor.toArray();
            res.send(result)
        })
        //?favoritesReviews delete;
        app.delete('/favoritesReviewsColl/:id',async (req,res)=>{
            const id = req.params.id;
            console.log(id);
        })
        //? creatNewFood post db data;
        app.post('/creatNewFood', verifyFireBaseToken2, async (req, res) => {
            const newData = req.body;
            const result = await createNewFoods.insertOne(newData);
            res.send(result)
            // console.log(req.headers.authorization);
            // console.log(newData);
        })
        //! products coll data post;
        app.post('/products', async (req, res) => {
            const allDatas = req.body;
            const result = await myProducts.insertOne(allDatas);
            res.send(result)
        })
        //! get all products usign get method;
        // app.get('/products', async (req, res) => {
        //     const cursor = await myProducts.find()
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })
        //! get specifiqe product usign id;
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await myProducts.findOne(query);
            res.send(result)
        })
        //! delete using id;
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await myProducts.deleteOne(query);
            res.send(result)
        })
        //! update using patch;
        app.patch('/products', async (req, res) => {
            const id = req.params.id;
            const newInfo = req.body
            const query = { _id: new ObjectId(id) };
            const updateUser = {
                $set: {
                    price: newInfo.price
                }
            }
            const result = await myProducts.updateOne(query, updateUser)
            res.send(result)

        })
        //!query using get data/email use and get data;
        app.get('/products', async (req, res) => {
            const emails = req.query.email
            const query = {};
            if (emails) {
                { query.email = emails }
            }
            const cursor = myProducts.find(query).sort({ rating: -1 }).limit(6)
            const result = await cursor.toArray();
            res.send(result)
        })
        //Todo: all reviews relaive apis hre;
        app.post('/allReviews', async (req, res) => {
            const allData = req.body;
            // console.log(allData);
            const result = await totalReviews.insertOne(allData)
            res.send(result)
        })
        //?id usign get;
        app.get('/allReviews/:id', verifyFireBaseToken2, async (req, res) => {
            // console.log('headder',req.headers.authorization);
            const id = req.params.id;
            // console.log(id);
            const query = { productId: id };
            const cursor = await totalReviews.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        //?Remove review;
        app.delete('/allReviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await totalReviews.deleteOne(query);
            res.send(result);
        });
        //?Update MyREviews;
        app.patch('/allReviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log('client side id:', id);
            const updateData = req.body;
            const query = { _id: new ObjectId(id) };
            const updateNewFood = {
                $set: {
                    addReview: updateData.addReview
                }
            }
            const result = await totalReviews.updateOne(query, updateNewFood);
            res.send(result)

        })
        //?simple get method allReviews;
        app.get('/allReviews', async (req, res) => {
            const cursor = await totalReviews.find().sort({ createdAT: -1 })
            const result = await cursor.toArray();
            res.send(result)
        })
        //?Query get allReviews in jwt verfiy token✔️✔️
        app.get('/myReviews', verifyFireBaseToken2, async (req, res) => {
            const em = req.query.email;
            if (req.validEmail !== em) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const query = {};
            if (em) {
                query.foodEmail = em;
            }
            const cursor = totalReviews.find(query).sort({ createdAT: -1 })
            const result = await cursor.toArray();
            res.send(result);
        });












        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);
