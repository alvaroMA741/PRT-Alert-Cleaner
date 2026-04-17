import axios from 'axios';

async function testUrlHistoryFlag() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  
  try {
    const url = `https://api.proranktracker.com/v3/urls/${url_id}?history=1`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data, null, 2).substring(0, 1000));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testUrlHistoryFlag();
