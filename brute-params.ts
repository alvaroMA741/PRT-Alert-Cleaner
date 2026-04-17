import axios from 'axios';

async function bruteParams() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const url_id = '1047392';
  
  const paramNames = [
    'id', 'url_id', 'urlid', 'u_id', 'url_item_id', 'item_id', 'uid', 'url', 'uri', 'path', 'link'
  ];

  for (const name of paramNames) {
    try {
      const url = `https://api.proranktracker.com/v3/urls/history?${name}=${url_id}`;
      const res = await axios.get(url, { headers });
      if (!JSON.stringify(res.data).includes('Url is not found')) {
        console.log('BINGO!', name, JSON.stringify(res.data));
        return;
      }
    } catch (e) {}
  }
}
bruteParams();
