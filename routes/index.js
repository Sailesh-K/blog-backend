const express=require("express");
const User=require("../models/user");
const Post=require("../models/post");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const fs=require('fs');
const cookieParser = require("cookie-parser");
const multer=require("multer");
const uploadMiddleware=multer({dest:'uploads/', limits: { fileSize: 10 * 1024 * 1024 }});
const router=express.Router();

router.use(cookieParser());

const secret='GIGITY';

const genToken=(user)=>{
    return jwt.sign({username:user.username,id:user._id},secret,{
        expiresIn:"24h"
    });
};

router.post('/register',async (req,res)=>{
    try{
        const {username,email,password}=req.body;
        const hashedPass=await bcrypt.hash(password,10);
        const user=new User({username,email,password:hashedPass});
        await user.save();
        const token=genToken(user);
        return res.status(200).cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',}).json({
            id:user._id,
            username:user.username
        });
    }
    catch(error){
        res.status(404).json({error:error.message});
    }
});

router.post('/login',async (req,res)=>{
    try{
        const {email,password}=req.body;
        const user= await User.findOne({email});
        if(!user){
            return res.status(404).send("User not found!");
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
           return res.status(400).send("Incorrect Password!");
        }
        const token= genToken(user);
        return res.status(200).cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',}).json({
            id:user._id,
            username:user.username
        });
    }
    catch(error){
        res.status(400).send(error);
    }
});

router.get('/test',async (req, res) => {
    const {token}=req.cookies;
    if(!token){
        return res.status(401).json({ error: "No token provided" });
    }
    jwt.verify(token,secret,{},(err,info)=>{
        if (err) {
            return res.status(403).json({ error: "Token is invalid" });
        }
        res.json(info);
    })
  });

router.post('/logout',(req,res)=>{
   return res.cookie('token','').json('ok');
})

router.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
    const {originalname,path}=req.file;
    const parts=originalname.split('.');
    const ext=parts[parts.length-1];
    const newPath=path+'.'+ext;
    fs.renameSync(path,newPath);

    const {token}=req.cookies;
    jwt.verify(token,secret,{},async (err,info)=>{
        if (err) throw err;
        const {title,summary,content}=req.body;
        const post= new Post({
            title,
            summary,
            content,
            cover:newPath,
            author:info.id,
        });
        await post.save();
        res.status(200).json(post);
    })
});

router.get('/post',async (req,res)=>{
    res.json(
        await Post.find()
        .populate('author',['username'])
        .sort({createdAt:-1})
        .limit(20)
    );
});

router.get('/post/:id',async (req,res)=>{
    const {id}=req.params;
    const post=await Post.findById(id).populate('author',['username']);
    res.json(post);
})

router.put('/post/:id',uploadMiddleware.single('file'),async (req,res)=>{
    let newPath=null;
    if(req.file){
        const {originalname,path}=req.file;
        const parts=originalname.split('.');
        const ext=parts[parts.length-1];
        newPath=path+'.'+ext;
        fs.renameSync(path,newPath);
    }

    const {token}=req.cookies;
    jwt.verify(token,secret,{},async (err,info)=>{
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        const {id}=req.params;
        const {title,summary,content}=req.body;
        try {
            const post = await Post.findById(id);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            const isAuthor = JSON.stringify(post.author) === JSON.stringify(info.id);
            if (!isAuthor) return res.status(403).json({ message: 'You are not the author' });

            post.title = title;
            post.summary = summary;
            post.content = content;
            if (newPath) post.cover = newPath;

            await post.save();
            res.status(200).json(post);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }); 
});

router.delete('/post/:id', async (req, res) => {
    const { id } = req.params; 
    const { token } = req.cookies; 
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            return res.status(403).json({ error: "Token is invalid" });
        }

        try {
            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            const isAuthor = JSON.stringify(post.author) === JSON.stringify(info.id);
            if (!isAuthor) {
                return res.status(403).json({ error: "You are not authorized to delete this post" });
            }
            await Post.findByIdAndDelete(id);
            return res.status(200).json({ message: "Post deleted successfully" });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    })
})

router.post('/post/:id/like',async (req,res)=>{
    const {id}=req.params;
    const {like}=req.body;

    try {
        const post = await Post.findById(id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (like) {
            post.likes += 1;
        } else {
            post.likes -= 1;
        }

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

module.exports=router;
