const express = require("express")
const cors = require("cors")
const { MongoClient } = require("mongodb")
const bodyParser = require('body-parser');
const axios = require('axios')
const multer = require('multer');
const fs = require('fs');
var FormData = require('form-data');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './img');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });
const app = express()
app.use(cors())
// app.use(express.json())
// app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 3001;

const connectionString = "mongodb+srv://akashkamat:akashkamat10@mytestdb.ducrb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(connectionString);

client.connect();

const db = client.db("deepthought");
const collection = db.collection("events");

async function imgupload(req) {
    var form = new FormData();

    form.append("key", "7e60570fc00f7495c89ca030e9cf8dd6");
    form.append("image", fs.createReadStream(`./img/${req.file.filename}`), req.file.filename);

    axios({
        method: "post",
        url: "https://api.imgbb.com/1/upload",
        data: form,
    })
        .then(function (response) {
            //handle success
            console.log(response.data.display_url);
        })
        .catch(function (response) {
            //handle error
            console.log(response);
        });
}

app.get("/", (req, res) => {
    res.json("working")
})
app.post("/api/v3/app/events", upload.single('files'), async (req, res) => {
    try {
        console.log(req.body)
        res.json("added event");
        console.log(req.body)
        var newImg = fs.readFileSync(req.file.path);
        // encode the file as a base64 string.
        var encImg = newImg.toString('base64');
        const img = {
            img: Buffer(encImg, 'base64')
        };
        const event = Object.assign(req, body, img)
        await collection.insertOne(event);
    } catch (error) {
        console.log(error)
    }
});

app.listen(port, () => {
    console.log("server is up on port:", port)
})