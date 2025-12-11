// Sistema de Checklist de Fiscalização
const checklistQuestions = [
  {id: 1, category: "Documentação", question: "1. Efetivo do Posto (Avaliar pelo Programa de Gestão de Competências e Requisitos do Cliente).", color: "#4FC3F7"},
  {id: 2, category: "Documentação", question: "2. Postura e Apresentação (Avaliar o Atendimento, Iniciativa, Comportamento e Condições de Uniforme)", color: "#4FC3F7"},
  {id: 3, category: "Documentação", question: "3. Livro de Ocorrências (Avaliar o preenchimento correto, assinaturas e acumulo de livros de mesês anteriores).", color: "#4FC3F7"},
  {id: 4, category: "Segurança", question: "4. Equipamentos do Posto (Avaliar as condições e quantidades de material carga do posto).", color: "#66BB6A"},
  {id: 5, category: "Segurança", question: "5. Armamento e Colete Balístico (Avaliar as condições, quantidades, licenças e validades das armas e coletes).", color: "#66BB6A"},
  {id: 6, category: "Segurança", question: "6. Carteira Nacional de Vigilante - CNV (Avaliar o porte e validade das CNVs dos Vigilantes).", color: "#66BB6A"},
  {id: 7, category: "Segurança", question: "7. Condições do Posto (Avaliar a necessidade de manutenção predial e defeitos na segurança eletrônica etc).", color: "#66BB6A"},
];

let checklistData = {};

// Lista de fiscais (carrega do localStorage se disponível)
let listaDeFiscais = JSON.parse(localStorage.getItem('listaDeFiscais') || 'null') || [
  "Valdir Xavier de Souza",
  "Rafael de Jesus Caseiro",
  "Yago Pires do Rosario",
  "Juan Ferreira Gomes",
  "Joaquim Candido",
  "Ricardo oliveira",
  "Genessy"
];

// Lista de locais de fiscalização (carrega do localStorage se disponível)
let locaisDeFiscalizacao = JSON.parse(localStorage.getItem('locaisDeFiscalizacao') || 'null') || [
  "COBERTURA",
  "CONDOMINIO BRISTOL PRAIA DO CANTO APART",
  "CONDOMINIO DO EDIFICIO JUAN FERNANDES",
  "CONDOMINIO DO EDIFICIO ROMA",
  "DIACO DISTRIBUIDORA DE ACO S.A",
  "DRIFT COM DE ALIM S/A - CARONE P. COSTA",
  "DRIFT COMERCIO DE ALIMENTOS S/A - CARONE GAIVOTAS",
  "DRIFT COMERCIO DE ALIMENTOS S.A - ITAPOA",
  "ELKEM PARTICIPACOES, IND. E COM. LTDA",
  "ESCOLA ENS FUDAMENTAL E MEDIO LINUS PAULING LTDA",
  "EXTRAFRUTI SA - COMERCIO DE HORTIFRUTIGRANJEIROS",
  "FUNDACAO ESTADUAL DE INOVACAO EM SAUDE",
  "FUNDO MUNICIPAL DE SAUDE DE PRESIDENTE K",
  "IEMA- INST. ESTADUAL DE MEIO AMBIENTE E RECUR.HIDR",
  "IESP-INSTITUTO ESPERANCA",
  "LISA APEX- LOGISTICA INTEGRADA SULAMERICANA S.A",
  "LISA LOGISTICA INTEGRADA SULAMERICNAS SA",
  "MPU- MINISTERIO PUBLICO DA UNIAO",
  "PA DO TREVO - INSTITUTO ESPERANCA",
  "PA TREVO - INTITUTO ESPERANÇA",
  "PANIFICADORA E ROTISSERIA MONZA LTDA",
  "REALMAR DISTRIBUIDORA LTDA - BARRAMARES",
  "REALMAR DISTRIBUIDORA LTDA- ALTO LAGE",
  "R3L EMPREENDIMENTOS IMOBILIARIOS LTDA",
  "SAO JOSE EMPREEND. IMOB. E PARTICIPAÇÕES SPE LTDA",
  "SECTI - SECRETARIA EST.CIENCIA TECN.INOV EDUC PROF",
  "SEGER - SECRETARIA DE ESTADO DE GESTAO E RH",
  "SIMEC- COMPANHIA SIDERURGICA DO ES SA",
  "PRO MATRE -ISCMV"
];

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toLocaleDateString('pt-BR');
  document.getElementById('current-date').textContent = today;

  const inspectorInput = document.getElementById('inspector');
  const clearInspectorBtn = document.getElementById('clear-inspector');
  if (inspectorInput) {
    // Inicializa badge com valor salvo ou atual
    try {
      const inspectorSaved = localStorage.getItem('inspectorName');
      const initialInspector = inspectorSaved || inspectorInput.value || '';
      document.getElementById('inspector-name').textContent = initialInspector || '-';
    } catch {}
    inspectorInput.addEventListener('input', (e) => {
      document.getElementById('inspector-name').textContent = e.target.value || '-';
      try { localStorage.setItem('inspectorName', (e.target.value || '').trim()); } catch {}
    });
    inspectorInput.addEventListener('change', (e) => {
      document.getElementById('inspector-name').textContent = e.target.value || '-';
      try { localStorage.setItem('inspectorName', (e.target.value || '').trim()); } catch {}
    });
  }

  renderChecklist();
  updateSummary();
  loadFromLocalStorage();
  populateInspectorDatalist();
  populateLocationDatalist();

    // Sync header badge with selected location in real time
    const locationInput = document.getElementById('location');
    const locationBadge = document.getElementById('location-name');
  const clearLocationBtn = document.getElementById('clear-location');

    if (locationInput && locationBadge) {
      // Initialize from saved value or current input
      try {
        const saved = JSON.parse(localStorage.getItem('checklistData'));
        const initialLocation = saved?.geolocation?.locationName || locationInput.value || '';
        if (initialLocation) {
          locationBadge.textContent = initialLocation;
        }
      } catch (e) {
        // fallback silently
      }

      const updateLocationBadge = (name) => {
        const newName = (name || '').trim();
        locationBadge.textContent = newName || '—';
        // persist minimal info to localStorage under checklistData.geolocation.locationName
        try {
          const data = JSON.parse(localStorage.getItem('checklistData')) || {};
          data.geolocation = data.geolocation || {};
          data.geolocation.locationName = newName;
          localStorage.setItem('checklistData', JSON.stringify(data));
        } catch (e) {
          // ignore storage errors
        }
      };

      // Update on input and change (covers typing and selection from datalist)
      locationInput.addEventListener('input', (e) => updateLocationBadge(e.target.value));
      locationInput.addEventListener('change', (e) => updateLocationBadge(e.target.value));
    }

  // Clear location selection on X button
  if (locationInput && locationBadge && clearLocationBtn) {
    clearLocationBtn.addEventListener('click', () => {
      locationInput.value = '';
      locationBadge.textContent = '—';
      try {
        const data = JSON.parse(localStorage.getItem('checklistData')) || {};
        data.geolocation = data.geolocation || {};
        data.geolocation.locationName = '';
        localStorage.setItem('checklistData', JSON.stringify(data));
      } catch (e) {
        // ignore storage errors
      }
    });
  }

  // Clear inspector selection on X button
  if (inspectorInput && clearInspectorBtn) {
    clearInspectorBtn.addEventListener('click', () => {
      inspectorInput.value = '';
      const badge = document.getElementById('inspector-name');
      if (badge) badge.textContent = '-';
      try {
        localStorage.setItem('inspectorName', '');
        const data = JSON.parse(localStorage.getItem('checklistData')) || {};
        data.inspectorClearedAt = new Date().toISOString();
        localStorage.setItem('checklistData', JSON.stringify(data));
      } catch (e) {
        // ignore storage errors
      }
    });
  }
});

// Função para preencher o datalist com os fiscais
function populateInspectorDatalist() {
  const datalist = document.getElementById('inspector-datalist');
  if (!datalist) return;
  datalist.innerHTML = '';
  listaDeFiscais.forEach(fiscal => {
    const option = document.createElement('option');
    option.value = fiscal;
    datalist.appendChild(option);
  });
}

// Função para preencher o datalist com os locais
function populateLocationDatalist() {
  const datalist = document.getElementById('location-datalist');
  if (!datalist) return;
  datalist.innerHTML = '';
  locaisDeFiscalizacao.forEach(local => {
    const option = document.createElement('option');
    option.value = local;
    datalist.appendChild(option);
  });
}

// Adicionar novo inspetor via prompt e persistir
function addInspectorPrompt() {
  const name = prompt('Novo Inspetor — Informe o nome:');
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  if (listaDeFiscais.includes(trimmed)) {
    showToast('Inspetor já existe', 'info');
    return;
  }
  listaDeFiscais.push(trimmed);
  saveInspectorList();
  populateInspectorDatalist();
  const inp = document.getElementById('inspector');
  if (inp) inp.value = trimmed;
  showToast(`Inspetor "${trimmed}" adicionado.`, 'success');
}

function saveInspectorList() {
  try { localStorage.setItem('listaDeFiscais', JSON.stringify(listaDeFiscais)); } catch(e){}
}

// Adicionar novo centro de custo via prompt e persistir
function addLocationPrompt() {
  const name = prompt('Novo Centro de Custo — Informe o nome:');
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  if (locaisDeFiscalizacao.includes(trimmed)) {
    showToast('Local já existe', 'info');
    return;
  }
  locaisDeFiscalizacao.push(trimmed);
  locaisDeFiscalizacao.sort();
  saveLocationList();
  populateLocationDatalist();
  const inp = document.getElementById('location');
  if (inp) inp.value = trimmed;
  showToast(`Centro de custo "${trimmed}" adicionado.`, 'success');
}

function saveLocationList() {
  try { localStorage.setItem('locaisDeFiscalizacao', JSON.stringify(locaisDeFiscalizacao)); } catch(e){}
}

function renderChecklist() {
  const container = document.getElementById('checklist-container');
  if (!container) return;

  let currentCategory = '';
  let html = '';

  checklistQuestions.forEach(item => {
    if (item.category !== currentCategory) {
      if (currentCategory !== '') {
        html += '</div></div>';
      }
      currentCategory = item.category;
      html += `<div class="checklist-category">
        <h3 class="category-title">${item.category}</h3>
        <div class="category-items">`;
    }

    const savedValue = checklistData[item.id] || '';
    const hasNonConformity = savedValue === 'nao-conforme';
    const savedFiles = checklistData[item.id + '_files'] || [];
    const savedReason = checklistData[item.id + '_reason'] || '';
    
    html += `
      <div class="checklist-item" data-id="${item.id}">
        <div class="question" style="color:#000000">${item.question}</div>
        <div class="answer-options">
          <button class="answer-btn ${savedValue === 'conforme' ? 'selected conforme' : ''}" onclick="selectAnswer(${item.id}, 'conforme')">✓ Em Conforme</button>
          <button class="answer-btn ${savedValue === 'nao-conforme' ? 'selected nao-conforme' : ''}" onclick="selectAnswer(${item.id}, 'nao-conforme')">✗ Não Conforme</button>
          <button class="answer-btn ${savedValue === 'na' ? 'selected na' : ''}" onclick="selectAnswer(${item.id}, 'na')">— N/A</button>
        </div>
        <div class="non-conformity-section" id="nc-section-${item.id}" style="display:${hasNonConformity ? 'block' : 'none'}">
          <div class="non-conformity-alert">
            ⚠️ <strong>Não Conformidade Detectada</strong> - Por favor, forneça evidências e descrição
          </div>
          <div class="non-conformity-reason">
            <label class="nc-label">📝 Descreva a não conformidade encontrada:</label>
            <textarea class="nc-reason-input" id="nc-reason-${item.id}" placeholder="Descreva detalhadamente o motivo da não conformidade..." onchange="saveNonConformityReason(${item.id}, this.value)">${savedReason}</textarea>
          </div>
          <div class="non-conformity-files">
            <label class="nc-label">📷 Anexar evidências (fotos/arquivos):</label>
            <input type="file" class="file-input" id="file-input-${item.id}" accept="image/*,.pdf,.doc,.docx" multiple onchange="handleFileUpload(${item.id}, this.files)">
            <div class="file-preview" id="file-preview-${item.id}">
              ${savedFiles.length > 0 ? savedFiles.map((file, idx) => `
                <div class="file-item">
                  ${file.type.startsWith('image/') ? 
                    `<img src="${file.data}" alt="${file.name}" class="file-thumbnail" onclick="viewFile(${item.id}, ${idx})">` : 
                    `<span class="file-icon">📄</span>`
                  }
                  <span class="file-name" onclick="viewFile(${item.id}, ${idx})">${file.name}</span>
                  <span class="file-size">(${formatFileSize(file.size)})</span>
                  <button class="remove-file-btn" onclick="removeFile(${item.id}, ${idx})">✕</button>
                </div>
              `).join('') : '<p class="no-files">Nenhum arquivo anexado</p>'}
            </div>
          </div>
        </div>
        <textarea class="observation" placeholder="Observações gerais (opcional)" onchange="saveObservation(${item.id}, this.value)">${checklistData[item.id + '_obs'] || ''}</textarea>
      </div>
    `;
  });

  html += '</div></div>';
  container.innerHTML = html;
}

function selectAnswer(id, answer) {
  // Verificar se é fiscal
  const userType = sessionStorage.getItem('argos_tipo');
  if (userType === 'fiscal') {
    showToast('⚠️ Usuários fiscais não podem responder o checklist', 'error');
    return;
  }
  
  const item = document.querySelector(`.checklist-item[data-id="${id}"]`);
  const buttons = item.querySelectorAll('.answer-btn');
  
  buttons.forEach(btn => btn.classList.remove('selected', 'conforme', 'nao-conforme', 'na'));
  
  const selectedBtn = Array.from(buttons).find(btn => {
    if (answer === 'conforme') return btn.textContent.includes('Em Conforme');
    if (answer === 'nao-conforme') return btn.textContent.includes('Não Conforme');
    if (answer === 'na') return btn.textContent.includes('N/A');
  });
  
  if (selectedBtn) {
    selectedBtn.classList.add('selected', answer);
  }
  
  const ncSection = document.getElementById(`nc-section-${id}`);
  if (ncSection) {
    if (answer === 'nao-conforme') {
      ncSection.style.display = 'block';
      setTimeout(() => {
        ncSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      ncSection.style.display = 'none';
      delete checklistData[id + '_reason'];
      delete checklistData[id + '_files'];
    }
  }
  
  checklistData[id] = answer;
  updateSummary();
  saveToLocalStorage();
}

function saveNonConformityReason(id, reason) {
  // Verificar se é fiscal
  const userType = sessionStorage.getItem('argos_tipo');
  if (userType === 'fiscal') {
    return;
  }
  
  checklistData[id + '_reason'] = reason;
  saveToLocalStorage();
}

function handleFileUpload(id, files) {
  // Verificar se é fiscal
  const userType = sessionStorage.getItem('argos_tipo');
  if (userType === 'fiscal') {
    showToast('⚠️ Usuários fiscais não podem anexar arquivos', 'error');
    return;
  }
  
  if (!files || files.length === 0) return;
  
  const fileArray = checklistData[id + '_files'] || [];
  
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      fileArray.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target.result
      });
      checklistData[id + '_files'] = fileArray;
      updateFilePreview(id);
      saveToLocalStorage();
      showToast(`Arquivo "${file.name}" adicionado com sucesso`, 'success');
    };
    reader.readAsDataURL(file);
  });
}

function updateFilePreview(id) {
  const preview = document.getElementById(`file-preview-${id}`);
  const files = checklistData[id + '_files'] || [];
  
  if (files.length === 0) {
    preview.innerHTML = '<p class="no-files">Nenhum arquivo anexado</p>';
    return;
  }
  
  preview.innerHTML = files.map((file, idx) => `
    <div class="file-item">
      ${file.type.startsWith('image/') ? 
        `<img src="${file.data}" alt="${file.name}" class="file-thumbnail" onclick="viewFile(${id}, ${idx})">` : 
        `<span class="file-icon">📄</span>`
      }
      <span class="file-name" onclick="viewFile(${id}, ${idx})">${file.name}</span>
      <span class="file-size">(${formatFileSize(file.size)})</span>
      <button class="remove-file-btn" onclick="removeFile(${id}, ${idx})">✕</button>
    </div>
  `).join('');
}

function removeFile(id, index) {
  const files = checklistData[id + '_files'] || [];
  const fileName = files[index].name;
  files.splice(index, 1);
  checklistData[id + '_files'] = files;
  updateFilePreview(id);
  saveToLocalStorage();
  showToast(`Arquivo "${fileName}" removido`, 'info');
}

function viewFile(id, index) {
  const files = checklistData[id + '_files'] || [];
  const file = files[index];
  
  if (file.type.startsWith('image/')) {
    const modal = document.createElement('div');
    modal.className = 'file-modal';
    modal.innerHTML = `
      <div class="file-modal-content">
        <button class="file-modal-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        <img src="${file.data}" alt="${file.name}">
        <p>${file.name}</p>
      </div>
    `;
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    document.body.appendChild(modal);
  } else {
    const a = document.createElement('a');
    a.href = file.data;
    a.download = file.name;
    a.click();
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function saveObservation(id, value) {
  // Verificar se é fiscal
  const userType = sessionStorage.getItem('argos_tipo');
  if (userType === 'fiscal') {
    return;
  }
  
  checklistData[id + '_obs'] = value;
  saveToLocalStorage();
}

function updateSummary() {
  const conforme = Object.values(checklistData).filter(v => v === 'conforme').length;
  const naoConforme = Object.values(checklistData).filter(v => v === 'nao-conforme').length;
  const na = Object.values(checklistData).filter(v => v === 'na').length;
  const pending = checklistQuestions.length - conforme - naoConforme - na;

  document.getElementById('conformeCount').textContent = conforme;
  document.getElementById('naoConformeCount').textContent = naoConforme;
  document.getElementById('naCount').textContent = na;
  document.getElementById('pendingCount').textContent = pending;
}

function saveToLocalStorage() {
  localStorage.setItem('checklistData', JSON.stringify(checklistData));
  localStorage.setItem('inspectorName', document.getElementById('inspector')?.value || '');
  localStorage.setItem('location', document.getElementById('location')?.value || '');
  localStorage.setItem('reference', document.getElementById('reference')?.value || '');
  localStorage.setItem('route', document.getElementById('route')?.value || '');
  localStorage.setItem('generalNotes', document.getElementById('general-notes')?.value || '');
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('checklistData');
  if (saved) {
    checklistData = JSON.parse(saved);
    renderChecklist();
    updateSummary();
  }
  
  const inspector = localStorage.getItem('inspectorName');
  if (inspector) {
    document.getElementById('inspector').value = inspector;
    document.getElementById('inspector-name').textContent = inspector;
  }
  
  const location = localStorage.getItem('location');
  if (location) document.getElementById('location').value = location;
  
  const reference = localStorage.getItem('reference');
  if (reference) document.getElementById('reference').value = reference;
  
  const route = localStorage.getItem('route');
  if (route) document.getElementById('route').value = route;
  
  const notes = localStorage.getItem('generalNotes');
  if (notes) document.getElementById('general-notes').value = notes;
}

function resetChecklist() {
  if (!confirm('Tem certeza que deseja limpar todos os dados do checklist?')) return;
  
  checklistData = {};
  localStorage.removeItem('checklistData');
  localStorage.removeItem('inspectorName');
  localStorage.removeItem('location');
  localStorage.removeItem('reference');
  localStorage.removeItem('generalNotes');
  
  document.getElementById('inspector').value = '';
  document.getElementById('inspector-name').textContent = '-';
  document.getElementById('location').value = '';
  document.getElementById('reference').value = '';
  if (document.getElementById('geolocation')) {
    document.getElementById('geolocation').value = '';
  }
  document.getElementById('geo-status').textContent = '';
  document.getElementById('general-notes').value = '';
  renderChecklist();
  updateSummary();
  showToast('Checklist limpo com sucesso!', 'success');
}

function exportToJSON() {
  const data = {
    date: new Date().toLocaleDateString('pt-BR'),
    timestamp: new Date().getTime(),
    inspector: document.getElementById('inspector')?.value || 'Não informado',
    location: document.getElementById('location')?.value || 'Não informado',
    reference: document.getElementById('reference')?.value || 'Não informado',
    route: document.getElementById('route')?.value || 'Não informada',
    geolocation: checklistData.geolocation || null,
    generalNotes: document.getElementById('general-notes')?.value || '',
    answers: [],
    summary: {
      conforme: parseInt(document.getElementById('conformeCount').textContent),
      naoConforme: parseInt(document.getElementById('naoConformeCount').textContent),
      na: parseInt(document.getElementById('naCount').textContent),
      pending: parseInt(document.getElementById('pendingCount').textContent)
    }
  };

  checklistQuestions.forEach(q => {
    const answer = {
      id: q.id,
      category: q.category,
      question: q.question,
      answer: checklistData[q.id] || 'Sem resposta',
      observation: checklistData[q.id + '_obs'] || ''
    };
    
    if (checklistData[q.id] === 'nao-conforme') {
      answer.nonConformity = {
        reason: checklistData[q.id + '_reason'] || '',
        filesCount: (checklistData[q.id + '_files'] || []).length,
        files: (checklistData[q.id + '_files'] || []).map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
          data: f.data
        }))
      };
    }
    
    data.answers.push(answer);
  });

  saveToHistory(data);

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `checklist_${new Date().getTime()}.json`;
  a.click();
  showToast('JSON exportado e salvo no histórico!', 'success');
}

function saveToHistory(data) {
  let allRecords = [];
  const saved = localStorage.getItem('allChecklistRecords');
  if (saved) {
    allRecords = JSON.parse(saved);
  }
  allRecords.push(data);
  localStorage.setItem('allChecklistRecords', JSON.stringify(allRecords));
}

function saveRecord() {
  const saveStatus = document.getElementById('save-status');
  
  // Valida campos obrigatórios
  const inspector = document.getElementById('inspector')?.value;
  const location = document.getElementById('location')?.value;
  
  if (!inspector || !location) {
    saveStatus.textContent = '⚠️ Preencha o nome do fiscal e o local da fiscalização';
    saveStatus.style.color = '#ffd700';
    showToast('Preencha os campos obrigatórios!', 'error');
    return;
  }
  
  // Verifica se há ao menos uma resposta
  const hasAnswers = Object.keys(checklistData).some(key => {
    return !isNaN(key) && checklistData[key];
  });
  
  if (!hasAnswers) {
    saveStatus.textContent = '⚠️ Responda ao menos uma pergunta do checklist';
    saveStatus.style.color = '#ffd700';
    showToast('Responda ao menos uma pergunta!', 'error');
    return;
  }
  
  saveStatus.textContent = '🔄 Salvando registro...';
  saveStatus.style.color = 'var(--accent)';
  
  try {
    // Monta o objeto de dados
    const data = {
      date: new Date().toLocaleDateString('pt-BR'),
      timestamp: new Date().getTime(),
      inspector: inspector,
      location: location,
      reference: document.getElementById('reference')?.value || 'Não informado',
      arrivalTime: document.getElementById('reference')?.value || 'Não informado',
      exitTime: document.getElementById('exit-time')?.value || 'Não informado',
      route: document.getElementById('route')?.value || 'Não informada',
      geolocation: checklistData.geolocation || null,
      generalNotes: document.getElementById('general-notes')?.value || '',
      summary: {
        conforme: 0,
        naoConforme: 0,
        na: 0,
        pending: 0
      },
      answers: []
    };
    
    // Processa as respostas
    checklistQuestions.forEach(q => {
      const answer = checklistData[q.id];
      const answerObj = {
        id: q.id,
        category: q.category,
        question: q.question,
        answer: answer || 'pending',
        observation: checklistData[q.id + '_obs'] || ''
      };
      
      if (answer === 'conforme') data.summary.conforme++;
      else if (answer === 'nao-conforme') {
        data.summary.naoConforme++;
        answerObj.nonConformity = {
          reason: checklistData[q.id + '_reason'] || '',
          filesCount: (checklistData[q.id + '_files'] || []).length,
          files: (checklistData[q.id + '_files'] || []).map(f => ({
            name: f.name,
            type: f.type,
            size: f.size,
            data: f.data
          }))
        };
      } else if (answer === 'na') data.summary.na++;
      else data.summary.pending++;
      
      data.answers.push(answerObj);
    });
    
    // Salva no histórico
    saveToHistory(data);
    
    saveStatus.textContent = `✅ Registro salvo com sucesso! (${new Date().toLocaleTimeString('pt-BR')})`;
    saveStatus.style.color = '#00e676';
    showToast('Registro salvo no histórico!', 'success');
    
    // Opcional: limpar após alguns segundos
    setTimeout(() => {
      if (confirm('Registro salvo! Deseja limpar o formulário para uma nova fiscalização?')) {
        resetChecklist();
      }
    }, 2000);
    
  } catch (error) {
    console.error('Erro ao salvar registro:', error);
    saveStatus.textContent = '❌ Erro ao salvar registro';
    saveStatus.style.color = '#ff5252';
    showToast('Erro ao salvar registro!', 'error');
  }
}

function exportToPDF() {
  // Cria uma janela de impressão com o conteúdo formatado
  const printWindow = window.open('', '_blank');
  
  const inspector = document.getElementById('inspector')?.value || 'Não informado';
  const location = document.getElementById('location')?.value || 'Não informado';
  const reference = document.getElementById('reference')?.value || 'Não informado';
  const route = document.getElementById('route')?.value || 'Não informada';
  const generalNotes = document.getElementById('general-notes')?.value || '';
  
  let answersHTML = '';
  let currentCategory = '';
  
  checklistQuestions.forEach(q => {
    // Agrupa por categoria
    if (q.category && q.category !== currentCategory) {
      if (currentCategory !== '') {
        answersHTML += '</div>';
      }
      currentCategory = q.category;
      answersHTML += `
        <div style="margin-top:20px;page-break-inside:avoid">
          <div style="background:#00d4ff;color:#fff;padding:8px 12px;font-weight:700;font-size:13px;margin-bottom:10px">
            ${currentCategory}
          </div>
      `;
    }
    
    const answer = checklistData[q.id] || 'Sem resposta';
    const observation = checklistData[q.id + '_obs'] || '';
    const reason = checklistData[q.id + '_reason'] || '';
    const files = checklistData[q.id + '_files'] || [];
    
    const statusText = answer === 'conforme' ? '✓ CONFORME' : 
                      answer === 'nao-conforme' ? '✗ NÃO CONFORME' : 
                      answer === 'na' ? '— N/A' : '⚠ SEM RESPOSTA';
    const statusSymbol = answer === 'conforme' ? '☑' : 
                        answer === 'nao-conforme' ? '☒' : 
                        answer === 'na' ? '☐' : '❓';
    const statusColor = answer === 'conforme' ? '#00e676' : 
                       answer === 'nao-conforme' ? '#ff5252' : 
                       answer === 'na' ? '#9aa6bf' : '#ffd700';
    
    // Gerar HTML das imagens (apenas imagens, não outros arquivos)
    let imagesHTML = '';
    if (answer === 'nao-conforme' && files.length > 0) {
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        imagesHTML = '<div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">';
        imageFiles.forEach(file => {
          imagesHTML += `
            <div style="border:2px solid #ff9800;border-radius:8px;overflow:hidden;background:#fff">
              <img src="${file.data}" alt="${file.name}" style="width:100%;height:auto;display:block;max-height:300px;object-fit:contain">
              <div style="padding:5px;background:#fff3cd;font-size:10px;color:#856404;text-align:center;border-top:1px solid #ff9800">
                ${file.name}
              </div>
            </div>
          `;
        });
        imagesHTML += '</div>';
      }
    }
    
    answersHTML += `
      <table style="width:100%;border-collapse:collapse;margin-bottom:15px;border:1px solid #ddd;page-break-inside:avoid">
        <tr>
          <td style="padding:10px;background:#f9f9f9;border-bottom:1px solid #ddd;font-size:12px;font-weight:600;color:#333">
            ${q.question}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border-bottom:1px solid #ddd">
            <span style="color:${statusColor};font-weight:700;font-size:18px;margin-right:8px">${statusSymbol}</span>
            <span style="color:${statusColor};font-weight:700;font-size:12px">${statusText}</span>
          </td>
        </tr>
        ${observation ? `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd;font-size:11px;background:#fafafa">
              <strong>Observação:</strong> ${observation}
            </td>
          </tr>
        ` : ''}
        ${answer === 'nao-conforme' && (reason || files.length > 0) ? `
          <tr>
            <td style="padding:10px;background:#fff3cd">
              <div style="font-size:11px;color:#856404">
                ${reason ? `<strong>📝 Descrição da Não Conformidade:</strong><br>${reason}` : ''}
                ${files.length > 0 ? `<br><br><strong>📎 Evidências anexadas:</strong> ${files.length} arquivo(s)` : ''}
              </div>
              ${imagesHTML}
            </td>
          </tr>
        ` : ''}
      </table>
    `;
  });
  
  if (currentCategory !== '') {
    answersHTML += '</div>';
  }
  
  const conforme = Object.values(checklistData).filter(v => v === 'conforme').length;
  const naoConforme = Object.values(checklistData).filter(v => v === 'nao-conforme').length;
  const na = Object.values(checklistData).filter(v => v === 'na').length;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Fiscalização - ${location}</title>
      <style>
        @page { margin: 1.5cm; }
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          background: #fff;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          border-bottom: 4px solid #00d4ff;
          margin-bottom: 20px;
          background: linear-gradient(to right, #f8f9fa, #fff);
        }
        .header-logo {
          flex: 0 0 150px;
        }
        .header-logo img {
          width: 140px;
          height: auto;
        }
        .header-info {
          flex: 1;
          text-align: center;
        }
        .header-info h1 {
          margin: 0 0 5px 0;
          color: #00d4ff;
          font-size: 22px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .header-info h2 {
          margin: 0;
          color: #666;
          font-size: 14px;
          font-weight: 600;
        }
        .header-date {
          flex: 0 0 150px;
          text-align: right;
          font-size: 11px;
          color: #666;
        }
        .info-box {
          border: 2px solid #00d4ff;
          padding: 0;
          margin: 0 20px 20px 20px;
          page-break-inside: avoid;
        }
        .info-box-header {
          background: #00d4ff;
          color: #fff;
          padding: 8px 15px;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
        }
        .info-box-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .info-item {
          padding: 10px 15px;
          font-size: 12px;
          border-bottom: 1px solid #e0e0e0;
          border-right: 1px solid #e0e0e0;
        }
        .info-item:nth-child(2n) {
          border-right: none;
        }
        .info-item strong {
          color: #00d4ff;
          display: inline-block;
          min-width: 80px;
        }
        .info-item.full {
          grid-column: 1 / -1;
          border-right: none;
        }
        .summary {
          display: flex;
          justify-content: space-around;
          margin: 25px 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item .number {
          font-size: 28px;
          font-weight: 700;
          display: block;
        }
        .summary-item .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        .conforme { color: #00e676; }
        .nao-conforme { color: #ff5252; }
        .na { color: #9aa6bf; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          font-size: 11px;
          color: #999;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-logo">
          <img src="arg/Logo-Argosvig-2-e1745505100362.webp" alt="ARGOS Logo">
        </div>
        <div class="header-info">
          <h1>Relatório de Fiscalização</h1>
          <h2>Sistema ARGOS de Inspeção Operacional</h2>
        </div>
        <div class="header-date">
          <strong>Data de Emissão:</strong><br>
          ${new Date().toLocaleDateString('pt-BR')}<br>
          ${new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>
      
      <div class="info-box">
        <div class="info-box-header">DADOS DA FISCALIZAÇÃO</div>
        <div class="info-box-content">
          <div class="info-item"><strong>Local:</strong> ${location}</div>
          <div class="info-item"><strong>Fiscal:</strong> ${inspector}</div>
          <div class="info-item"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</div>
          <div class="info-item"><strong>Protocolo:</strong> ${reference}</div>
          ${checklistData.geolocation ? `
            <div class="info-item full"><strong>Localização GPS:</strong> ${checklistData.geolocation.address || checklistData.geolocation.coordinates || 'Não disponível'}</div>
          ` : ''}
        </div>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <span class="number conforme">${conforme}</span>
          <span class="label">Em Conforme</span>
        </div>
        <div class="summary-item">
          <span class="number nao-conforme">${naoConforme}</span>
          <span class="label">Não Conforme</span>
        </div>
        <div class="summary-item">
          <span class="number na">${na}</span>
          <span class="label">N/A</span>
        </div>
      </div>
      
      <div style="margin:0 20px 20px 20px">
        <div style="background:#333;color:#fff;padding:10px 15px;font-weight:700;font-size:14px;text-transform:uppercase;margin-bottom:15px">
          Checklist de Inspeção
        </div>
        ${answersHTML}
      </div>
      
      ${generalNotes ? `
        <div style="margin:0 20px 20px 20px;border:2px solid #333;page-break-inside:avoid">
          <div style="background:#333;color:#fff;padding:8px 15px;font-weight:700;font-size:13px">
            OBSERVAÇÕES GERAIS
          </div>
          <div style="padding:15px;font-size:12px;color:#333;line-height:1.6">
            ${generalNotes}
          </div>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <p>© ${new Date().getFullYear()} Sistema ARGOS de Fiscalização - Todos os direitos reservados</p>
      </div>
      
      <div class="no-print" style="position:fixed;top:20px;right:20px;background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.2);z-index:9999">
        <button onclick="window.print()" style="padding:10px 20px;background:#00d4ff;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:600">🖨️ Imprimir / Salvar PDF</button>
        <button onclick="window.close()" style="padding:10px 20px;background:#ff5252;color:#fff;border:none;border-radius:5px;cursor:pointer;margin-left:10px;font-weight:600">✕ Fechar</button>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Aguarda o carregamento e abre o diálogo de impressão
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.focus();
    }, 250);
  };
  
  showToast('Janela de impressão aberta. Use "Salvar como PDF" para exportar.', 'success');
}

function printReport() {
  window.print();
}

async function getGeolocation() {
  const geoInput = document.getElementById('geolocation');
  const geoStatus = document.getElementById('geo-status');
  
  if (!navigator.geolocation) {
    geoStatus.textContent = '❌ Geolocalização não disponível neste navegador';
    geoStatus.style.color = '#ff5252';
    showToast('Geolocalização não disponível', 'error');
    return;
  }
  
  geoStatus.textContent = '🔄 Obtendo localização precisa via GPS... (Aguarde)';
  geoStatus.style.color = 'var(--accent)';
  
  try {
    // Usa watchPosition para obter a melhor localização possível
    let bestPosition = null;
    let watchId = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    const getPosition = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        if (bestPosition) {
          resolve(bestPosition);
        } else {
          reject(new Error('Timeout: não foi possível obter localização'));
        }
      }, 30000); // 30 segundos máximo
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          attempts++;
          const accuracy = position.coords.accuracy;
          
          // Atualiza se for a primeira posição ou se a nova for mais precisa
          if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
            geoStatus.textContent = `🔄 Melhorando precisão... ${Math.round(accuracy)}m (Tentativa ${attempts}/${maxAttempts})`;
            
            // Se conseguir precisão melhor que 20m ou após 10 tentativas, aceita
            if (accuracy < 20 || attempts >= maxAttempts) {
              clearTimeout(timeoutId);
              navigator.geolocation.clearWatch(watchId);
              resolve(position);
            }
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );
    });
    
    const position = await getPosition;
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    const altitude = position.coords.altitude;
    const heading = position.coords.heading;
    const speed = position.coords.speed;
    
    geoStatus.textContent = '🔄 Buscando endereço completo...';
    
    try {
      // Usa Nominatim do OpenStreetMap com detalhes completos
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=pt-BR&extratags=1`,
        {
          headers: {
            'User-Agent': 'ARGOS-Fiscalizacao-App/1.0'
          }
        }
      );
      
      const nominatimData = await nominatimResponse.json();
      
      let addressParts = [];
      let shortAddress = '';
      
      if (nominatimData.address) {
        const addr = nominatimData.address;
        
        // Monta endereço brasileiro completo e detalhado
        if (addr.road || addr.pedestrian || addr.footway) {
          let street = addr.road || addr.pedestrian || addr.footway;
          if (addr.house_number) {
            street += ', ' + addr.house_number;
          }
          addressParts.push(street);
          shortAddress = street;
        }
        
        if (addr.building || addr.commercial || addr.amenity) {
          const buildingName = addr.building || addr.commercial || addr.amenity;
          addressParts.push(buildingName);
        }
        
        if (addr.suburb || addr.neighbourhood || addr.quarter || addr.residential) {
          const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential;
          addressParts.push(area);
        }
        
        if (addr.city || addr.town || addr.municipality || addr.village) {
          const city = addr.city || addr.town || addr.municipality || addr.village;
          addressParts.push(city);
        }
        
        if (addr.state) {
          addressParts.push(addr.state);
        }
        
        if (addr.postcode) {
          addressParts.push('CEP: ' + addr.postcode);
        }
        
        if (addr.country) {
          addressParts.push(addr.country);
        }
      }
      
      const displayAddress = addressParts.length > 0 ? addressParts.join(' - ') : nominatimData.display_name || `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
      if (geoInput) geoInput.value = shortAddress || displayAddress;
      
      // Salva informações completas de geolocalização
      checklistData.geolocation = {
        latitude: lat,
        longitude: lon,
        accuracy: Math.round(accuracy),
        altitude: altitude ? Math.round(altitude) : null,
        heading: heading ? Math.round(heading) : null,
        speed: speed ? Math.round(speed * 3.6) : null, // Converte m/s para km/h
        address: displayAddress,
        shortAddress: shortAddress,
        fullAddress: nominatimData.display_name || '',
        coordinates: `${lat.toFixed(7)}, ${lon.toFixed(7)}`,
        googleMapsLink: `https://www.google.com/maps?q=${lat},${lon}`,
        wazeLink: `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`,
        timestamp: new Date().toISOString(),
        captureDate: new Date().toLocaleString('pt-BR'),
        source: 'GPS High Accuracy + OSM Geocoding',
        rawData: nominatimData
      };
      
      // Exibe informações detalhadas
      let statusHTML = `✅ <strong>Precisão: ${Math.round(accuracy)}m</strong>`;
      if (altitude) statusHTML += ` | Altitude: ${Math.round(altitude)}m`;
      if (speed) statusHTML += ` | Velocidade: ${Math.round(speed * 3.6)} km/h`;
      statusHTML += '<br>';
      
      const mapLink = document.createElement('a');
      mapLink.href = `https://www.google.com/maps?q=${lat},${lon}`;
      mapLink.target = '_blank';
      mapLink.textContent = '🗺️ Google Maps';
      mapLink.style.marginRight = '10px';
      mapLink.style.color = 'var(--accent)';
      mapLink.style.textDecoration = 'underline';
      mapLink.style.cursor = 'pointer';
      
      const wazeLink = document.createElement('a');
      wazeLink.href = `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`;
      wazeLink.target = '_blank';
      wazeLink.textContent = '🚗 Waze';
      wazeLink.style.marginRight = '10px';
      wazeLink.style.color = 'var(--accent)';
      wazeLink.style.textDecoration = 'underline';
      wazeLink.style.cursor = 'pointer';
      
      const copyLink = document.createElement('a');
      copyLink.href = '#';
      copyLink.textContent = '📋 Copiar Coordenadas';
      copyLink.style.color = 'var(--accent)';
      copyLink.style.textDecoration = 'underline';
      copyLink.style.cursor = 'pointer';
      copyLink.onclick = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(`${lat}, ${lon}`);
        showToast('Coordenadas copiadas!', 'success');
      };
      
      geoStatus.innerHTML = statusHTML;
      geoStatus.appendChild(mapLink);
      geoStatus.appendChild(wazeLink);
      geoStatus.appendChild(copyLink);
      geoStatus.style.color = '#00e676';
      
      saveToLocalStorage();
      showToast(`Localização capturada com ${Math.round(accuracy)}m de precisão!`, 'success');
      
    } catch (geocodeError) {
      console.warn('Erro ao buscar endereço:', geocodeError);
      const coords = `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
      if (geoInput) geoInput.value = coords;
      
      checklistData.geolocation = {
        latitude: lat,
        longitude: lon,
        accuracy: Math.round(accuracy),
        altitude: altitude ? Math.round(altitude) : null,
        coordinates: coords,
        googleMapsLink: `https://www.google.com/maps?q=${lat},${lon}`,
        wazeLink: `https://waze.com/ul?ll=${lat},${lon}&navigate=yes`,
        timestamp: new Date().toISOString(),
        captureDate: new Date().toLocaleString('pt-BR'),
        source: 'GPS High Accuracy'
      };
      
      let statusHTML = `✅ <strong>GPS: ${Math.round(accuracy)}m</strong>`;
      if (altitude) statusHTML += ` | Alt: ${Math.round(altitude)}m`;
      statusHTML += '<br>';
      
      const mapLink = document.createElement('a');
      mapLink.href = `https://www.google.com/maps?q=${lat},${lon}`;
      mapLink.target = '_blank';
      mapLink.textContent = '🗺️ Ver no Mapa';
      mapLink.style.marginRight = '10px';
      mapLink.style.color = 'var(--accent)';
      mapLink.style.textDecoration = 'underline';
      
      const copyLink = document.createElement('a');
      copyLink.href = '#';
      copyLink.textContent = '📋 Copiar';
      copyLink.style.color = 'var(--accent)';
      copyLink.style.textDecoration = 'underline';
      copyLink.style.cursor = 'pointer';
      copyLink.onclick = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(coords);
        showToast('Coordenadas copiadas!', 'success');
      };
      
      geoStatus.innerHTML = statusHTML;
      geoStatus.appendChild(mapLink);
      geoStatus.appendChild(copyLink);
      geoStatus.style.color = '#00e676';
      
      saveToLocalStorage();
      showToast('Coordenadas GPS capturadas!', 'success');
    }
    
  } catch (error) {
    let errorMsg = '❌ ';
    if (error.code) {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMsg += 'Permissão negada. Autorize o acesso à localização nas configurações do navegador.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg += 'GPS indisponível. Ative o GPS e tente novamente.';
          break;
        case error.TIMEOUT:
          errorMsg += 'Tempo esgotado. Vá para área aberta e tente novamente.';
          break;
        default:
          errorMsg += 'Erro ao obter localização.';
      }
    } else {
      errorMsg += error.message || 'Erro desconhecido';
    }
    geoStatus.textContent = errorMsg;
    geoStatus.style.color = '#ff5252';
    showToast(errorMsg, 'error');
  }
}

// Priorizar localização da "Argos Vig" se estiver próxima
const argosVigCoordinates = { lat: -23.55052, lon: -46.633308 }; // Exemplo: São Paulo
const distanceToArgosVig = Math.sqrt(
  Math.pow(lat - argosVigCoordinates.lat, 2) + Math.pow(lon - argosVigCoordinates.lon, 2)
);

if (distanceToArgosVig < 0.01) { // Aproximadamente 1km
  addressParts.unshift('Argos Vig');
  checklistData.geolocation.priorityLocation = 'Argos Vig';
}

function showToast(text, type = "info") {
  const toast = document.createElement("div");
  toast.textContent = text;
  toast.style.position = "fixed";
  toast.style.right = "20px";
  toast.style.bottom = "20px";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "10px";
  toast.style.color = "#041026";
  toast.style.fontWeight = "700";
  toast.style.zIndex = 9999;
  toast.style.boxShadow = "0 10px 30px rgba(2,6,23,0.6)";
  if (type === "success") toast.style.background = "linear-gradient(90deg,#9ff1e9,#00d4ff)";
  else if (type === "error") toast.style.background = "linear-gradient(90deg,#ff9b9b,#ff5e5e)";
  else toast.style.background = "linear-gradient(90deg,#ffd700,#ffeb3b)";
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0.98"; }, 50);
  setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Reorganizando a lista de locais de fiscalização em ordem alfabética
locaisDeFiscalizacao.sort();
const API = {
  async salvarFiscalizacao(dados) {
    if (!USE_API) return null;
    
    try {
      const response = await fetch(`${API_URL}/fiscalizacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao salvar na API:', error);
      return null;
    }
  },
  
  async buscarFiscalizacoes() {
    if (!USE_API) return null;
    
    try {
      const response = await fetch(`${API_URL}/fiscalizacoes`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Erro ao buscar da API:', error);
      return null;
    }
  },
  
  async excluirFiscalizacao(id) {
    if (!USE_API) return null;
    
    try {
      const response = await fetch(`${API_URL}/fiscalizacoes/${id}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao excluir da API:', error);
      return null;
    }
  }
};