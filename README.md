A simple application that tracks major trial sponsors with unreported trials on ClinicalTrials.gov.

Application structure
---------------------

The application is in two parts:

- In the `data` directory, a Jupyter notebook called demonstrates how we identify the trials that we think should have reported results, and how we check whether results have been reported either there or on PubMed.
- In the `app` directory, the front-end application presents the data we have found.

Get the data
------------

The `data/all.csv` file contains our full results for all trials. This is a huge file: the easiest way to obtain the raw version may be to [download the zipfile of the whole repo](https://github.com/ebmdatalab/trialstracker/zipball/master).

The [Jupyter notebook](https://github.com/ebmdatalab/trialstracker/blob/master/Examine%20unreported%20trials%20on%20ClinicalTrials.gov.ipynb) has full details how we obtain and classify data ([as does our paper](http://f1000research.com/articles/5-2629)). In summary, if the `is_completed` column is `TRUE` then we regard the trial as eligible for our study (based on phase, completion date, study type, disposition etc) and if the `is_overdue` column is `TRUE` then we have not found linked results either on ClinicalTrials.gov or on PubMed.

[ClinicalTrials.gov](https://clinicaltrials.gov) is the source of the data used in this application. Data is used according to [ClinicalTrials.gov's standard terms of use](https://clinicaltrials.gov/ct2/about-site/terms-conditions#Use).

We make no guarantees that the data is current. Please refer to GitHub commit history to check when data was last processed. For up to date data, please refer to [ClinicalTrials.gov](https://clinicaltrials.gov).

All our code is available under the MIT licence. If you reuse any of our work, please cite us as follows: *Powell-Smith A and Goldacre B. The TrialsTracker: Automated ongoing monitoring of failure to share clinical trial results by all major companies and research institutions. F1000Research 2016, 5:2629 (doi: 10.12688/f1000research.10010.1)*.

Update the app
--------------

- To update the data: first download raw data from ClinicalTrials.gov (instructions are in the Jupyter notebook). Then run the notebook, toggling `REGENERATE_SUMMARY` and `REGENERATE_PUBMED_LINKS` to regenerate the data from scratch. Running this notebook will automatically update the data used in the app.
- You can run the notebook from the command line with

    `jupyter nbconvert --ExecutePreprocessor.timeout=-1 --to notebook --execute Examine\ unreported\ trials\ on\ ClinicalTrials.gov.ipynb`

    - If that executes successfully, it will create a new file with the extension `nbcovert.ipynb`; copy this over the input notebook and commit
    - The notebook will create a number of files in `data/`; copy `data/completed.csv` to `app/data/`
    - Commit that; upload it to Webfaction (see `pass` for credentials)
    - Change "last updated" text on home page
    - Deploy by copying to Webfaction
    - Purge `https://trialstracker.ebmdatalab.net/data/completed.csv` in Cloudflare
- To work on the app: run tests with (in the `data` directory): `nosetests tests/test_utils.py`. To test the JavaScript: `npm run test`. To build the JavaScript: `npm run watch` (development) and `npm run build` (production).

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.163522.svg)](https://doi.org/10.5281/zenodo.163522)
