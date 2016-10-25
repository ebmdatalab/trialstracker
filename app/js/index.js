var d3 = require('d3');
var d3tip = require('d3-tip')(d3);
var $ = require('jquery');
var dt = require('datatables.net')();
var utils = require('./utils');

$('.jscontent').show();
$('.nojs').hide();

$(document).ready(function() {

  // Initialise chart elements.
  var colors = ['#002147', '#ff4800'];
  var margin = {top: 10, right: 0, bottom: 25, left: 70},
      bodyWidth = $('#chart-container').width(),
      width = (bodyWidth * 0.9) - margin.left - margin.right,
      height = (500 * 0.7) - margin.top - margin.bottom;
  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], 0.1);
  var y = d3.scale.linear()
      .range([height, 0]);
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");
  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var xAxisOffset = width / 2;
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");
  svg.append("g")
      .attr("class", "y axis")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -80)
      .style("text-anchor", "end")
      .text("Number of trials completed");

    // Bind tooltips.
    var tip = d3.tip().attr('class', 'd3-tip')
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        var str;
        if (d.name === 'all major trial sponsors') {
          str = 'All trial sponsors have ';
        } else {
          str = d.name + ' has ';
        }
        if (d.status === 'overdue') {
          str += 'not yet published results for ';
        } else {
          str += 'published results for ';
        }
        str += '<br/>' + d.y.toLocaleString() + ' trial';
        str += (d.y !== 1) ? 's ' : ' ';
        str += 'completed in ' + d.x;
        return str;
      });
    svg.call(tip);

  // Load data.
  d3.csv("./data/completed.csv", null, function(error, csvData) {
    var data = utils.reshapeData(csvData);

    // Initialise the sponsor table.
    var html = '';
    for (var k in data) {
      if (k !== '') {
        var d = data[k];
        html += "<tr class='top' data-value='" + d.slug + "'>";
        html += "<td></td>";
        html += '<td><a><strong>' + d.name + '</strong></a></td>';
        html += '<td>' + d.overdue + '</td>';
        html += '<td>' + d.total + '</td>';
        html += '<td>' + (d.rate * 100).toFixed(1) + '%</td>';
        html += '</tr>';
      }
    }
    $('#table-body').html(html);
    var t = $('#ranked').DataTable({
        "paging": false,
        "info": false,
        "searching": false,
        "scrollY": 260,
        "order": [[2, 'desc']],
        "columnDefs": [
          { "orderable": false, "targets": 0 },
          { "orderSequence": [ "asc", "desc" ], "targets": [ 1 ] },
          { "orderSequence": [ "desc", "asc" ], "targets": [ 2,3,4 ] }
        ]
    });
    t.on('order.dt search.dt', function () {
        t.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        } );
    } ).draw();

    // Bind events when user clicks on sponsor name in table.
    $(".top").on("click", function() {
      updateChart(data, $(this).data('value'));
    });

    // Draw the graph.
    var hash = window.location.hash.substr(1);
    if ((hash !== '') && (hash in data)) {
      updateChart(data, hash);
    } else {
      updateChart(data, '');
    }
  });

  function updateChart(allData, orgName) {
    var data = allData[orgName].data,
      name = allData[orgName].name;

    // Update hash, table and chart description. Use dummy
    // hash if needed to avoid gratuitous page scroll.
    window.location.hash = (orgName === '') ? '/' : orgName;
    var row = $('[data-value="' + orgName + '"]');
    if (!row.hasClass('row_selected') ) {
        $('tr.top').removeClass('row_selected');
        row.addClass('row_selected');
    }
    var title = utils.getChartDescription(allData[orgName], name, orgName);
    d3.select('#title').html(title);

    // Set both intro paragraphs to the same height, for tidiness.
    var elementHeights = $('p.legend').map(function() {
      return $(this).height();
    }).get();
    var maxHeight = Math.max.apply(null, elementHeights);
    $('p.legend').height(maxHeight);

    // Show the reset button, if needed.
    var $reset = $('#reset');
    if (orgName === '') {
      $reset.hide();
    } else {
      $reset.show();
    }
    $reset.on('click', function(e) {
      updateChart(allData, '');
    });

    // Draw the stack layout.
    var layers = d3.layout.stack()(["submitted", "overdue"].map(function(k) {
      return data.map(function(d) {
        return {x: d.year, y: +d[k], status: k, name: name};
      });
    }));
    x.domain(data.map(function(d) { return d.year; }));
    var yMax = d3.max(layers, function(d) {
      return d3.max(d, function(d) { return d.y0 + d.y; }); });
    y.domain([0, yMax]);
    svg.select('.x.axis').transition().duration(300).call(xAxis);
    svg.select(".y.axis").transition().duration(300).call(yAxis);
    var groups = svg.selectAll("g.cost")
      .data(layers);
    groups
      .enter().append("g")
      .attr("class", "cost")
      .style("fill", function(d, i) { return colors[i]; });
    var rect = groups.selectAll("rect")
      .data(function(d) { return d; });
    rect.exit()
      .transition()
      .duration(300)
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 1e-6)
      .remove();
    rect.enter()
      .append("rect")
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 0.9);
    rect.transition().duration(300)
      .attr("x", function(d) { return x(d.x); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y0 + d.y); })
      .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });
    rect.on("mouseover", function(d) {
      tip.show(d);
    }).on("mouseout", function() { tip.hide(); });
  }
});

// Scroll the table to the appropriate place.
// Called asynchronously after Typekit font load.
var scrollChart = function() {
  var container = $('#ranked,div.dataTables_scrollBody');
  var scrollTo = $('#ranked tr.row_selected');
  if (scrollTo.length === 1) {
    container.scrollTop(scrollTo.offset().top - container.offset().top);
  }
};
