import axios from 'axios';

async function testUrlString() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_string = 'http://positio.es';
  
  try {
    const url = `https://api.proranktracker.com/v3/urls/history?url=${encodeURIComponent(url_string)}`;
    console.log(`Testing: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testUrlString();
