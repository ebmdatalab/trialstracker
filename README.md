A simple application that tracks major trial sponsors with unreported trials on ClinicalTrials.gov.

It is in two parts:

- In the `app` directory, the front-end application presents the data.
- In the `data` directory, a Jupyter notebook demonstrates how we obtain the data from ClinicalTrials.gov, how we identify the trials that we think should have reported results by now, and how we check whether results have been reported either there or on PubMed. The `trials.csv` file in this folder contains the full results for all trials.

To update the application, run the Jupyter notebook, changing the values of `REDOWNLOAD_XML`, `REGENERATE_SUMMARY` and `REGENERATE_PUBMED_LINKS` to regenerate the data from scratch. This will automatically update the data used in the app.
