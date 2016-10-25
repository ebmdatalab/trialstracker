var getChartDescription = function (data, name, orgName) {
    var title = 'Since Jan 2006, <strong>', url;
    title += name + '</strong>';
    title += ' completed ' + data.total.toLocaleString();
    title += " eligible trials and <strong><span style='color: #ff4800'>";
    title +=  (orgName === '') ? " haven't " : "hasn't ";
    title += "published results for ";
    title += data.overdue.toLocaleString() + ' trial';
    title += (data.overdue === 1) ? '' : 's';
    title += '</span></strong>. ';
    title += 'That means ' + (data.rate *100).toFixed(1) + '% of ';
    title += (orgName === '') ? ' their ' : ' its ';
    title += 'trials are missing results. ';
    url = 'https://clinicaltrials.gov/ct2/results/displayOpt?';
    url += 'flds=a&flds=b&flds=f&flds=c&flds=g&flds=s&flds=u&submit_fld_opt=on';
    url += '&recr=Completed&type=Intr&lead=' + name + '&lead_ex=Y&show_flds=Y';
    if (orgName !== '') {
      title += "See <a target='_blank' href='" + url + "'>all its ";
      title +=  "completed trials on ClinicalTrials.gov&nbsp;";
      title += "<span style='font-size: 60%' ";
      title += "class='glyphicon glyphicon-new-window'></span></a>.";
    }
    return title;
};

var reshapeData = function(allData) {
  // console.log('reshapeData', allData);
  // The data when it arrives is an array of dicts, each with a
  // lead_sponsor column and a load of other columns.
  // Make this data a dictionary, indexed by the lead_sponsor.
  // TODO: This is awful, make it better.
  var data = {}, patt = /\d{4}/i, totals = {total: 0, overdue: 0, temp: {}};
  allData.forEach(function(d) {
    // d is our horrible dict with keys for 2006_overdue, 2006_total etc.
    // Divide it into a dict with a key for each year, then another key for
    // total and overdue.
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
    // Now we're going to make that into an array of dicts, and we're
    // also going to count up submitted at the same time.
    var tempArr = [], total = 0, overdue = 0, tempDict = {};
    for (var year in temp) {
      tempDict = {};
      tempDict.year = +year;
      tempDict.total = temp[year].total;
      tempDict.overdue = temp[year].overdue;
      tempDict.submitted = tempDict.total - tempDict.overdue;
      tempDict.rate = (tempDict.total > 0) ? tempDict.overdue / tempDict.total: 0;
      tempArr.push(tempDict);
      // Update totals.
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
    // Now we're going to take our array of dicts, and make it a property
    // on the higher-level dictionary entry.
    data[d.lead_sponsor_slug] = {
      'data': tempArr,
      'total': total,
      'overdue': overdue,
      'name': d.lead_sponsor,
      'slug': d.lead_sponsor_slug
    };
    data[d.lead_sponsor_slug].rate = overdue / total;
    totals.total += total;
    totals.overdue += overdue;
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
};

module.exports = {
    getChartDescription: getChartDescription,
    reshapeData: reshapeData
};
