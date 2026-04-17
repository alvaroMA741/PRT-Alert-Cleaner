import axios from 'axios';

async function testHyphen() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  try {
    const url = `https://api.proranktracker.com/v3/rankings/history?url-term-id=${id}`;
    console.log(`Testing hyphen: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testHyphen();
