import axios from 'axios';

async function dumpUrl() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/urls?per_page=1', { headers });
    console.log('URL Data:', JSON.stringify(res.data.data[0], null, 2));
    const term = res.data.data[0].url_terms[0];
    console.log('Term Data:', JSON.stringify(term, null, 2));
  } catch (e: any) {
    console.log('Error:', e.response?.status, e.response?.data);
  }
}
dumpUrl();
