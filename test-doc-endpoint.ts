import axios from 'axios';

async function testDocEndpoint() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392'; // From my previous logs for http://positio.es
  
  try {
    const url = `https://api.proranktracker.com/v3/urls/history/${url_id}`;
    console.log(`Testing DOC endpoint: ${url}`);
    const res = await axios.get(url, { headers });
    console.log('--- SUCCESS! ---');
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(res.data, null, 2).substring(0, 2000));
  } catch (e: any) {
    console.log('Failed:', e.response?.status, e.response?.data);
  }
}
testDocEndpoint();
