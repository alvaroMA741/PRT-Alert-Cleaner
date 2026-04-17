import axios from 'axios';

async function testQueryToken() {
  const token = '50094-DKNO6PWCJT6X';
  const id = '46620094';
  
  const urls = [
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}&token=${token}`,
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}&apikey=${token}`,
    `https://api.proranktracker.com/v3/rankings/history?url_term_id=${id}&key=${token}`
  ];

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url);
      console.log('--- FOUND QUERY TOKEN! ---', res.status);
      return;
    } catch (e: any) {
      console.log('Failed:', e.response?.status);
    }
  }
}
testQueryToken();
