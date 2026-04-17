import axios from 'axios';

async function testBaseAndReports() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/', { headers });
    console.log('Base V3:', JSON.stringify(res.data).substring(0, 1000));
  } catch (e) {}

  try {
    const res = await axios.get('https://api.proranktracker.com/v3/reports', { headers });
    console.log('Reports:', JSON.stringify(res.data).substring(0, 1000));
  } catch (e) {}
}
testBaseAndReports();
