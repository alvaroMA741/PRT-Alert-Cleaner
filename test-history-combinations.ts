import axios from 'axios';

async function testHistoryCombinations() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094';
  const term_id = '270607';
  const url_id = '1047392';
  
  const combinations = [
    { url: 'https://api.proranktracker.com/v3/rankings/history', params: { url_term_id } },
    { url: 'https://api.proranktracker.com/v3/rankings/history', params: { term_id } },
    { url: 'https://api.proranktracker.com/v3/rankings/history', params: { id: url_term_id } },
    { url: 'https://api.proranktracker.com/v3/urls/history', params: { url_id } },
    { url: 'https://api.proranktracker.com/v3/urls/history', params: { id: url_id } },
    { url: 'https://api.proranktracker.com/v3/urls/history', params: { url_term_id } },
    { url: 'https://api.proranktracker.com/v3/history/rankings', params: { term_id: url_term_id } }
  ];

  for (const comb of combinations) {
    try {
      console.log(`Testing: ${comb.url} with ${JSON.stringify(comb.params)}`);
      const res = await axios.get(comb.url, { headers, params: comb.params });
      console.log('Result:', res.status, JSON.stringify(res.data).substring(0, 200));
    } catch (e: any) {
      console.log('Error:', e.response?.status, e.response?.data || '');
    }
  }
}
testHistoryCombinations();
