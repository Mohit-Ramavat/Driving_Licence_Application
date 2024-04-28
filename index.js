const express = require('express');
const sessions = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
const User = require('./models/User');

let momentDate = require('moment');

const appointment = require('./models/appointment');

const fullDay = 1000 * 60 * 60 * 24; // time in milliseconds
app.use(
  sessions({
    secret: '#$%@&@)@*',
    saveUninitialized: true,
    cookie: { maxAge: fullDay },
    resave: false,
  })
);

app.listen(5000, () => {
  console.log('App is listening on port 5000');
});

//connect mongodb with node
//add name of db before question mark
const mongoose = require('mongoose');

mongoose
  .connect('mongodb+srv://admin:admin@cluster0.4bpniwl.mongodb.net/mo1?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected...!!!! :)');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB: ', err.message);
  });

app.use(function (req, res, next) {
  res.locals.userSessionPut = req.session.userSessionPut;
  next();
});

app.get('/logout', (req, res) => {
  req.session.userSessionPut = null;
  res.redirect('/login');
});

app.get('/g2', async (req, res) => {
  if (req.session.userSessionPut) {
    try {
      var check = await User.findOne({ username: req.session.userSessionPut });
      if (check.appointment_id) {
        return res.redirect('/');
      } else {
        var data = await appointment.find({ isTimeSlotAvailable: true });
        const date = momentDate().format('YYYY-MM-DD');
        return res.render('g2', { date: date, appointments: data });
      }
    } catch (error) {
      return console.log(error);
    }
  } else {
    res.redirect('/login');
  }
});

app.post('/user/appointment', async (req, res) => {
  try {
    const appointment_id = await appointment.findOneAndUpdate({ time: req.body.time, date: req.body.date }, { isTimeSlotAvailable: false });
    var data = { appointment_id: appointment_id._id };
    await User.findOneAndUpdate({ username: req.session.userSessionPut }, data);
    res.redirect('/');
  } catch (error) {
    console.log(error);
  }
});

app.get('/admin', async (req, res) => {
  if (req.session.userSessionPut) {
    try {
      const appointments = await appointment.find();
      const date = momentDate().format('YYYY-MM-DD');
      res.render('admin', { date: date, appointments: appointments });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.redirect('/login');
  }
});

app.post('/admin/appointment', async (req, res) => {
  try {
    var appointmentCreate = { date: req.body.date, time: req.body.time, isTimeSlotAvailable: true };
    await appointment.create(appointmentCreate);
    res.redirect('/admin');
  } catch (error) {
    console.log(error);
  }
});

app.get('/', (req, res) => {
  if (req.session.userSessionPut) {
    res.render('dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/g', async (req, res) => {
  if (req.session.userSessionPut) {
    try {
      const userInfoFindData = await User.findOne({
        username: req.session.userSessionPut,
      });
      if (!userInfoFindData) {
        console.log('Error No DAta Found');
      } else {
        res.render('g', { userDataGet: userInfoFindData });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.redirect('/login');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/login', async function (req, res) {
  try {
    const userInfoGet = await User.findOne({
      username: req.body.username,
    });

    if (userInfoGet) {
      const isMatchPassword = await bcrypt.compare(req.body.password, userInfoGet.password);

      if (!isMatchPassword) {
        res.render('login', { err: 'Invalid credentials.' });
      }

      req.session.userSessionPut = req.body.username;

      if (userInfoGet.userType == 'Admin') {
        res.redirect('/admin');
      }

      if (userInfoGet.userType == 'Driver') {
        res.redirect('/g2');
      }
    } else {
      res.render('login', { err: 'Username not found' });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post('/register', async function (req, res) {
  try {
    if (req.body.password === req.body.confirm_password) {
      const userInfoGet = await User.findOne({
        username: req.body.username,
      });

      if (!userInfoGet) {
        const allData = {
          firstname: 'default',
          lastname: 'default',
          username: req.body.username,
          password: req.body.password,
          userType: req.body.userType,
          licence_number: 'default',
          age: 0,
          car_details: {
            make: 'default',
            model: 'default',
            year: 0,
            plate_number: 'default',
          },
        };
        await User.create(allData);
        res.redirect('/login');
      } else {
        res.render('signup', { err: 'Username Exist In Database' });
      }
    } else {
      res.render('signup', { err: 'Password Not Match' });
    }
  } catch (error) {
    console.log(error);
  }
});
//

app.get('/login', (req, res) => {
  res.render('login');
});

// app.post('/user/store', (req, res) => {
//   try {
//     const user = User.create({
//       firstname: req.body.firstname,
//       lastname: req.body.lastname,
//       licence_number: req.body.licencenumber,
//       age: parseInt(req.body.age),
//       car_details: {
//         make: req.body.make,
//         model: req.body.model,
//         year: parseInt(req.body.year),
//         plate_number: req.body.plate_number,
//       },
//     });

//     res.redirect('/g');
//   } catch (error) {
//     console.log(error);
//   }
// });

app.post('/user/update', async (req, res) => {
  try {
    const data = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      licence_number: req.body.licence_number,
      age: parseInt(req.body.age),
      car_details: {
        make: req.body.make,
        model: req.body.model,
        year: parseInt(req.body.year),
        plate_number: req.body.plate_number,
      },
    };
    await User.findOneAndUpdate({ _id: req.body._id }, data);
    res.redirect('/g');
  } catch (error) {
    console.log(error);
  }
});

app.post('/g/search', async (req, res) => {
  try {
    const licenceNumber = await User.findOne({ licence_number: req.body.licencenumber });

    res.render('g', { licenceNumber: licenceNumber });
  } catch (error) {
    console.log(error);
  }
});

// User.create({
//   firstname: 'Mohit',
//   lastname: 'Ramavat',
//   licence_number: 'jhjjf',
//   age: parseInt(45),
//   car_details: {
//     make: 'dfds',
//     model: 'dsf',
//     year: parseInt(45),
//     plate_number: 'dsfdfds'
//   }
// });
