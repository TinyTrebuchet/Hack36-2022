# Hack36-2022

AIO-MONTI

One app solution for academics at IIT Mandi
(Theme- Education)

1. Credit tracker- Track the number of credits completed, helping in planning the courses ahead. 
2. Timetable maker- We all know the difficulty we face in making our timetables, seeing the slot-sheet which is shared, which is the most confusing sheet in this world. Here, we will only have to put the courses we've enrolled and it will generate the timetable for us, with all the class links.
  
4. Course Basket completion tracker- Track all the IC baskets completed, and plan the courses to be taken. 
5. Course recommendation for Major and Minor - Get a list of all the courses to be completed to get your desired minor/major, just select the desired minor, and it will show you the list, with courses being marked basket-wise, completed/pending. 
6. Grade tracker- Will help you track grades of all the assignments, exams and overall grades of a course, so you can decide which course requires more effort and time.
7. Attendance tracker- Helps you keep a track of attendance, so you never fall below the threshold, thus never miss an exam, and thus course, just because of this.
8. Assignment Tracker- Keep track of all the assignments, so you never miss a deadline.
9. Dynamic class schedule, editable by the professor
10. Group study and activities 
11. Common announcement and communication with TAs and profs

Make sure mongodb is running:
How to populate database:
```
mongo < populate1.js
mongo < populate2.js
```
Time slots for courses have not been added yet for all courses.

Create a .env file with following contents:
```
SESSION_SECRET=secret
```

How to run:
```
npm install bcrypt ejs express express-flash express-session method-override passport passport-local
node server.js
```

Screenshots:
![Screenshot 2022-02-27 at 23-01-57 Login](https://user-images.githubusercontent.com/73381089/155893939-d8dfda2f-1cc6-4dcb-b6b3-689cdadba13e.png)

![Screenshot 2022-02-27 at 21-41-45 Home](https://user-images.githubusercontent.com/73381089/155893913-85dbd42d-3069-4828-b574-ca68c2f40213.png)

![Screenshot 2022-02-27 at 23-28-32 Timetable](https://user-images.githubusercontent.com/73381089/155893923-6bad2fac-bb52-42eb-9cb4-d23a2493b8cd.png)

![Screenshot 2022-02-27 at 23-06-12 Courses](https://user-images.githubusercontent.com/73381089/155893907-05b01f71-353c-458d-a251-2b08d006b2e0.png)
