'use strict';

// See http://alignedleft.com/tutorials/d3/making-a-bar-chart
// See http://bl.ocks.org/mbostock/3883245
// See https://www.dashingd3js.com/svg-paths-and-d3js

var margin = {top: 20, right: 30, bottom: 30, left: 40},
    w = 960 - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;

var w = 500;
var h = 500;

function formatList(obj) {
  var values = [];
  for (var elt in obj) {
    var value = {
      id: elt,
      questions: obj[elt].questions,
      answered: obj[elt].answered,
      answeredByUs: obj[elt].answeredByUs,
      notAnswered: obj[elt].notAnswered
    };
    values.push(value);
  }
  return _.sortBy(values, 'id');
}

function loadYear(year) {
  var svg = d3.select('body')
            .append('svg')
            .attr('width', w)
            .attr('height', h);

  svg.attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.selectAll('*').remove();

  d3.json('../output/stats/stats.json', function(stats) {
    var statsYear = formatList(stats[year]);

    var barPadding = 2;

    var yearElement = svg.append('g').attr('id', 'year-'+year);

    // Year
    yearElement.append('g').append('text')
      .text(function(d) {
        return year;
      })
      .attr('x', 450)
      .attr('y', 40);

    // Bars

    var graphElement = svg.append('g');

    graphElement.selectAll('rect')
      .data(statsYear)
      .enter()
      .append('rect')
      .attr('x', function(d, i) {
        return i * (40 + barPadding);
      })
      .attr('y', function(d) {
        return h - d.questions * 10;
      })
      .attr('width', 40)
      .attr('height', function(d, i) {
        return d.questions * 10;
      })
      .attr('fill', 'teal');

    // Text in bars

    graphElement.selectAll('text')
      .data(statsYear)
      .enter()
      .append('text')
      .text(function(d) {
        return d.questions;
      })
      .attr('x', function(d, i) {
        return i * (40 + barPadding) + 20;
      })
      .attr('y', function(d) {
        return h - (d.questions * 10) + 14;
      })
      .attr('font-family', 'sans-serif')
      .attr('font-size', '11px')
      .attr('fill', 'white')
      .attr('text-anchor', 'middle');

    // Line: answered

    var lineAnswered = d3.svg.line()
      .x(function(d, i) { return i * (40 + barPadding) + 20; })
      .y(function(d) { return h - d.answered * 10; })
      .interpolate('basis');

    graphElement.append('path')
      .datum(statsYear)
      .attr('class', 'line')
      .attr('d', lineAnswered);

    // Line: answered by us

    var lineAnsweredByUs = d3.svg.line()
      .x(function(d, i) { return i * (40 + barPadding) + 20; })
      .y(function(d) { return h - d.answeredByUs * 10; })
      .interpolate('basis');

    graphElement.append('path')
      .datum(statsYear)
      .attr('class', 'line us')
      .attr('d', lineAnsweredByUs);

    // Axis

    var x = d3.scale.ordinal().rangeBands([0, w], 0.01);
    x.domain(statsYear.map(function(d) { return d.id; }));

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

    graphElement.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis);
  });
}

loadYear('2015');
