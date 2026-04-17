import axios from 'axios';

async function discoveryFinal() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '46620094';
  
  const entries = [
    `https://api.proranktracker.com/v3/terms/${id}/daily`,
    `https://api.proranktracker.com/v3/urls/history?url_term_id=${id}`,
    `https://api.proranktracker.com/v3/rankings?history=1&url_term_id=${id}`,
    `https://api.proranktracker.com/v3/reports/history?id=${id}`
  ];

  for (const url of entries) {
    try {
       const res = await axios.get(url, { headers });
       console.log('Result!', res.status, url, JSON.stringify(res.data).substring(0, 200));
    } catch (e) {}
  }
}
discoveryFinal();
