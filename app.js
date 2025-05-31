const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const expressLayout = require('express-ejs-layouts');
require('dotenv').config();
require('./passport-config');

const User = require('./models/user');
const auth = require('./middleware/auth');
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


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ecohabit', {
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

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// Serve all static files except /admin
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.includes('/admin')) {
      // Don't serve admin files here
      res.status(403).end();
    }
  }
}));
app.use(express.static(path.join(__dirname, 'assets'))); // For new structure

// Session & Passport
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/landing/home'); // Serve EJS page here
  }
);

const Habit = require('./models/habits'); // Add at the top if it's not already

app.get('/landing', async (req, res) => {
  try {
    const habits = await Habit.find({});

    // Pick quote of the day
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const quoteData = ecoQuotes[dayOfYear % ecoQuotes.length];
    const quote = `"${quoteData.q}" — ${quoteData.a}`;

    res.render('landing/home', {
      title: 'Habit Tracker',
      habit_list: habits,
      quote // 👈 Pass the quote to EJS
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
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: 'Email not found' });
    if (user.password !== password) return res.status(401).json({ error: 'Incorrect password' });

    // You can use req.login(user, ...) if needed
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Use EJS routes
app.use('/', require('./routes/index'));
app.use('/details', require('./routes/details'));

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

