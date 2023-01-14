const router=require('express').Router();
const userModel = require('../../db/models/User');
const bcrypt=require('bcrypt');
const saltRounds = 10;
const jwt=require('jsonwebtoken');
const nodemailer = require('nodemailer');

//config nodmailer 
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
       user: 'ankanbhaumik812.hitcseaiml2020@gmail.com',
       pass: 'ankan@1234',
    },
});

//register user
router.post('/register',async(req,res)=>{
    const {username,email,password} = req.body;
    const hash = bcrypt.hashSync(password, saltRounds);
    const user=new userModel({username:username,email:email,password:hash});
    try{
        const useremailExist=await userModel.findOne({email: email}).exec();
        const usernameExist=await userModel.findOne({username: username}).exec();
        if (useremailExist) {
            return res.status(409).send({ 
                  message: "Email is already in use."
            });
        }
        if (usernameExist) {
            return res.status(409).send({ 
                  message: "username is already in use."
            });
        }
        //save user
        user.save();
        //verification key
        const verificationToken=jwt.sign({
            data: {email:email}
          }, 'xgFcTqBH9e', { expiresIn: '1h' });
        const url = `http://localhost:3000/user/auth/verify/${verificationToken}`  

        //send verification email  
        transporter.sendMail({
            to: email,
            subject: 'Verify Account',
            html: `Click <a href = '${url}'>here</a> to confirm your email.`
          })

        return res.status(201).send({msg: `Sent a verification email to ${email}`})  

    }catch(err){
        res.status(500).send({err:"something went wrong"});
    }

})

//verify user
router.get('/verify/:token',async(req, res) => {
    const { token } = req.params
    
    if (!token) {
        return res.status(422).send({ 
             message: "Missing Token" 
        });
    }

    let payload = null
    try {
        payload = jwt.verify(
           token,
           'xgFcTqBH9e'
        );
    } catch (err) {
        return res.status(500).send(err);
    }

    try{
        const user = await userModel.findOne({ email: payload.data.email }).exec();
        if (!user) {
           return res.status(404).send({ 
              message: "User does not  exists" 
           });
        }
        user.isVerified = true;
        await user.save();

        res.status(200).send({msg:'account verified'});

     } catch (err) {
        return res.status(500).send(err);
     }

})


//login user

router.post('/login',async(req, res)=>{
    const {email,password} = req.body;
    try{
        const user = await userModel.findOne({ email }).exec();
        if (!user) {
             return res.status(404).send({ 
                   message: "Invalid credentials" 
             });
        }

        if(!user.isVerified){
             return res.status(403).send({ 
                   message: "account is not verified" 
             });
        }

        if(!bcrypt.compareSync(password,user.password)){
            return res.status(404).send({ 
                message: "Invalid credentials" 
          });
        }

        const token=jwt.sign({
            data: {email:email}
          }, 'xgFcTqBH9e');

        res.header('x-auth-token', token).send({msg:'Login Successful...'});

    }catch (err) {
        res.status(500).send({err:"something went wrong"});
    }
})

module.exports ={
    router:router,
    transporter: transporter
};