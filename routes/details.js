const express = require('express');
const router=express.Router();
const detailsController = require('../controllers/details_controller');

router.get('/',detailsController.details);
// update route for habits
router.post('/update-habit', detailsController.updateHabit);

module.exports=router;