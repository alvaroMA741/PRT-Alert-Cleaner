import axios from 'axios';

async function testV2() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const urls = [
    `https://api.proranktracker.com/v2/rankings/history?url_term_id=${id}`,
    `https://api.proranktracker.com/v2/history/rankings?url_term_id=${id}`,
    `https://api.proranktracker.com/v2/rankings/evolution?url_term_id=${id}`
  ];

  for (const url of urls) {
    try {
      console.log(`Testing V2: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('--- FOUND V2! ---', res.status, JSON.stringify(res.data).substring(0, 500));
      return;
    } catch (e: any) {
      console.log('Failed V2:', e.response?.status);
    }
  }
}
testV2();
