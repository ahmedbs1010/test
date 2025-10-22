(async function(){
  const statusEl = document.getElementById('status');
  const resultEl = document.getElementById('result');
  const form = document.getElementById('predictForm');

  function setStatus(text){ if (statusEl) statusEl.textContent = text || ''; }
  function setResult(html){ if (resultEl) resultEl.innerHTML = html || ''; }

  async function loadClasses(){
    const res = await fetch('model/medal_classes.json');
    if (!res.ok) throw new Error('Impossible de charger les classes');
    return await res.json();
  }

  async function loadSession(){
    // Prefer WASM backend for broad compatibility
    const session = await ort.InferenceSession.create('model/medal_classifier.onnx', {
      executionProviders: ['wasm'],
    });
    return session;
  }

  function toTensorDict(inputs){
    // The exported model expects individual columns as inputs (skl2onnx with ColumnTransformer)
    // Columns: Age (float), Rank (float), Gender (string), NOC (string), Discipline (string), Sport (string)
    const age = parseFloat(document.getElementById('age').value || '0');
    const rank = parseFloat(document.getElementById('rank').value || '0');
    const gender = (document.getElementById('gender').value || '').trim();
    const noc = (document.getElementById('noc').value || '').trim();
    const discipline = (document.getElementById('discipline').value || '').trim();
    const sport = (document.getElementById('sport').value || '').trim();

    // ONNX Runtime Web expects TypedArrays for numeric, and string arrays for strings
    const inputs = {
      Age: new ort.Tensor('float32', new Float32Array([age]), [1,1]),
      Rank: new ort.Tensor('float32', new Float32Array([rank]), [1,1]),
      Gender: new ort.Tensor('string', [gender], [1,1]),
      NOC: new ort.Tensor('string', [noc], [1,1]),
      Discipline: new ort.Tensor('string', [discipline], [1,1]),
      Sport: new ort.Tensor('string', [sport], [1,1]),
    };
    return inputs;
  }

  function argmax(arr){
    let idx = 0; let max = -Infinity;
    for (let i=0;i<arr.length;i++){ if (arr[i] > max){ max = arr[i]; idx = i; } }
    return idx;
  }

  function fmtProb(p){ return (p*100).toFixed(1) + '%'; }

  let session, classes;
  try {
    setStatus('Chargement du modèle...');
    [classes, session] = await Promise.all([loadClasses(), loadSession()]);
    setStatus('Modèle prêt.');
  } catch (e) {
    console.error(e);
    setStatus('Erreur de chargement du modèle.');
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!session || !classes){ setStatus('Modèle non prêt.'); return; }
    try{
      setStatus('Prédiction en cours...');
      const feeds = toTensorDict();
      const output = await session.run(feeds);
      // Find first output which contains probabilities
      const firstKey = Object.keys(output)[0];
      const probs = Array.from(output[firstKey].data);
      const bestIdx = argmax(probs);
      const bestLabel = classes[bestIdx] || 'N/A';
      const pairs = classes.map((c, i) => ({label: c, p: probs[i] || 0})).sort((a,b)=>b.p-a.p);

      setResult(`
        <div class="prediction">
          <p><strong>Classe prédite:</strong> ${bestLabel}</p>
          <ul class="legend">
            ${pairs.map(p=>`<li>${p.label}: ${fmtProb(p.p)}</li>`).join('')}
          </ul>
        </div>
      `);
      setStatus('');
    } catch(err){
      console.error(err);
      setStatus('Erreur pendant l\'inférence.');
    }
  });
})();
