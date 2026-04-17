import axios from 'axios';

async function dumpTermExtra() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  
  const flags = ['history=1', 'full=1', 'detailed=1', 'evolution=1', 'daily=1'];
  for (const f of flags) {
    try {
      const url = `https://api.proranktracker.com/v3/urls/${url_id}?${f}`;
      const res = await axios.get(url, { headers });
      console.log(`Flag ${f}:`, JSON.stringify(res.data).substring(0, 500));
    } catch (e) {}
  }
}
dumpTermExtra();
