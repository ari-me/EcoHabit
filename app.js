const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const expressLayout = require('express-ejs-layouts');
require('dotenv').config();
require('./passport-config');

const Habit = require('./models/habits'); 
const User = require('./models/user');
const auth = require('./middleware/auth');
const ensureAuth = require('./middleware/ensureAuth');
const app = express();
const port = process.env.PORT || 3000;


const ecoQuotes = [
  { q: "The Earth is what we all have in common.", a: "Wendell Berry" },
  { q: "We won’t have a society if we destroy the environment.", a: "Margaret Mead" },
  { q: "The environment is where we all meet.", a: "Lady Bird Johnson" },
  { q: "He that plants trees loves others besides himself.", a: "Thomas Fuller" },
  { q: "Nature provides a free lunch, but only if we control our appetites.", a: "William Ruckelshaus" },
  { q: "What we are doing to the forests is but a mirror reflection of what we are doing to ourselves.", a: "Mahatma Gandhi" },
  { q: "One of the first conditions of happiness is that the link between man and nature shall not be broken.", a: "Leo Tolstoy" }
];

const suggestions = [
  "Bring your own reusable bag when shopping 🛍️",
  "Turn off the lights when you leave a room 💡",
  "Bike or walk instead of driving today 🚲",
  "Take a 5-minute shower to save water 🚿",
  "Pick up litter during your walk 🚮",
  "Unplug devices you're not using 🔌",
  "Eat a meatless meal today 🥦",
  "Refill your water bottle instead of buying plastic 🧴",
  "Recycle something at home ♻️",
  "Plant something — even herbs on your windowsill 🌱"
];


// MongoDB connection
/*mongoose.connect('mongodb://localhost:27017/ecohabit', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})*/
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);
app.use(expressLayout);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve all static files except /admin
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.includes('/admin')) {
      res.status(403).end();
    }
  }
}));
app.use(express.static(path.join(__dirname, 'assets'))); 
// Session & Passport
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//User routes
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/landing'); // Serve EJS page here
  }
);

// Use EJS routes
app.use('/', require('./routes/index'));
app.use('/details', require('./routes/details'));

//Landing Page Quote and Habits Data
app.get('/landing', ensureAuth, async (req, res) => {
  try {
    const habits = await Habit.find({});

    // Calculate ecoScore and streak
    let ecoScore = 0;
    let streak = 0;

    habits.forEach(habit => {
      let consecutive = 0;
      for (let day of Object.values(habit.days)) {
        if (day === "yes") {
          ecoScore += 10;
          consecutive++;
        } else {
          consecutive = 0;
        }
      }
      if (consecutive > streak) {
        streak = consecutive;
      }
    });

    // Pick quote and suggestion of the day
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);

    // Quote of the day
    const quoteData = ecoQuotes[dayOfYear % ecoQuotes.length];
    const quote = `"${quoteData.q}" — ${quoteData.a}`;

    // Suggestion of the day
    const suggestion = suggestions[dayOfYear % suggestions.length];

    return res.render("landing/home", {
      title: "EcoHabit Tracker",
      habit_list: habits,
      user: req.user || null,  
      quote,
      ecoScore,
      streak,
      suggestion  
    });
  } catch (err) {
    console.error('Error fetching habits:', err);
    res.status(500).send('Server Error');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Login POST
app.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.password !== password) return res.status(401).json({ error: 'Invalid password' });

    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }
      return res.status(200).json({ message: 'Login successful' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Static Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'firstweb.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protect /admin
const basicAdminAuth = require('./middleware/adminAuth');
app.use('/admin', basicAdminAuth, express.static(path.join(__dirname, 'public/admin')));

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

