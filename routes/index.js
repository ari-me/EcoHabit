const express = require("express");
const router = express.Router();


// getting homepage controller
const homeController = require("../controllers/home_controller");
const detailsController = require('../controllers/details_controller');


router.get("/", homeController.home);
// create habit route
router.post("/create-habit", homeController.createHabit);
// delete habit route
router.get("/delete-habit/", homeController.deleteHabit);
// use details routes
router.get('/details', detailsController.details);
router.get('/logout', (req, res) => {
    // destroy session or remove token (if you're using sessions or cookies)
    req.session.destroy(err => {
      if (err) {
        console.log("Error during logout");
        return res.redirect('/landing');
      }
      res.clearCookie('connect.sid'); // if using express-session
      res.redirect('/firstweb.html'); // send user to login page
    });
});
  

module.exports = router;