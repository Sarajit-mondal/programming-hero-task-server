const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://programming-hero-task-d058d.web.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
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

    //  http://localhost:5000/AllProducts?limit=10&skip=30&currentPage=2&priceSort=lowToHigh&priceRang=10-20&category=apple&search=searchValue
    app.get("/allProducts", async (req, res) => {
      try {
        const pageLimit = parseInt(req.query.limit);
        const currentPage = parseInt(req.query.currentPage);
        const priceRang = req.query.priceRang;
        const priceSort = req.query.priceSort;
        const category = req.query.category;
        const search = req.query.search;

        // Search with title
        let searchTitle = {};
        if (search !== "undefined") {
          const searchQuery = new RegExp(search, "i");
          searchTitle = { title: { $regex: searchQuery } };
        }
        // findCategory
        let categoryProducts = {};
        if (category === "undefined" || category === "All") {
          console.log("All");
        } else {
          categoryProducts = { category: category };
        }
        // get PricerangeProducts
        let priceRangProducts = {};
        if (priceRang === "undefined") {
          let range = priceRang.split("-").map(Number);
          priceRangProducts = {
            $and: [{ price: { $gte: range[0] } }, { price: { $lt: range[1] } }],
          };
        }

        // sort products ascending order and desending order
        let sortWithPrice = {};
        if (priceSort != "undefined") {
          if (priceSort === "Low to High") {
            sortWithPrice = { price: 1 };
          } else if (priceSort === "High to Low") {
            sortWithPrice = { price: -1 };
          }
        }

        // getproducts
        const result = await allProducts
          .find(searchTitle, categoryProducts, priceRangProducts)
          .limit(pageLimit)
          .skip(currentPage * pageLimit)
          .sort(sortWithPrice)
          .toArray();

        // leagth of products
        const totalProducts = await allProducts.countDocuments(
          searchTitle,
          categoryProducts
        );

        //send proudcts
        console.log(totalProducts);
        res.send({ result, totalProducts });
      } catch (error) {
        res.send(error);
        console.log(error);
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("successfully connected to MongoDB!");
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
