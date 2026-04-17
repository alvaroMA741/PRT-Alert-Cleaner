import axios from 'axios';

async function testUrlHistoryParams() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  const url_term_id = '46620094';
  
  const params = [
    { url_id: url_id },
    { id: url_id },
    { url_term_id: url_term_id },
    { term_id: url_term_id },
    { id: url_term_id },
    { url_id: url_id, term_id: url_term_id },
    { url_id: url_id, url_term_id: url_term_id }
  ];

  for (const p of params) {
    try {
      console.log(`Testing params: ${JSON.stringify(p)}`);
      const res = await axios.get('https://api.proranktracker.com/v3/urls/history', { headers, params: p });
      console.log('Result:', JSON.stringify(res.data));
    } catch (e: any) {
      console.log('Error:', e.response?.status);
    }
  }
}

testUrlHistoryParams();
