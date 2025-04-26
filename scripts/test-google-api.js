import fetch from 'node-fetch';

const API_KEY = 'AIzaSyD3fGAuvgtbYkfS2f_ppskdfxKVGDjHdJw';

async function testPlaceAutocomplete() {
  const input = 'London';
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  console.log('📍 Place Autocomplete Status:', data.status);
  if (data.status === 'OK') {
    console.log('✅ Suggestions:', data.predictions.map(p => p.description));
  } else {
    console.error('❌ Error:', data.error_message || data.status);
  }
}

async function testDistanceMatrix() {
  const origins = 'London';
  const destinations = 'Manchester';
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  console.log('🛣️ Distance Matrix Status:', data.status);
  if (data.status === 'OK') {
    console.log('✅ Distance:', data.rows[0].elements[0].distance.text);
  } else {
    console.error('❌ Error:', data.error_message || data.status);
  }
}

(async () => {
  await testPlaceAutocomplete();
  await testDistanceMatrix();
})();
