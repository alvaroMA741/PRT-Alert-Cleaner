import axios from 'axios';

async function testUrlIdOnRankingsHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  
  try {
    const url = `https://api.proranktracker.com/v3/rankings/history?url_id=${url_id}`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Got it!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testUrlIdOnRankingsHistory();
