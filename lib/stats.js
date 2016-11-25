'use strict';

var fs = require('q-io/fs');
var mapSeries = require('promise-map-series')

function loadQuestionsForMonth(year, monthNumber) {
  return fs.read(`${__dirname}/../output/questions/${year}-${monthNumber}-questions.json`)
           .then(data => JSON.parse(data));
}

function serializeStats(stats) {
  return fs.write(`${__dirname}/../output/stats/stats.json`,
             JSON.stringify(stats, null, 2));
}

function countAnsweredQuestions(questions) {
  return questions.reduce((acc, question) => {
    return (question.is_answered) ? acc + 1 : acc;
  }, 0);
}

// Thierry B = 1921839
// Thierry T = 1873365
// Jerome L = 116542 or 30068
function hasAnswerFromRestlet(question) {
  if (!question.answers) {
    return 0;
  }

  return question.answers.reduce((acc, answer) => {
    return (answer.owner.user_id === 1921839 ||
        answer.owner.user_id === 1873365 ||
        answer.owner.user_id === 30068 ||
        answer.owner.user_id === 116542) ? acc + 1 : acc;
  }, 0);
}

function countAnsweredQuestionsByUs(questions) {
  return questions.reduce((acc, question) => {
    return (question.is_answered && hasAnswerFromRestlet(question)) ?
      acc + 1 : acc;
  }, 0);
}

function countNotAnsweredQuestions(questions) {
  return questions.reduce((acc, question) => {
    return (!question.is_answered) ? acc + 1 : acc;
  }, 0);
}

function createStatsForYear(year, callbackYear) {
  var stats = {};
  var months = [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12' ];
  return mapSeries(months, monthNumber => {
    return loadQuestionsForMonth(year, monthNumber).then(questions => {
      stats[monthNumber] = {};
      if (questions) {
        stats[monthNumber].questions = questions.length;
        stats[monthNumber].answered = countAnsweredQuestions(questions);
        stats[monthNumber].answeredByUs = countAnsweredQuestionsByUs(questions);
        stats[monthNumber].notAnswered = countNotAnsweredQuestions(questions);
      } else {
        stats[monthNumber].questions = 0;
        stats[monthNumber].answered = 0;
        stats[monthNumber].answeredByUs = 0;
        stats[monthNumber].notAnswered = 0;
      }
    });
  }).then(() => {
    return stats;
  });
}

var allStats = {};
var years = [ /*'2008', '2009', '2010', '2011', '2012', '2013', '2014',*/ '2015' ];
mapSeries(years, year => {
  return createStatsForYear(year).then(stats => {
    allStats[year] = stats;
    return;
  });
}).then(() => {
  return serializeStats(allStats);
}).then(() => {
  console.log('done');
});