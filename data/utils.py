import time
from collections import defaultdict

from pyquery import PyQuery as pq
import pandas as pd
import requests
from xml.etree import ElementTree


def extract_ctgov_xml(text):
    d = pq(text, parser='xml')
    data = defaultdict(None)
    # for f in fieldnames:
    #     data[f] = None
    data['nct_id'] = d('nct_id').text()
    data['title'] = d('brief_title').text().strip()
    data['overall_status'] = d('overall_status').text().strip()
    data['phase'] = d('phase').text().replace("Phase ", "")
    data['lead_sponsor'] = d('lead_sponsor agency').text()
    data['lead_sponsor_class'] = d('lead_sponsor agency_class').text()
    data['collaborator'] = d('collaborator')('agency').text()
    data['collaborator_class'] = d('collaborator')('agency_class').text()
    data['study_type'] = d('study_type').text()
    data['completion_date'] = d('primary_completion_date').text()
    data['results_date'] = d('firstreceived_results_date').text()
    # data['results_pmids'] = d('results_reference PMID').text()
    data['enrollment'] = d('enrollment').text()
    # The following fields are not currently used, but might
    # be useful in future.
    data['has_drug_intervention'] = False
    data['drugs'] = ''
    for it in d('intervention'):
        e = pq(it)
        if e('intervention_type').text() == 'Drug':
            data['has_drug_intervention'] = True
            data['drugs'] += e('intervention_name').text() + '; '
    data['disposition_date'] = \
        d('firstreceived_results_disposition_date').text()
    data['locations'] = d('location_countries country').text()
    for k in data:
        if data[k] and isinstance(data[k], basestring):
            data[k] = data[k].encode('utf8')
    return data


def normalise_phase(x):
    # Set N/A (trials without phases, e.g. device trials) to 5
    # (i.e. later than phase 2, which is our cutoff for inclusion).
    # And set multi-phase trials to the earlier phase, e.g.
    # phase 1/2 trials to 1.
    if pd.isnull(x):
        x = 5
    return int(str(x).split('/')[0])

# assert normalise_phase(None) == 5
# assert normalise_phase('3') == 3
# assert normalise_phase('1/2') == 1


def get_pubmed_title(pmid):
    '''
    Retrieve the title of a PubMed article, from its PMID.
    '''
    url = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?'
    url += 'db=pubmed&rettype=abstract&id=%s' % pmid
    try:
        resp = requests.get(url)
    except ValueError, requests.ConnectionError:
        print 'Error!', url
        time.sleep(10)
        return get_pubmed_title(pmid)
    try:
        tree = ElementTree.fromstring(resp.content)
        title = tree.find('.//Article/ArticleTitle')
        if title is not None:
            title = title.text.encode('utf8')
    except ElementTree.ParseError:
        print 'ParseError', url
        title = ''
    return title


def get_pubmed_linked_articles(nct_id, completion_date, query_type):
    '''
    Given an NCT ID, search PubMed for related results articles.
    '''
    url = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/'
    url += 'esearch.fcgi?db=pubmed&retmode=json&term='
    url += '(%s[si] OR %s[Title/Abstract]) ' % (nct_id, nct_id)
    url += 'AND ("%s"[pdat] : ' % completion_date.strftime('%Y/%m/%d')
    url += '"3000"[pdat])'
    if query_type == 'broad':
        url += "AND ((clinical[Title/Abstract] AND trial[Title/Abstract]) OR clinical trials as topic[MeSH Terms] OR clinical trial[Publication Type] OR random*[Title/Abstract] OR random allocation[MeSH Terms] OR therapeutic use[MeSH Subheading])"
    elif query_type == 'narrow':
        url += "AND (randomized controlled trial[Publication Type] OR (randomized[Title/Abstract] AND controlled[Title/Abstract] AND trial[Title/Abstract]))"
    # print url
    try:
        resp = requests.get(url)
        data = resp.json()
    except (ValueError, requests.ConnectionError) as e:
        print 'Error, retrying...'
        time.sleep(10)
        return get_pubmed_linked_articles(nct_id, completion_date, query_type)
    esearchresult = data['esearchresult']
    ids = []
    if 'idlist' in esearchresult:
        ids = esearchresult['idlist']
        for id1 in ids[:]:
            title = get_pubmed_title(id1)
            if title and 'study protocol' in title.lower():
                ids.remove(id1)
    return ids
