A simple application that tracks major trial sponsors with unreported trials on ClinicalTrials.gov.

Application structure
---------------------

The application is in two parts:

- In the `data` directory, a Jupyter notebook called demonstrates how we identify the trials that we think should have reported results, and how we check whether results have been reported either there or on PubMed.
- In the `app` directory, the front-end application presents the data we have found.

Get the data
------------

 The `data/all.csv` file contains our full results for all trials.

[ClinicalTrials.gov](https://clinicaltrials.gov) is the source of the data used in this application. Data is used according to [ClinicalTrials.gov's standard terms of use](https://clinicaltrials.gov/ct2/about-site/terms-conditions#Use).

We make no guarantees that the data is current. Please refer to GitHub commit history to check when data was last processed. For up to date data, please refer to [ClinicalTrials.gov](https://clinicaltrials.gov).

 All our code is available under the MIT licence. If you reuse any of our work, please cite us as follows: `Powell-Smith, A. and Goldacre, B.: The TrialsTracker: ongoing monitoring of failure to share clinical trial results by all major companies and research institutions, 2016`.

Update data
-----------

First download raw data from ClinicalTrials.gov (instructions are in the Jupyter notebook). Then run the notebook, toggling `REGENERATE_SUMMARY` and `REGENERATE_PUBMED_LINKS` to regenerate the data from scratch. Running this notebook will automatically update the data used in the app.

To rebuild the JavaScript, run `npm run watch` (development) and `npm run build` (production).

Run tests
---------

Toest the data utility functions, run in the `data` directory: `nosetests tests/test_utils.py`. To test the JavaScript: `npm run test`.
