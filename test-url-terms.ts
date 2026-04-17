import axios from 'axios';

async function testUrlTerms() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  try {
    const url = `https://api.proranktracker.com/v3/url_terms`;
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testUrlTerms();
