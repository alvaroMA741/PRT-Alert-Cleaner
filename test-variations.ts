import axios from 'axios';

async function testVariations() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const variations = [
    { url: 'rankings/history', params: { url_term_id: id } },
    { url: 'rankings/history', params: { term_id: id } },
    { url: 'rankings/history', params: { id: id } },
    { url: 'urls/history', params: { url_id: id } },
    { url: 'urls/history', params: { id: id } }
  ];

  for (const v of variations) {
    try {
      console.log(`Testing: ${v.url} with ${JSON.stringify(v.params)}`);
      const res = await axios.get(`https://api.proranktracker.com/v3/${v.url}`, { headers, params: v.params });
      console.log('Got result!', res.status, JSON.stringify(res.data).substring(0, 200));
    } catch (e: any) {
      console.log('Failed:', e.response?.status, e.response?.data);
    }
  }
}
testVariations();
