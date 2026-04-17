import axios from 'axios';

async function bruteForce() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const resources = [
    'history', 'rankings', 'evolution', 'stats', 'daily_rankings'
  ];
  
  const bases = [
    `https://api.proranktracker.com/v3/terms/${id}`,
    `https://api.proranktracker.com/v3/url_terms/${id}`,
    `https://api.proranktracker.com/v3/url-terms/${id}`,
    `https://api.proranktracker.com/v3/rankings`
  ];

  for (const base of bases) {
    for (const resName of resources) {
      const url = `${base}/${resName}`;
      try {
        console.log(`Testing: ${url}`);
        const res = await axios.get(url, { headers });
        console.log('FOUND!', res.status, url);
        return;
      } catch (e) {
        // ignore
      }
    }
  }
}
bruteForce();
