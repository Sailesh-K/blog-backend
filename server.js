const express=require("express");
const mongoose=require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const cors=require("cors");
const cookieParser = require("cookie-parser");

const app=express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));


mongoose
.connect('mongodb+srv://guvi:guvi@blog.92eln.mongodb.net/')
.then(()=>{
    console.log("Connected");
})
.catch((err)=>{
    console.log("Error connecting to DB",err);
});

//console.log("process.env.DATABASE",process.env.DATABASE);

app.use("/api",routes);

const port = 3000;

app.listen(port,()=>{
    console.log(`Server running @ ${port}`);
});

