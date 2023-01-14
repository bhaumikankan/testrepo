const router=require('express').Router();
const newsModel=require('../../db/models/News');
const multer  = require('multer');
const authcheck=require('../../middleware/userAuthcheck');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+file.originalname )
    }
  })
  
const upload = multer({ storage: storage })


//post news  
router.post('/create-news',upload.single('newsimage'),authcheck,async(req, res,next)=>{
    const{title,author,description,content} = req.body;
    const news= new newsModel({title:title,author:author,description:description,content:content,urlToimage:req.file.path,isApproved:false,withContent:true});
    try{
        await news.save();
        res.status(200).send({msg:"news successfully created"})
    }catch(err){
        res.status(500).send({err:"something went wrong"});
    }
})
//get all news or using limit
router.get('/allnews',async(req,res)=>{
 
    try{
        if(req.query.limit > 0){
            var data=await newsModel.find().sort({date:-1}).limit(req.query.limit);
        }else{
            var data=await newsModel.find().sort({date:-1});
        }
        res.status(200).send({news:data});
    }catch(err){
        res.status(500).send({err:"something went wrong"});
    }
})

module.exports = router;