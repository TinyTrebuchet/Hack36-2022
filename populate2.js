use hack36

db.minors.insertOne({name: "Minor in Applied Physics", courses: ["PH513", "PH522","PH523"]})
db.minors.insertOne({name: "Minor in Mechanical Design", courses: ["ME205", "ME205","ME205"]})
db.minors.insertOne({name: "Minor in Applied Physics", courses: ["PH513", "PH522","PH523"]})
db.minors.insertOne({name: "Minor in Management", courses: ["HS205", "HS403","HS304"]})
db.minor.insertOne({name: "Minor in German Language", courses: ["HS352", "HS362","HS363"]})


db.baskets.insertOne({name: "Compulsory", courses: ["IC110", "IC140", "IC152", "IC252", "IC272", "IC160", "IC111", "IC141", "IC142", "IC161", "IC101P", "IC160P", "IC141P", "IC161P", "IC222P", "IC201P", "IC240", "IC221", "IC010"]})
db.baskets.insertOne({name: "Science I", courses: ["IC241", "IC121"]})
db.baskets.insertOne({name: "Science II", courses: ["IC230", "IC136"]})
db.baskets.insertOne({name: "Engineering", courses: ["IC260", "IC242"]})

db.courses.updateOne({_id: 'CS201'}, {$set: {time: [{'dayNumber': 3, 'startTime':600, 'endTime':650}]}})
db.courses.updateOne({_id: 'CS309'}, {$set: {time: [{'dayNumber': 3, 'startTime':660, 'endTime':710}]}})
db.courses.updateOne({_id: 'CS304'}, {$set: {time: [{'dayNumber': 3, 'startTime':780, 'endTime':830}]}})
db.courses.updateOne({_id: 'CS309'}, {$set: {time: [{'dayNumber': 3, 'startTime':840, 'endTime':1010}]}})
db.courses.updateOne({_id: 'IC241'}, {$set: {time: [{'dayNumber': 3, 'startTime':1020, 'endTime':1070}]}})

