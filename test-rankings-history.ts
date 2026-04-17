import axios from 'axios';

async function testRankingsHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  try {
    const url = `https://api.proranktracker.com/v3/rankings?history=1&per_page=1`;
    console.log(`Testing rankings history: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('Success!', res.status, JSON.stringify(res.data).substring(0, 1000));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testRankingsHistory();
