async function testUpdateLot() {
  try {
    const res = await fetch('http://localhost:3000/fecthLocationInv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ binID: '208' })
    });
    const data = await res.json();
    console.log('Current Bin 208 Lot:', data);
  } catch (e) {
    console.error(e);
  }
}

testUpdateLot();
