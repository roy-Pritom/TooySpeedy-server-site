const express = require('express');
const app = express();
require('dotenv').config()

const port = process.env.PORT || 5000;
const cors = require('cors')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ow3zltf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //  await client.connect();

    const carsGallery = client.db('carGalleryDb').collection('cars')
    // gallery 
    app.get('/carGallery', async (req, res) => {
      const result = await carsGallery.find().toArray();
      res.send(result);
    })




    // toys
    const carsCollection = client.db('toyCarDB').collection('toyCar')


    // indexing
    const indexKey={toyName:1};
    const indexOption={name:"toyName"};

    const result= carsCollection.createIndex(indexKey,indexOption);

    app.get('/toySearch/:text',async(req,res)=>{
      const text=req.params.text;
      // console.log(text);
      const result=await carsCollection.find({
        $or:[
          {
            toyName:{$regex:text,$options:"i"}
          }
        ]

      }).toArray();
      res.send(result);
    })


    app.post('/postToy', async (req, res) => {
      const carData = req.body;
      // console.log(carData);
      if (!carData) {
        return res.status(404).send({ message: "carData not Found" })
      }
      const result = await carsCollection.insertOne(carData);
      res.send(result);
    })

    app.get('/allToys', async (req, res) => {
      const result = await carsCollection.find({}).limit(20).toArray();
      res.send(result)
    })

    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await carsCollection.findOne(query)
      res.send(result)
    })

    app.get('/allToys/:text', async (req, res) => {
      // const text=req.body.text;
      const result = await carsCollection.find({ subCategory: req.params.text }).toArray();
      res.send(result)
    })



    app.get('/myToys/:email', async (req, res) => {
      // console.log(req.params.email);
      const sort=req?.query?.sort===true?1:-1

      const result = await carsCollection.find({ email: req.params.email }).sort({price:sort}).toArray();
      res.send(result);
    })


    app.patch('/myToys/:id', async (req, res) => {
      const user = req.body;
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateUser = {
        $set: {
          price: user.price,
          quantity: user.quantity,
          description:user.description
        }
      }
      const result = await carsCollection.updateOne(filter, updateUser, options)
      res.send(result);
    })


    app.delete('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) }
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send("assignment-11 server site running");
})

app.listen(port, () => {
  console.log(`server running on port ${port}`);
})
