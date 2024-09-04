const express=require("express");
const mongoose=require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const cors=require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const app=express();

const corsOptions = {
    origin: 'https://master--blog-front-end-11.netlify.app', 
    methods:["GET","PUT","POST","DELETE"],
    credentials: true, 
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));


mongoose
.connect(process.env.DB_URI)
.then(()=>{
    console.log("Connected");
})
.catch((err)=>{
    console.log("Error connecting to DB",err);
});


app.use("/api",routes);

const port = 3000;

app.listen(port,()=>{
    console.log(`Server running @ ${port}`);
});

