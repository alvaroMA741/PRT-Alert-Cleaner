import axios from 'axios';

async function testTermsHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const term_id = '270607';
  const url_term_id = '46620094';
  
  const variations = [
    { url: 'terms/history', params: { term_id } },
    { url: 'terms/history', params: { url_term_id } },
    { url: 'terms/history', params: { id: term_id } }
  ];

  for (const v of variations) {
    try {
      console.log(`Testing: ${v.url} with ${JSON.stringify(v.params)}`);
      const res = await axios.get(`https://api.proranktracker.com/v3/${v.url}`, { headers, params: v.params });
      console.log('Got result!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
      console.log('Failed:', e.response?.status, e.response?.data);
    }
  }
}
testTermsHistory();
