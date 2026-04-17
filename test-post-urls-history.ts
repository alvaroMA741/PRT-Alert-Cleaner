import axios from 'axios';

async function testPostUrlsHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  
  try {
    const url = `https://api.proranktracker.com/v3/urls/history`;
    console.log(`Testing POST: ${url}`);
    const res = await axios.post(url, { url_id }, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testPostUrlsHistory();
