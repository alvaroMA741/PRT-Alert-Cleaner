import axios from 'axios';

async function testRankings() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/rankings?per_page=1', { headers });
    console.log('Rankings Base:', res.status, JSON.stringify(res.data).substring(0, 1000));
  } catch (e: any) {
    console.log('Failed Rankings:', e.response?.status, e.response?.data);
  }
}
testRankings();
