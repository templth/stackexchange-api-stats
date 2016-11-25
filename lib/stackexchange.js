'use strict';

const zlib = require('zlib');
const moment = require('moment');
const request = require('request-promise');

const stackexchange = module.exports; // = {};

stackexchange.getQuestions = function(filters, callback) {
  var requestOptions = {
    url: 'https://api.stackexchange.com/2.2/search',
    qs: {
      key: '6qbjIdo2HKU9VOK7RLGoEg((',
      order: 'desc',
      tagged: 'restlet',
      filter: 'default',
      site: 'stackoverflow',
      sort: 'activity',
      pagesize: 100,
      fromdate: filters.fromDate,
      todate: filters.toDate
    }
  };

  return requestWithEncoding(requestOptions).then(res => res.items);
};

stackexchange.getQuestionsForMonth = function(month, filters) {
  var monthBegin = moment(`${month.year}-${month.number}-01`);
  var monthEnd = moment(`${month.year}-${month.number}-01`);
  monthEnd.add(1, 'months').subtract(1, 'seconds');
  var allFilters = {
    fromDate: monthBegin.unix(),
    toDate: monthEnd.unix()
  };

  return stackexchange.getQuestions(allFilters);
};

exports.getQuestionAnswers = function(questionId, options) {
  var requestOptions = {
    url: `https://api.stackexchange.com/2.2/questions/${questionId}/answers/`,
    qs: {
      key: '6qbjIdo2HKU9VOK7RLGoEg((',
      site: 'stackoverflow'/*,
      filter: 'withbody'*/
    }
  };

  return requestWithEncoding(requestOptions).then(res => res.items);
};

function requestWithEncoding(options) {
  var req = request.get(options);

  return new Promise((resolve, reject) => {
    req.on('response', function(res) {
      var chunks = [];
      res.on('data', function(chunk) {
        chunks.push(chunk);
      });


      res.on('end', function() {
        var buffer = Buffer.concat(chunks);
        var encoding = res.headers['content-encoding'];
        if (encoding === 'gzip') {
          zlib.gunzip(buffer, function(err, decoded) {
            if (err) {
              reject(err);
            } else {
              resolve(decoded && JSON.parse(decoded.toString()));
            }
          });
        } else if (encoding === 'deflate') {
          zlib.inflate(buffer, function(err, decoded) {
            if (err) {
              reject(err);
            } else {
              callback(decoded && JSON.parse(decoded.toString()));
            }
          });
        } else {
          resolve(JSON.parse(buffer.toString()));
        }
      });
    });


    req.on('error', function(err) {
      reject(err);
    });
  });
}