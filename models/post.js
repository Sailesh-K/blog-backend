const mongoose=require("mongoose");

const postSchema= new mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    summary:{
        type:String,
        require:true
    },
    content:{
        type:String,
        require:true
    },
    cover:{
        type:String,
        require:true
    },
    author:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    likes:{
        type:Number,
        default:0,
    }

},
{
    timestamps:true
}
);

const post=mongoose.model("Post",postSchema);

module.exports=post;