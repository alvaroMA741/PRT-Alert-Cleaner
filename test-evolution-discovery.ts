import axios from 'axios';

async function testEvolutionDiscovery() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094';
  const term_id = '270607';
  
  const urls = [
    `https://api.proranktracker.com/v3/evolution?url_term_id=${url_term_id}`,
    `https://api.proranktracker.com/v3/evolution?term_id=${term_id}`,
    `https://api.proranktracker.com/v3/evolution/terms/${url_term_id}`,
    `https://api.proranktracker.com/v3/terms/${url_term_id}/evolution`
  ];

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('Result!', res.status, JSON.stringify(res.data).substring(0, 500));
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}
testEvolutionDiscovery();
