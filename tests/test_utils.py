import datetime
import json
from utils import *


def test_extract_ctgov_xml():
    text = open('./tests/fixtures/clinicaltrials_example.xml', 'r').read()
    data = extract_ctgov_xml(text)
    assert data['nct_id'] == 'NCT02009163'
    title = 'Evaluate the Maintenance of Efficacy of SPD489 in Adults Aged '
    title += '18-55 Years With Moderate to Severe Binge Eating Disorder'
    print data['title']
    assert data['title'] == title
    assert data['overall_status'] == 'Completed'
    assert data['phase'] == '3'
    assert data['lead_sponsor'] == 'Shire'
    assert data['lead_sponsor_class'] == 'Industry'
    assert data['study_type'] == 'Interventional'
    assert data['completion_date'] == 'March 2015'
    assert data['results_date'] == 'January 28, 2016'
    assert data['enrollment'] == '418'


def test_extract_ctgov_xml_with_disposition():
    text = open('./tests/fixtures/clinicaltrials_example_with_disposition.xml',
                'r').read()
    data = extract_ctgov_xml(text)
    assert data['disposition_date'] == 'May 4, 2016'


def test_normalise_phase():
    assert normalise_phase('3') == 3
    assert normalise_phase('1/2') == 1
    assert normalise_phase(None) == 5


def test_extract_title_from_pubmed_data():
    text = open('./tests/fixtures/pubmed_example.xml', 'r').read()
    title = extract_title_from_pubmed_data(text)
    s = 'Hospital volume and survival in oesophagectomy and gastrectomy '
    s += 'for cancer.'
    assert title == s


def test_get_pubmed_linked_articles_url():
    d = datetime.datetime(2010, 1, 1)
    base = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?'
    base += 'db=pubmed&retmode=json'
    base += '&term=(NCT01020916[si] OR NCT01020916[Title/Abstract]) '
    base += 'AND ("2010/01/01"[pdat] : "3000"[pdat])%s'
    url = get_pubmed_linked_articles_url('NCT01020916', d, '')
    assert url == base % ' '
    url = get_pubmed_linked_articles_url('NCT01020916', d, 'broad')
    s = ' AND ((clinical[Title/Abstract] AND trial[Title/Abstract]) '
    s += 'OR clinical trials as topic[MeSH Terms] OR '
    s += 'clinical trial[Publication Type] OR random*[Title/Abstract] '
    s += 'OR random allocation[MeSH Terms] OR '
    s += 'therapeutic use[MeSH Subheading])'
    assert url == base % s
    url = get_pubmed_linked_articles_url('NCT01020916', d, 'narrow')
    s = ' AND (randomized controlled trial[Publication Type] '
    s += "OR (randomized[Title/Abstract] AND "
    s += "controlled[Title/Abstract] AND trial[Title/Abstract]))"
    assert url == base % s


def test_extract_pubmed_ids_from_json():
    text = open('./tests/fixtures/pubmed_results.json', 'r')
    data = json.load(text)
    ids = extract_pubmed_ids_from_json(data)
    assert len(ids) == 18


def test_is_study_protocol():
    r = is_study_protocol('Study protocol: foo')
    assert r
    r = is_study_protocol('Bar foo')
    assert not r
