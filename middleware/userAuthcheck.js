const userModel = require('../db/models/User');
const jwt = require('jsonwebtoken');

module.exports = async(req,res,next)=>{
      const token=req.headers['x-auth-token'];
      if(!token){
          res.status(401).send({err:"unauthorized access "});
      }

      try{
        var decoded=jwt.verify(token,'xgFcTqBH9e');
      }catch(err){
        res.status(401).send({err:"unauthorized access "});
      }

      var user=await userModel.findOne({email:decoded.data.email}).exec();
          if(!user){
          res.status(401).send({err:"unauthorized access "});
    }
      
      if(token&&decoded&&user){
          next();
      }
}