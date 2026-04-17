import axios from 'axios';

async function testV2() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  try {
    const url = `https://api.proranktracker.com/v2/rankings/history?url_term_id=${id}`;
    console.log(`Testing V2: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('V2 SUCCESS!', res.status, JSON.stringify(res.data).substring(0, 500));
  } catch (e: any) {
    console.log('V2 Failed:', e.response?.status);
  }
}
testV2();
