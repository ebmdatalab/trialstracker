var expect = require('chai').expect;
var utils = require('../utils');

describe('Utils', function () {
    describe('#getChartDescription', function () {
        it('should construct description for a sponsor', function () {
            var data = {
              overdue: 4,
              rate: 0.4,
              total: 10
            }, name = 'Sanofi', orgName = 'sanofi';
            var description = utils.getChartDescription(data, name, orgName);
            var expected = "Since Jan 2006, <strong>Sanofi</strong> completed" +
              " 10 eligible trials and <strong><span style='color: #ff4800'>" +
              "hasn't published results for 4 trials</span></strong>. That " +
              "means 40.0% of its trials are missing results. See " +
              "<a target='_blank' href='https://clinicaltrials.gov/ct2/" +
              "results/displayOpt?flds=a&flds=b&flds=f&flds=c&flds=g&flds=s" +
              "&flds=u&submit_fld_opt=on&recr=Completed&type=Intr&lead=Sanofi" +
              "&lead_ex=Y&show_flds=Y'>all its completed trials on " +
              "ClinicalTrials.gov&nbsp;<span style='font-size: 60%' " +
              "class='glyphicon glyphicon-new-window'></span></a>.";
            expect(description).to.equal(expected);
        });

        it('should construct description for all sponsors', function () {
            var data = {
              overdue: 40,
              rate: 0.4,
              total: 100
            }, name = 'all major trial sponsors', orgName = '';
            var description = utils.getChartDescription(data, name, orgName);
            var expected = "Since Jan 2006, <strong>all major trial " +
              "sponsors</strong> completed" +
              " 100 eligible trials and <strong><span style='color: #ff4800'> " +
              "haven't published results for 40 trials</span></strong>. That " +
              "means 40.0% of their trials are missing results. ";
            expect(description).to.equal(expected);
        });
    });
    // describe('#reshapeData', function () {
    //     it('should reshape our data', function () {
    //     });
    // });
});
