const express=require("express");
const mongoose=require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const cors=require("cors");
const cookieParser = require("cookie-parser");

const app=express();


const corsOptions = {
    origin: 'https://master--blog-front-end-11.netlify.app', 
    credentials: true, 
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));


mongoose
.connect('mongodb+srv://guvi:guvi@cluster0.htuqr.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0')
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

