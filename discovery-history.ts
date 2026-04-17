import axios from 'axios';

async function discovery() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_term_id = '46620094'; 
  
  const toDate = new Date().toISOString().split('T')[0];
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const endpoints = [
    `rankings/history?url_term_id=${url_term_id}&from_date=${fromDate}&to_date=${toDate}`,
    `rankings/history?term_id=${url_term_id}&from_date=${fromDate}&to_date=${toDate}`,
    `terms/${url_term_id}/history?from_date=${fromDate}&to_date=${toDate}`,
    `urls/history?url_term_id=${url_term_id}&from_date=${fromDate}&to_date=${toDate}`,
    `rankings/evolution?url_term_id=${url_term_id}&from_date=${fromDate}&to_date=${toDate}`,
    `rankings/daily-evolution?url_term_id=${url_term_id}&from_date=${fromDate}&to_date=${toDate}`,
    `rankings/history/${url_term_id}?from_date=${fromDate}&to_date=${toDate}`,
    `history/rankings?url_term_id=${url_term_id}&from_date=${fromDate}&to_date=${toDate}`
  ];

  for (const path of endpoints) {
    const url = `https://api.proranktracker.com/v3/${path}`;
    try {
      console.log(`Testing: ${url}`);
      const res = await axios.get(url, { headers });
      console.log('--- FOUND! ---');
      console.log('Status:', res.status);
      console.log('Data sample:', JSON.stringify(res.data).substring(0, 500));
      return;
    } catch (e: any) {
       console.log(`Status ${e.response?.status} for ${path}`);
       if (e.response?.data) console.log('Error Data:', e.response.data);
    }
  }
}

discovery();
