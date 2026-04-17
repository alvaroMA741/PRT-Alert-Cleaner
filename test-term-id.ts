import axios from 'axios';

async function testTermId() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const term_id = '270607'; 
  
  try {
    const url = `https://api.proranktracker.com/v3/rankings/history?term_id=${term_id}`;
    console.log(`Testing with term_id: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Success!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testTermId();
