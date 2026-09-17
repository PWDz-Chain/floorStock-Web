async function checkEndpoints() {
  try {
    // Check inventory
    const resInv = await fetch('http://localhost:3000/inventory');
    const inv = await resInv.json();
    console.log('Total inventory bins:', inv.length);
    console.log('Sample bin:', inv.find(b => b.binID == 208) || inv[0]);
  } catch (e) {
    console.error(e);
  }
}

checkEndpoints();
