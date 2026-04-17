import axios from 'axios';

async function testHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const termId = '46620094'; // From previous test output
  const toDate = new Date().toISOString().split('T')[0];
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    console.log(`Testing history for termId: ${termId} from ${fromDate} to ${toDate}`);
    const res = await axios.get(`https://api.proranktracker.com/v3/rankings/history?term_id=${termId}&from_date=${fromDate}&to_date=${toDate}`, { headers });
    console.log('Status:', res.status);
    console.log('Data Type:', typeof res.data.data);
    console.log('Is Array:', Array.isArray(res.data.data));
    console.log('Sample data:', JSON.stringify(res.data.data, null, 2).substring(0, 500));
  } catch (e: any) {
    console.log('Error:', e.response?.status, e.response?.data || e.message);
  }
}

testHistory();
