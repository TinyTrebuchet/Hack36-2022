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
const path = require('path')
const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost/hack36", { family: 4 })


const Student = require('./schemas/Student')
const Course = require('./schemas/Course')
const Basket = require('./schemas/Basket')
const Minor = require('./schemas/Minor')
const initializePassport = require('./passport-config')

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

app.get('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})



app.get('/attendance', checkAuthenticated, async (req, res) => {
  const pendingCourses = (await Student.findById(req.user._id).select("pending")).pending

  for (const obj of pendingCourses) {
    const course = await Course.findById(obj.courseId)

    obj.daysTotal = course.time.length * (2 * 4)
    // todo: 
    // hardcoded for total of 2 months, 4 weeks each
    // but actually, totalDays might be variable or maybe derived from Semester entity
  }

  res.render('attendance.ejs', { pendingCourses: pendingCourses })
})


app.get('/timetable', checkAuthenticated, async (req, res) => {
  const pendingCourses = (await Student.findById(req.user._id).select("pending")).pending
  const coursesToday = []
  const today = new Date()

  function timeConvert(time) {
    //todo: better time conversion
    minute = time % 60
    hour = Math.floor(time / 60)
    if (minute < 10) {
      return `${hour}:0${minute}`
    }
    else {
      return `${hour}:${minute}`
    }
  }

  for (const obj of pendingCourses) {
    const course = await Course.findById(obj.courseId)
    course.time.forEach(timeObj => {
      if (timeObj.dayNumber === today.getDay()) {
        coursesToday.push({
          courseId: course._id,
          courseStartTime: timeConvert(timeObj.startTime),
          courseEndTime: timeConvert(timeObj.endTime),
          courseInstructor: course.instructor,
        })
      }
    })

  }

  coursesToday.sort((a, b) => a.courseTime.startTime - b.courseTime.startTime)

  res.render('timetable.ejs', { coursesToday: coursesToday, today: today })
})


app.get('/courses', checkAuthenticated, (req, res) => {
  res.render('courses.ejs')
})


app.get('/courses/completed', checkAuthenticated, async (req, res) => {
  const completedCourses = (await Student.findById(req.user._id).select("completed")).completed

  for (const obj of completedCourses) {
    const course = await Course.findById(obj.courseId)

    obj.courseName = course.name
  }

  res.render('courses/completed.ejs', { completedCourses: completedCourses })
})

app.get('/courses/list', checkAuthenticated, async (req, res) => {
  [enrolledCourses, completedCourses, unEnrolledCourses] = await getAllCoursesforStudent(req.user._id)

  res.render('courses/list.ejs', {
    enrolledCourses: enrolledCourses,
    completedCourses: completedCourses,
    unEnrolledCourses: unEnrolledCourses,
    message: "",
  })
})


app.post('/courses/list', checkAuthenticated, async (req, res) => {
  [enrolledCourses, completedCourses, unEnrolledCourses] = await getAllCoursesforStudent(req.user._id)

  let message = ""

  function sortObj(a, b) {
    if (a._id > b._id)
      return 1
    if (a._id < b._id)
      return -1
    return 0
  }

  function sortCourse(a, b) {
    if (a.courseId > b.courseId)
      return 1
    if (a.courseId < b.courseId)
      return -1
    return 0
  }

  if (req.body.action === 'enroll') {
    if (unEnrolledCourses.map(obj => obj._id).includes(req.body.courseId)) {
      const student = await Student.findById(req.user._id)
      student.pending.push({ courseId: req.body.courseId, daysAttended: 0 })
      student.pending.sort(sortCourse)
      await student.save()

      unEnrolledCourses = unEnrolledCourses.filter(obj => obj._id !== req.body.courseId)
      enrolledCourses.push({ _id: req.body.courseId, name: req.body.courseName })
      enrolledCourses.sort(sortObj)

      message = "Enrolled successfully"
    }
    else {
      message = "Error"
    }
  }

  else if (req.body.action === 'unenroll') {
    if (enrolledCourses.map(obj => obj._id).includes(req.body.courseId)) {
      const student = await Student.findById(req.user._id)
      student.pending = student.pending.filter(obj => obj.courseId !== req.body.courseId)
      await student.save()

      enrolledCourses = enrolledCourses.filter(obj => obj._id !== req.body.courseId)
      unEnrolledCourses.push({ _id: req.body.courseId, name: req.body.courseName })
      unEnrolledCourses.sort(sortObj)

      message = "Un-Enrolled successfully"
    }
    else {
      message = "Error"
    }
  }

  else if (req.body.action === 'completed') {
    const validGrade = ['A', 'B', 'C', 'D', 'E', 'F'].includes(req.body.grade)
    const validSemester = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(req.body.semester))
    if (enrolledCourses.map(obj => obj._id).includes(req.body.courseId) && validGrade && validSemester) {
      const student = await Student.findById(req.user._id)
      student.pending = student.pending.filter(obj => obj.courseId !== req.body.courseId)
      student.completed.push({ courseId: req.body.courseId, grade: req.body.grade, semester: req.body.semester })
      student.completed.sort(sortCourse)
      await student.save()

      enrolledCourses = enrolledCourses.filter(obj => obj._id !== req.body.courseId)
      completedCourses.push({ _id: req.body.courseId, name: req.body.courseName })
      completedCourses.sort(sortObj)

      message = "Completion successful"
    }
    else {
      message = "Error"
    }
  }

  else if (req.body.action === 'delete') {
    if (completedCourses.map(obj => obj._id).includes(req.body.courseId)) {
      const student = await Student.findById(req.user._id)
      student.completed = student.completed.filter(obj => obj.courseId !== req.body.courseId)
      await student.save()

      completedCourses = completedCourses.filter(obj => obj._id !== req.body.courseId)
      unEnrolledCourses.push({ _id: req.body.courseId, name: req.body.courseName })
      unEnrolledCourses.sort(sortObj)

      message = "Deletion successful"
    }

    else {
      message = "Error"
    }
  }

  else {
    message = "Invalid action"
  }

  res.render('courses/list.ejs', {
    enrolledCourses: enrolledCourses,
    completedCourses: completedCourses,
    unEnrolledCourses: unEnrolledCourses,
    message: message,
  })
})


app.get('/courses/basket', checkAuthenticated, async (req, res) => {
  const baskets = await Basket.where()
  const newBaskets = []
  for (const basket of baskets) {
    const courseArr = []
    for (const courseId of basket.courses) {
      const course = await Course.findById(courseId).select("name")
      if (course) {
        courseArr.push(course)
      }
    }
    newBaskets.push({ name: basket.name, courses: courseArr })

  }

  res.render('courses/basket.ejs', { baskets: newBaskets })
})

app.get('/courses/minor', checkAuthenticated, async (req, res) => {
  const minors = await Minor.where()
  const newMinors = []
  for (const minor of minors) {
    const courseArr = []
    for (const courseId of minor.courses) {
      const course = await Course.findById(courseId).select("name")
      if (course) {
        courseArr.push(course)
      }
    }
    newMinors.push({ name: minor.name, courses: courseArr })

  }

  res.render('courses/minor.ejs', { minors: newMinors })
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


async function getAllCoursesforStudent(studentId) {
  const enrolledCourses = []
  const completedCourses = []

  const enrolledIds = (await Student.findById(studentId).select("pending")).pending
  for (const obj of enrolledIds) {
    const course = await Course.findById(obj.courseId)
    enrolledCourses.push({
      _id: course._id,
      name: course.name,
    })
  }

  const completedIds = (await Student.findById(studentId).select("completed")).completed
  for (const obj of completedIds) {
    const course = await Course.findById(obj.courseId)
    completedCourses.push({
      _id: course._id,
      name: course.name,
    })
  }

  const hashCourse = ({ _id, name }) => `${_id}`

  const allCourses = await Course.where().select("name")
  const enrolledSet = new Set(enrolledCourses.map(hashCourse))
  const completedSet = new Set(completedCourses.map(hashCourse))

  const unEnrolledCourses = allCourses.filter(obj => {
    const hashVal = hashCourse(obj)
    return !(enrolledSet.has(hashVal) || completedSet.has(hashVal))
  })

  return [enrolledCourses, completedCourses, unEnrolledCourses]
}

app.use(express.static(path.join(__dirname, "views")));

app.listen(3000)
