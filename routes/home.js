const router=require('express').Router();

//home route
router.get('/',(req, res) => {
    res.status(200).send({msg:"hii from vivskill server"})
})


module.exports = router;