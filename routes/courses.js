const express = require('express')

const router = express.Router();

//Main Route

router.get('/',(req,res)=>{
    res.send("Welcome to courses!")
})

module.exports = router;