if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')


mongoose.connect("mongodb://localhost/hack36", { family: 4 })


const initializePassport = require('./passport-config')


const Student = require('./schemas/Student')
const Course = require('./schemas/Course')
const Pending = require('./schemas/Pending')
const Completed = require('./schemas/Completed')


initializePassport(
  passport,
  (email) => Student.findOne({ "email": { $eq: email } }),
  (id) => Student.findOne({ "_id": { $eq: id } })
)


app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    await Student.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})



app.get('/attendance', checkAuthenticated, async (req, res) => {
  const pendingCourses = await Pending.where("student").equals(req.user._id).select("course daysAttended")

  for (const obj of pendingCourses) {
    const course = await Course.findById(obj.course)

    obj.courseId = course.id
    obj.daysTotal = course.time.length * (2 * 4 * 30)
    // todo: 
    // hardcoded for total of 2 months, 4 weeks each
    // but actually, totalDays might be variable or maybe derived from Semester entity
  }

  res.render('attendance.ejs', { pendingCourses: pendingCourses })
})

app.get('/courses', checkAuthenticated, (req, res) => {
  res.render('courses.ejs')
})

app.get('/timetable', checkAuthenticated, async (req, res) => {
  const pendingCourses = await Pending.where("student").equals(req.user._id).select("course")
  const coursesToday = []
  const today = new Date()

  function timeConvert(time) {
    //todo: better time conversion
    minute = time % 60
    hour = Math.floor(time / 60)
    if (minute % 10 === 0) {
      return `${hour}:0${minute}`
    }
    else {
      return `${hour}:${minute}`
    }
  }

  for (const obj of pendingCourses) {
    const course = await Course.findById(obj.course)
    course.time.forEach(timeObj => {
      if (timeObj.dayNumber === today.getDay()) {
        coursesToday.push({
          courseId: course.id,
          courseStartTime: timeConvert(timeObj.startTime),
          courseEndTime: timeConvert(timeObj.endTime),
        })
      }
    })

  }

  coursesToday.sort((a, b) => a.courseTime.startTime - b.courseTime.startTime)

  res.render('timetable.ejs', { coursesToday: coursesToday, today: today })
})


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)