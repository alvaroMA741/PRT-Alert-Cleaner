import axios from 'axios';

async function testReports() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  const entries = [
    'reports/daily_evolution',
    'reports/evolution',
    'reports/history',
    'reports/rankings/history'
  ];

  for (const e of entries) {
    const url = `https://api.proranktracker.com/v3/${e}`;
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Result!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (err: any) {
      console.log('Failed:', err.response?.status);
    }
  }
}
testReports();
