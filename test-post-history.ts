import axios from 'axios';

async function testPostHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094';
  
  try {
    const url = `https://api.proranktracker.com/v3/rankings/history`;
    console.log(`Testing POST: ${url}`);
    const res = await axios.post(url, { url_term_id }, { headers });
    console.log('Got it!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testPostHistory();
