(async ()=>{
  try{
    const res = await fetch('http://localhost:4000/api/gemini/generate',{
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ prompt: 'Test ping from temp script' })
    });
    const text = await res.text();
    console.log('RESPONSE:', text);
  }catch(e){
    console.error('ERR', e);
    process.exit(1);
  }
})();
