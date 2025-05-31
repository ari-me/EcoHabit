exports.home = (req, res) => {
    const dummyHabits = [
      { name: 'Drink Water', completed: false },
      { name: 'Walk 10 minutes', completed: true }
    ];
  
    res.render('landing/home', {
      habit_list: dummyHabits
    });
  };
  
  