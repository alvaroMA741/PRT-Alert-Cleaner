import axios from 'axios';

async function checkId() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '49887405';
  
  const endpoints = [
    `urls/${id}`,
    `terms/${id}`,
    `url_terms/${id}`,
    `rankings/${id}`
  ];

  for (const e of endpoints) {
    try {
      const url = `https://api.proranktracker.com/v3/${e}`;
      const res = await axios.get(url, { headers });
      console.log('Result!', e, res.status);
    } catch (err: any) {
      console.log('Failed!', e, err.response?.status);
    }
  }
}
checkId();
