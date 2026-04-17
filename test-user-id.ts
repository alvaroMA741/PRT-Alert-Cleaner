import axios from 'axios';

async function testUserFailId() {
  const token = '50094-DKNO6PWCJT6X';
  const headers = { 'X-TOKEN': token };
  const id = '49887405';
  
  try {
    const url = `https://api.proranktracker.com/v3/urls/history?id=${id}`;
    const res = await axios.get(url, { headers });
    console.log('Result!', res.status, JSON.stringify(res.data));
  } catch (e: any) {
    console.log('Failed:', e.response?.status);
  }
}
testUserFailId();
