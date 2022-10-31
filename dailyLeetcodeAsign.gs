function queryDailyQuestion() {
  var url = "https://leetcode.com/graphql";

  var query_dailyQuestion = {
    "method": "POST", 
    "headers": {
      "Content-Type": "application/json", 
    },
    "payload": JSON.stringify({
      "query":"\n    query questionOfToday {\n  activeDailyCodingChallengeQuestion {\n    date\n    userStatus\n    link\n    question {\n      acRate\n      difficulty\n      freqBar\n      frontendQuestionId: questionFrontendId\n      isFavor\n      paidOnly: isPaidOnly\n      status\n      title\n      titleSlug\n      hasVideoSolution\n      hasSolution\n      topicTags {\n        name\n        id\n        slug\n      }\n    }\n  }\n}\n    ","variables":{}
    })
  }

  var response = UrlFetchApp.fetch(url, query_dailyQuestion);
  var dailyQuestionData = JSON.parse(response).data.activeDailyCodingChallengeQuestion.question
  var dailyTitle = dailyQuestionData.title
  var dailyId = dailyQuestionData.frontendQuestionId
  var dailyTitleSlug = dailyQuestionData.titleSlug

  return [dailyId, dailyTitle, dailyTitleSlug ]
}

function queryQuestionCount() {
  var url = "https://leetcode.com/graphql";

  var query_questionCount = {
    "method": "POST", 
    "headers": {
      "Content-Type": "application/json", 
    },
    "payload": JSON.stringify({
        "query":"\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ","variables":{"username":"alalalele"}
    })
  }

  var response = UrlFetchApp.fetch(url, query_questionCount);
  var totalQuestion_count = JSON.parse(response).data.allQuestionsCount[0].count
  var totalEasyQuestion_count = JSON.parse(response).data.allQuestionsCount[1].count
  var totalMediumQuestion_count = JSON.parse(response).data.allQuestionsCount[2].count
  var totalHardQuestion_count = JSON.parse(response).data.allQuestionsCount[3].count

  return [totalQuestion_count, totalEasyQuestion_count, totalMediumQuestion_count, totalHardQuestion_count]
}

function queryQuestionList(limit, difficulty, premium) {
  if (premium == true) {
    filter = {"premiumOnly": premium}
  } else {
    filter = {"difficulty":difficulty, "premiumOnly": premium}
  }

  var url = "https://leetcode.com/graphql";

  var queryGQL = {
    "method": "POST", 
    "headers": {
      "Content-Type": "application/json", 
    },
    "payload": JSON.stringify({
          "query":"\n    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {\n  problemsetQuestionList: questionList(\n    categorySlug: $categorySlug\n    limit: $limit\n    skip: $skip\n    filters: $filters\n  ) {\n    total: totalNum\n    questions: data {\n      acRate\n      difficulty\n      freqBar\n      frontendQuestionId: questionFrontendId\n      isFavor\n      paidOnly: isPaidOnly\n      status\n      title\n      titleSlug\n      topicTags {\n        name\n        id\n        slug\n      }\n      hasSolution\n      hasVideoSolution\n    }\n  }\n}\n    ","variables":{"categorySlug":"","limit":limit, "filters":filter}
    })
  }
  var response = UrlFetchApp.fetch(url, queryGQL);
  var totalQuestion = JSON.parse(response).data.problemsetQuestionList
  var question_frontendQuestionId = new Array();
  for(var i=0; i<totalQuestion.questions.length; i++)
    question_frontendQuestionId.push(totalQuestion.questions[i].frontendQuestionId);
  return [totalQuestion, question_frontendQuestionId]
}

function getMultipleRandom(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

function sortInt(arr){
  return arr.sort(function(a, b) {return a - b})
}

function createAndSendEmail(easyId, mediumId, hardId, ezQuestion, meQuestion, haQuestion, dailyQuestionData) {
  try {
  var easyIdList = "";
  var mediumIdList = "";
  var hardIdList = "";
  easyId = sortInt(easyId)
  mediumId = sortInt(mediumId)
  hardId = sortInt(hardId)

  var htmlBody = 'Daily: <br/>' + dailyQuestionData[0] + ": <a href='" + "https://leetcode.com/problems/" + dailyQuestionData[2] + "/'>" + dailyQuestionData[1] + "</a><br/>"
  var htmlBody = htmlBody + 'Easy: <br/>'
  for (let i = 0; i < easyId.length; i++) {
    easyIdList = easyIdList.concat(easyId[i] + ", ")
    var problemURL = "https://leetcode.com/problems/" + ezQuestion.questions.find(x => x.frontendQuestionId == easyId[i]).titleSlug + "/"
    htmlBody = htmlBody + easyId[i] + ": <a href='" + problemURL + "'>" + ezQuestion.questions.find(x => x.frontendQuestionId == easyId[i]).title + "</a><br/>"
  }
  htmlBody = htmlBody + 'Medium: <br/>'
  for (let i = 0; i < mediumId.length; i++) {
    mediumIdList = mediumIdList.concat(mediumId[i] + ", ")
    var problemURL = "https://leetcode.com/problems/" + meQuestion.questions.find(x => x.frontendQuestionId == mediumId[i]).titleSlug + "/"
    htmlBody = htmlBody + mediumId[i] + ": <a href='" + problemURL + "'>" + meQuestion.questions.find(x => x.frontendQuestionId == mediumId[i]).title + "</a><br/>"
  }
  htmlBody = htmlBody + 'Hard: <br/>'
  for (let i = 0; i < hardId.length; i++) {
    hardIdList = hardIdList.concat(hardId[i] + ", ")
    var problemURL = "https://leetcode.com/problems/" + haQuestion.questions.find(x => x.frontendQuestionId == hardId[i]).titleSlug + "/"
    htmlBody = htmlBody + hardId[i] + ": <a href='" + problemURL + "'>" + haQuestion.questions.find(x => x.frontendQuestionId == hardId[i]).title + "</a><br/>"
  }
  
  var title = "Daily: " + dailyQuestionData[0] +  " Easy: " + easyIdList.slice(0, easyIdList.length - 2) + " Medium: " + mediumIdList.slice(0, mediumIdList.length - 2) + " Hard: " + hardIdList.slice(0, hardIdList.length - 2);
  const email = Session.getActiveUser().getEmail(); // your login user

  var message = {
    to: email,
    subject: title,
    htmlBody: htmlBody, 
    name: "Automatic Emailer Script"
  };
  MailApp.sendEmail(message); 
  } catch (err) {
    Logger.log('Failed with error %s', err.message);
  }
  setLeetCodeCalendar(title, htmlBody)
}

function setLeetCodeCalendar(eventTitle, eventDesc) {
  var ary = CalendarApp.getAllOwnedCalendars();
  if (ary.length == 0) {
    Logger.log("找不到已存在的日曆");
    return;
  }
  // found leetcode calendar
  var calendarId = ""
  for (var i=0; i<ary.length; i++){
    if (ary[i].getName() == "LeetCode") {
      calendarId = ary[i].getId()
    }
  }

  const date = new Date();

  var cal = CalendarApp.getCalendarById(calendarId);
  if (cal != null){
    var title = eventTitle;
    var desc = eventDesc;
    // var loc = '新北市';
    var event1 = cal.createAllDayEvent(title, date, {description : desc});
    // event1.setColor("9");
  } else {
    Logger.log("日曆不存在！");
  }
}

function main() {

  var allQuestionsCount = queryQuestionCount();
  var totalQuestion_count = allQuestionsCount[0]
  var totalEasyQuestion_count = allQuestionsCount[1]
  var totalMediumQuestion_count = allQuestionsCount[2]
  var totalHardQuestion_count = allQuestionsCount[3]

  var easyQuestion = queryQuestionList(totalEasyQuestion_count, "EASY", false)
  var mediumQuestion = queryQuestionList(totalMediumQuestion_count, "MEDIUM", false)
  var hardQuestion = queryQuestionList(totalHardQuestion_count, "HARD", false)
  var premiumQuestion = queryQuestionList(totalHardQuestion_count, "", true)
  var dailyQuestion = queryDailyQuestion()

  const premiumOnlyToDeleteSet = new Set(premiumQuestion[1]);
  const easyQuestionWoPremium_frontendQuestionId = easyQuestion[1].filter((name) => {
    return !premiumOnlyToDeleteSet.has(name);
  });
  const mediumQuestionWoPremium_frontendQuestionId = mediumQuestion[1].filter((name) => {
    return !premiumOnlyToDeleteSet.has(name);
  });
  const hardQuestionWoPremium_frontendQuestionId = hardQuestion[1].filter((name) => {
    return !premiumOnlyToDeleteSet.has(name);
  });

  var easyNumber = 2;
  var mediumNumber = 7;
  var hardNumber = 2;
  var todayEzQuestion = getMultipleRandom(easyQuestionWoPremium_frontendQuestionId, easyNumber)
  var todayMeQuestion = getMultipleRandom(mediumQuestionWoPremium_frontendQuestionId, mediumNumber)
  var todayHaQuestion = getMultipleRandom(hardQuestionWoPremium_frontendQuestionId, hardNumber)

  createAndSendEmail(todayEzQuestion, todayMeQuestion, todayHaQuestion, easyQuestion[0], mediumQuestion[0], hardQuestion[0], dailyQuestion)
}

