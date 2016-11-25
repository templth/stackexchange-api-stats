'use strict';

// https://api.stackexchange.com/docs/search#order=desc&sort=activity&tagged=restlet&filter=default&site=stackoverflow&run=true
// http://stackapps.com/questions/4010/get-questions-content-from-stackoverflow-api


var sof = require('./stackexchange');
var fs = require('q-io/fs');
var moment = require('moment');
var mapSeries = require('promise-map-series')

// http://samwize.com/2014/05/27/node-dot-js-request-module-with-gzip-slash-gunzip/
// See http://nickfishman.com/post/49533681471/nodejs-http-requests-with-gzip-deflate-compression

function fillAnswersInQuestions(questions) {
  return mapSeries(questions, question => {
    if (!question.is_answered) {
      return Promise.resolve([]);
    }

    return sof.getQuestionAnswers(question.question_id, {}).then(answers => {
        console.log('>> answers = ', answers.length);
      question.answers = answers;
      return question;
    });
  });
}

function serializeMonthQuestions(year, monthNumber, questions) {
  return fs.write(
    `${__dirname}/../output/questions/${year}-${monthNumber}-questions.json`,
    JSON.stringify(questions, null, 2));
}

function handleQuestionsForYear(year) {
  var months = [  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12' ];
  return mapSeries(months, monthNumber => {
      console.log('- ', monthNumber);
    return sof.getQuestionsForMonth({ year: year, number: monthNumber }, {}).then(questions => {
        console.log('  1');
      return fillAnswersInQuestions(questions).then(() => {
        console.log('  2');
          //console.log(questions);
        return serializeMonthQuestions(year, monthNumber, questions);
      });
    });
  });
}

var year = '2015';
handleQuestionsForYear(year).then(() => {

});
