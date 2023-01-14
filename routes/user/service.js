const router=require('express').Router();
const transporter=require('./auth').transporter;
const https=require('https');
const client = require('@mailchimp/mailchimp_marketing');

router.post("/sendMail",(req,res)=>{
    const{name,email,subject,message}=req.body;

    const mail = {
        from: name,
        to: 'ankanbhaumik812.hitcseaiml2020@gmail.com',
        subject: subject,
        text: `${name} <${email}> \n${message}`,
    };

    transporter.sendMail(mail, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send({msg:"Something went wrong."});
        } else {
          res.status(200).send({msg:"Email successfully sent to recipient!"});
        }
      });
})

//listid=55a44b61a9
//apikey=5718066b1d07de48d5ea40b7e874c784-us14
router.post('/subscribe',async(req,res)=>{
    const{email} = req.body;
    
    client.setConfig({
      apiKey: "5718066b1d07de48d5ea40b7e874c784-us14",
      server: "us14",
    });

    try{
      const response = await client.lists.addListMember("113fb2f5b3", {
        email_address: email,
        status: "pending",
      });
      res.status(200).send({msg:"confirmation email sent"});
    }catch (err) {
      res.status(500).send({err:"something went wrong"});
    }

    
  

})

module.exports =router;
