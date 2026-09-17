async function testUpdateLot() {
  try {
    const res = await fetch('http://localhost:3000/updateLot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BinID: '208',
        DrugCd: 'HYDRO2',
        In_Qty: 4,
        LotNo: 'LOT20260902',
        Exp: '2028-09-02'
      })
    });
    const result = await res.json();
    console.log('updateLot result:', result);

    const resCheck = await fetch('http://localhost:3000/fecthLocationInv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ binID: '208' })
    });
    console.log('After update lot:', await resCheck.json());
  } catch (e) {
    console.error(e);
  }
}

testUpdateLot();
