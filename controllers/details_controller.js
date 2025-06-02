const Habit = require("../models/habits");
const { json } = require("express");
// controller got get details request
module.exports.details = async function(req, res) {
  try {
    const habits = await Habit.find({});
    res.render('details', {
      title: 'Habit Details',
      habit_list: habits
    });
  } catch (err) {
    console.error('Error fetching habits:', err);
    res.status(500).send('Server Error');
  }
};

module.exports.updateHabit = async function (req, res) {
  try {
    let id = req.query.id;
    const habit = await Habit.findById(id);

    if (!habit) {
      console.log("Habit not found");
      return res.status(404).send("Habit not found");
    }

    const day = req.query.day;
    const val = req.query.val;

    if (habit.days.hasOwnProperty(day)) {
      if (val === "none") {
        habit.days[day] = "yes";
        habit.streak++;
      } else if (val === "yes") {
        habit.days[day] = "no";
        habit.streak--;
      } else {
        habit.days[day] = "none";
      }
    }

    await habit.save();
    return res.redirect("/landing");
  } catch (err) {
    console.error("Error in updateHabit:", err);
    return res.status(500).send("Error updating habit");
  }
};
