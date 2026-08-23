async function testGeocode() {
  const lat = 7.287673145051603;
  const lon = 125.6933180289759;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
      headers: {
        'User-Agent': 'BlueWaste-Admin/1.0'
      }
    });
    const data = await res.json();
    console.log("Geocoded:", data.display_name);
  } catch (err) {
    console.error(err);
  }
}
testGeocode();
