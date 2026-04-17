import axios from 'axios';

async function testNoAccept() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  try {
    const url = `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}&from_date=2026-03-18&to_date=2026-04-17`;
    console.log(`Testing without Accept header: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status);
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testNoAccept();
