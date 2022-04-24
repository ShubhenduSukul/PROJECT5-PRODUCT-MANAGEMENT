const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')
const route = require("./routes/routes");
const mongoose = require('mongoose')
const app = express();

app.use(bodyParser.json()); //  global middlewares content type : application/json
app.use(bodyParser.urlencoded({extended: true}));  //  global middlewares
app.use(multer().any()) 

mongoose.connect("mongodb+srv://ShubhenduSukul:KuVlSGTp94VKKh7E@cluster0.pbil8.mongodb.net/Project-Shopping-Cart?authSource=admin&replicaSet=atlas-13oko1-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true", {useNewUrlParser: true})
.then(() => console.log('MongoDB is running on 3000'))
.catch(err => console.log((err)))

app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port '+ (process.env.PORT || 3000))
});