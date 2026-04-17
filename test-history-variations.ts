import axios from 'axios';

async function testHistoryVariations() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094'; 
  const url_id = '1047392';
  const toDate = new Date().toISOString().split('T')[0];
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const variations = [
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${url_term_id}&from_date=${fromDate}&to_date=${toDate}`,
    `https://api.proranktracker.com/v3/rankings/history?id=${url_term_id}&from_date=${fromDate}&to_date=${toDate}`,
    `https://api.proranktracker.com/v3/urls/${url_id}/rankings/history?from_date=${fromDate}&to_date=${toDate}`,
    `https://api.proranktracker.com/v3/urls/${url_id}/history?url_term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/rankings/history?url_id=${url_id}&url_term_id=${url_term_id}`
  ];

  for (const url of variations) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Got Response!', res.status, JSON.stringify(res.data).substring(0, 200));
      if (res.data.success || res.data.data) break;
    } catch (e: any) {
      console.log('Failed:', e.response?.status, e.response?.data?.error || '');
    }
  }
}

testHistoryVariations();
