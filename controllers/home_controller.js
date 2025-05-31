const Habit = require("../models/habits");


// Render the home EJS page
module.exports.home = async function (req, res) {
  try {
    const habits = await Habit.find({});
    return res.render("landing/home", {
      title: "Habit Tracker App",
      habit_list: habits
    });
  } catch (err) {
    console.error("Error in fetching habits:", err);
    return res.status(500).send("Error loading habits");
  }
};

// Create a new habit
module.exports.createHabit = async function (req, res) {
  try {
    let days = {
      one: "none",
      two: "none",
      three: "none",
      four: "none",
      five: "none",
      six: "none",
      seven: "none",
    };

    await Habit.create({
      habit: req.body.habit,
      end: req.body.end,
      description: req.body.description,
      frequency: req.body.frequency,
      date: new Date(),
      time: req.body.time,
      days: days,
    });

    return res.redirect("/landing");
  } catch (err) {
    console.error("Error in creating habit:", err);
    return res.status(500).send("Failed to create habit");
  }
};

// Delete a habit
module.exports.deleteHabit = async function (req, res) {
  try {
    const id = req.query.id;
    await Habit.findByIdAndDelete(id);
    return res.redirect("/landing");
  } catch (err) {
    console.error("Error in deleting habit:", err);
    return res.status(500).send("Failed to delete habit");
  }
};
