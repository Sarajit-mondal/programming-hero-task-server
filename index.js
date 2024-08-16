const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb

const uri = `mongodb+srv://${process.env.NAME}:${process.env.PASSWORD}@cluster0.yoh2y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
   // Get the database and collection on which to run the operation
   const db = client.db("AllProducts");
   const allProducts = db.collection("products");

  //  http://localhost:5000/AllProducts?limit=10&skip=30&priceSort=lowToHigh&priceRang=10-20&category=apple&search=searchValue
    app.get("/allProducts", async(req, res) => {
      try {

        const pageLimit = parseInt(req.query.limit)
        const pageSkip = parseInt(req.query.skip)
        const priceRang = req.query.priceRang
        const priceSort = req.query.priceSort
        const category = req.query.category
        const search = req.query.search
        console.log(pageLimit,pageSkip,priceRang,priceSort,category,search)
      
        // findCategory
        const categoryProducts = {category : category }


        // getproducts
        const result =await allProducts.find(categoryProducts).toArray()
        // leagth of products
        const totalProducts =await allProducts.countDocuments(categoryProducts)
        //send proudcts
        console.log(totalProducts)
        res.send(result)

        
      } catch (error) {
        res.send(error)
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// mongodb
app.get("/", (req, res) => {
  res.send("server is running ");
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
