import axios from 'axios';

async function testDeepPath() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  const url_term_id = '46620094';
  
  try {
    const url = `https://api.proranktracker.com/v3/urls/${url_id}/terms/${url_term_id}/history`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testDeepPath();
