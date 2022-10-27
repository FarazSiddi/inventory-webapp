// Dependencies
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const MongoClient = require("mongodb").MongoClient;

const app = express();
app.use(express.static(__dirname + "/public"));

app.use(cors());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbName = "finalExam";

const dbURL = "mongodb://localhost:27017/finalExam";

var db;

app.get("/", function (req, res) {
  console.log("home page");
  // Renders the Main Page
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// http://localhost:3000/inventory/part/list
// This is where the array of parts objects get stored for /inventory/part/list
app.get("/inventory/part/list", function (req, res) {
  console.log("parts database");

  partsCollection = db.collection("parts");

  partsCollection.find().toArray(function (err, result) {
    if (err) {
      return res.status(500).send(error);
    }

    res.send(result);
  });
});

// http://localhost:3000/inventory/part/list (OLD)
// app.get("/inventory/part/list", function (req, res) {
//   console.log("list all parts");

//   res.sendFile(path.join(__dirname, "public", "list.html"));
// });

// http://localhost:3000/inventory/part/add (OLD)
// app.get("/inventory/part/add", function (req, res) {
//   console.log("add part");

//   res.sendFile(path.join(__dirname, "public", "add.html"));
// });

// http://localhost:3000/inventory/part/add
app.post("/inventory/part/add", function (req, res) {
  console.log("insert part page");

  // Input Fields
  let name = req.body.name;
  let description = req.body.description;

  partsCollection = db.collection("parts");

  // Checks if the name and description fields were filled
  if (name && description) {
    const doc = { name: name, description: description };

    partsCollection = db.collection("parts");

    console.log(doc);

    partsCollection.insertOne(doc);
    res.redirect("/");
  } else {
    res.send("Please enter a part's name and its description");
  }
  res.end();
});

app.listen(3000, function () {
  console.log("Started middleware on port 3000");
  require("child_process").exec("open http://localhost:3000/");

  MongoClient.connect(dbURL, function (err, client) {
    if (err) {
      console.log("error encountered when connecting to database.");
      throw err;
    }
    db = client.db(dbName);

    // Check if the parts collection has been made yet. If not, it will create it.
    db.listCollections({ name: "parts" }).next(function (err, collinfo) {
      if (!collinfo) {
        db.createCollection("parts", function (err, res) {
          if (err) throw err;
          console.log("Collection created");
        });
      }
    });
    console.log("Connected to MongoDB");
  });
});
