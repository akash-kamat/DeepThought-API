const express = require("express")
const cors = require("cors")
const { MongoClient, ObjectId } = require("mongodb")

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
const port = process.env.PORT || 3000;

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
        var newImg = fs.readFileSync(req.file.path);
        var encImg = newImg.toString('base64');
        const img = {
            file: Buffer.from(encImg, 'base64')
        };
        const event = Object.assign(req.body, img)
        const inserted = await collection.insertOne(event);
        res.json(inserted.insertedId);
    } catch (error) {
        console.log(error)
    }
});
app.put("/api/v3/app/events", upload.single('files'), async (req, res) => {
    try {

        var newImg = fs.readFileSync(req.file.path);
        var encImg = newImg.toString('base64');
        const img = {
            file: Buffer.from(encImg, 'base64')
        };
        const event = Object.assign(req.body, img)
        const inserted = await collection.insertOne(event);
        res.json(inserted.insertedId);
    } catch (error) {
        console.log(error)
    }
});
app.get("/api/v3/app/events", async (req, res) => {
    try {
        const eventId = req.query.id
        if (eventId) {
            const data = await collection.findOne(ObjectId(eventId))
            if (data == null) {
                res.json("event not found")
            } else {
                res.json(data)
            }

        }
        else {
            const limit = parseInt(req.query.limit)
            const skip = parseInt(req.query.page)
            const data = await collection.find().limit(limit).skip((limit * skip) - limit)
            data.forEach(doc => {
                console.log(doc)
            })
            res.json("done")
        }
    } catch (error) {
        console.log(error)
    }
})
app.delete("/api/v3/app/events/:id", async (req, res) => {
    try {
        const eventId = req.params.id
        collection.deleteOne({ "_id": ObjectId(eventId) })
        res.json(`deleted event ${eventId}`)
    } catch (error) {
        console.log(error)
    }
})

app.listen(port, () => {
    console.log("server is up on port:", port)
})