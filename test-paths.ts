import axios from 'axios';

async function testPathVariations() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094';
  const term_id = '270607';
  
  const paths = [
    `rankings/${url_term_id}/history`,
    `rankings/history/${url_term_id}`,
    `terms/${term_id}/rankings/history`,
    `url_terms/${url_term_id}/history`,
    `urls/rankings/history?url_term_id=${url_term_id}`
  ];

  for (const p of paths) {
    const url = `https://api.proranktracker.com/v3/${p}`;
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('--- FOUND! ---');
      console.log('Status:', res.status);
      return;
    } catch (e) {}
  }
}
testPathVariations();
