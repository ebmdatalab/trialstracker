$(document).ready(function() {

  $('.jscontent').show();
  $('.nojs').hide();

  //Initialise chart elements.
  var colors = ['#002147', '#ff4800'];
  var margin = {top: 0, right: 0, bottom: 60, left: 70},
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
      //.ticks(10, "%");
  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var xAxisOffset = width / 2;
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .append("text")
      .attr("y", margin.bottom-30)
      .attr("x", xAxisOffset)
      .style("text-anchor", "middle")
      .text("Year trial completed");
  svg.append("g")
      .attr("class", "y axis")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -80)
      .style("text-anchor", "end")
      .text("Number of trials");

    // Bind tooltips.
    var tip = d3.tip().attr('class', 'd3-tip')
      // .html(function(d) { return "hello world"; })
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

    // Make a dictionary, indexed by sponsor name.
    var data = reshapeData(csvData);

    // Populate the sponsor table.
    // TODO: Use a template here.
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
        // "scrollX": false,
        "order": [[2, 'desc']],
        "columnDefs": [
          { "orderable": false, "targets": 0 },
          { "orderable": false, "targets": 1 },
          { "orderSequence": [ "desc", "asc" ], "targets": [ 2,3,4 ] }
        ]
    });
    t.on('order.dt search.dt', function () {
        t.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        } );
    } ).draw();

    // Draw the graph.
    var hash = window.location.hash.substr(1);
    if ((hash !== '') && (hash in data)) {
      updateChart(data, hash);
    } else {
      updateChart(data, '');
    }

    // Bind events for clicking on sponsor name in table.
    $(".top").on("click", function() {
      updateChart(data, $(this).data('value'));
    });
    $(".reset").on("click", function(e) {
      e.preventDefault();
      updateChart(data, '');
    });
  });

  function reshapeData(allData) {
    // console.log('reshapeData', allData);
    // The data when it arrives is an array of dicts, each with a
    // lead_sponsor column and a load of other columns.
    // Make this data a dictionary, indexed by the lead_sponsor.
    // TODO: This is awful, make it better.
    var data = {}, patt = /\d{4}/i, totals = {total: 0, overdue: 0, temp: {}};
    allData.forEach(function(d) {
      // d is our horrible dict with keys for 2006_overdue, 2006_total etc.
      // Divide it into a dict with a key for each year.
      var temp = {};
      for (var k in d) {
        if (patt.test(k)) {
          var res = k.split("_");
          if (res[0] in temp) {
            temp[res[0]][res[1]] = +d[k];
          } else {
            temp[res[0]] = {};
            temp[res[0]][res[1]] = +d[k];
          }
        }
      }
      // temp is a dict with a key for each year, then a key for overdue/total.
      // Now we're going to make it into an array of dicts.
      var tempArr = [], total = 0, overdue = 0, tempDict = {};
      for (var year in temp) {
        tempDict = {};
        tempDict.year = +year;
        tempDict.total = temp[year].total;
        tempDict.overdue = temp[year].overdue;
        tempDict.submitted = tempDict.total - tempDict.overdue;
        tempDict.rate = (tempDict.total > 0) ? tempDict.overdue / tempDict.total: 0;
        tempArr.push(tempDict);
        if (year in totals.temp) {
           totals.temp[year].total += temp[year].total;
           totals.temp[year].overdue += temp[year].overdue;
        } else {
           totals.temp[year] = {
            total: temp[year].total,
            overdue: temp[year].overdue
          };
        }
        total += temp[year].total;
        overdue += temp[year].overdue;
      }
      // now we're going to take our array of dicts, and make it a property.
      totals.total += total;
      totals.overdue += overdue;
      data[d.lead_sponsor_slug] = {
        'data': tempArr,
        'total': total,
        'overdue': overdue,
        'name': d.lead_sponsor,
        'slug': d.lead_sponsor_slug
      };
      data[d.lead_sponsor_slug].rate = overdue / total;
    });
    tempArr = [];
    for (var year1 in totals.temp) {
      tempDict = {};
      tempDict.year = +year1;
      tempDict.total = totals.temp[year1].total;
      tempDict.overdue = totals.temp[year1].overdue;
      tempDict.submitted = tempDict.total - tempDict.overdue;
      tempDict.rate = (tempDict.total > 0) ? tempDict.overdue / tempDict.total: 0;
      tempArr.push(tempDict);
    }
    data[''] = {
      'data': tempArr,
      'name': 'all major trial sponsors',
      'slug': '',
      'total': totals.total,
      'overdue': totals.overdue
    };
    data[''].rate = totals.overdue / totals.total;
    return data;
  }

  // Add data in chart.
  function updateChart(allData, orgName) {
    window.location.hash = orgName;

    var row = $('[data-value="' + orgName + '"]');
    if (!row.hasClass('row_selected') ) {
        $('tr.top').removeClass('row_selected');
        row.addClass('row_selected');
    }

    // Expects an array of objects, each object to have a 'year' field and
    // an 'overdue' field.
    var data = allData[orgName].data,
      name = allData[orgName].name;

    //$('#orgname-header').text(allData[orgName].name);

    // Update title field.
    var url = 'https://clinicaltrials.gov/ct2/results?recr=Completed&type=Intr';
    url += '&rslt&lead=' + name + '&lead_ex=Y';
    var title = 'Since Jan 2006, <strong>';
    title += name + '</strong>';
    title += ' completed ' + allData[orgName].total.toLocaleString();
    title += " eligible trials and <strong><span style='color: #ff4800'>";
    title +=  (orgName === '') ? " haven't " : "hasn't ";
    title += "published results for ";
    title += allData[orgName].overdue.toLocaleString() + ' trials</span></strong>. ';
    title += 'That means ' + (allData[orgName].rate *100).toFixed(1) + '% of ';
    title += (orgName === '') ? ' all ' : ' its ';
    title += 'trials are missing results. ';
    if (orgName !== '') {
      title += "See <a target='_blank' href='" + url + "'>all its ";
      title +=  "completed trials on ClinicalTrials.gov&nbsp;";
      title += "<span style='font-size: 60%' ";
      title += "class='glyphicon glyphicon-new-window'></span></a>.";
  }
    d3.select('#title').html(title);

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
    // var bars = svg.selectAll(".bar").data(data, function(d) { return d.year; });
    // bars.exit()
    //   .transition()
    //     .duration(300)
    //   .attr("y", y(0))
    //   .attr("height", height - y(0))
    //   .style('fill-opacity', 1e-6)
    //   .remove();
    // bars.enter().append("rect")
    //   .attr("class", "bar")
    //   .attr("y", y(0))
    //   .attr("height", height - y(0));
    // bars.transition().duration(300)
    //   .attr("x", function(d) { return x(d.year); })
    //   .attr("width", x.rangeBand())
    //   .attr("y", function(d) { return y(d.total); })
    //   .attr("height", function(d) { return height - y(d.total); });
  }

});