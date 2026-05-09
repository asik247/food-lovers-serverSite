const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
//! mongodb run funk code;
async function run() {
    try {
        await client.connect();
        //! mydb & collection code;
        const myDB = client.db("food-lovers-networked");
        const myProducts = myDB.collection("products");
        //! products coll data post;
        app.post('/products', async (req, res) => {
            const allDatas = req.body;
            const result = await myProducts.insertOne(allDatas);
            res.send(result)
        })
        //! get all products usign get method;
        app.get('/products', async (req, res) => {
            const cursor = await myProducts.find().sort({ rating: -1 }).limit(6)
            const result = await cursor.toArray();
            res.send(result);
        })
        //! get specifiqe product usign id;
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:id};
            const result = await myProducts.findOne(query);
            res.send(result)
        })
        //!query using get data/email use and get data;
        app.get('/products',(req,res)=>{
            console.log(req.query.isAvailable);
        })











        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);
