import axios from 'axios';

async function findIds() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  
  try {
    const res = await axios.get('https://api.proranktracker.com/v3/urls?per_page=10', { headers });
    const data = res.data.data;
    
    if (data.url_terms && Array.isArray(data.url_terms)) {
        for (const ut of data.url_terms) {
            console.log(`URL_TERM_ID: ${ut.url_term_id}, TERM_ID: ${ut.term_id}, URL_ID: ${ut.url_id}`);
        }
    } else if (Array.isArray(data)) {
        // ... previous logic
    }
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
findIds();
