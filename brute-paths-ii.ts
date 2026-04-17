import axios from 'axios';

async function brutePathSegments() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const segments = [
    'rankings/history',
    'rankings_history',
    'history/rankings',
    'history/daily',
    'evolution',
    'rankings/evolution',
    'reports/rankings/evolution',
    'reports/history',
    'url_terms/history',
    'ranking_history'
  ];

  for (const s of segments) {
    const url = `https://api.proranktracker.com/v3/${s}?url_term_id=${id}`;
    try {
      const res = await axios.get(url, { headers });
      console.log('--- FOUND! ---', s, res.status);
      return;
    } catch (e: any) {
      console.log('Failed:', s, e.response?.status);
    }
  }
}
brutePathSegments();
