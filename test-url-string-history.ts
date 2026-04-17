import axios from 'axios';

async function testUrlStringHistory() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  const variations = [
    `https://api.proranktracker.com/v3/urls/history?url=positio.es`,
    `https://api.proranktracker.com/v3/urls/history?url=http://positio.es`,
    `https://api.proranktracker.com/v3/urls/history?url=positio.es&term_id=46620094`,
    `https://api.proranktracker.com/v3/urls/history?url=http://positio.es&url_term_id=46620094`
  ];

  for (const url of variations) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Got Response!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
      console.log('Failed:', e.response?.status, e.response?.data || '');
    }
  }
}
testUrlStringHistory();
