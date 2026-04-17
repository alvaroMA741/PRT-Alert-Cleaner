import axios from 'axios';

async function testHistoryDeep() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  try {
    const url = `https://api.proranktracker.com/v3/urls?per_page=1&history=1`;
    const res = await axios.get(url, { headers });
    const data = res.data.data;
    const term = data.url_terms ? data.url_terms[0] : (data[0] ? data[0].url_terms[0] : null);
    console.log('Term Data:', JSON.stringify(term, null, 2));
    if (term?.history) {
        console.log('HISTORY FOUND!', JSON.stringify(term.history).substring(0, 500));
    } else {
        console.log('No history field in term object');
    }
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testHistoryDeep();
