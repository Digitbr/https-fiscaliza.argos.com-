// Sistema de Registros e Análise
let allRecords = [];
let filteredRecords = [];
let chartLocations = null;
let chartInspectors = null;
let chartNonConform = null;

// Lista de postos para o filtro

const postosList = [
  "COBERTURA",
  "SEGER - SECRETARIA DE ESTADO DE GESTAO E RH",
  "IEMA- INST. ESTADUAL DE MEIO AMBIENTE E RECUR.HIDR",
  "ESCOLA ENS FUDAMENTAL E MEDIO LINUS PAULING LTDA",
  "R3L EMPREENDIMENTOS IMOBILIARIOS LTDA",
  "R3L FIO FORTE MATERIAL ELERTICO",
  "DRIFT COMERCIO DE ALIMENTOS S/A - CARONE GAIVOTAS",
  "REALMAR DISTRIBUIDORA LTDA - BARRAMARES",
  "DRIFT COMERCIO DE ALIMENTOS S/A - CARONE ITAPOA",
  "FUNDO MUNICIPAL DE SAUDE DE PRESIDENTE K",
  "SIMEC- COMPANHIA SIDERURGICA DO ES SA",
  "ADMINISTRATIVO",
  "DEPARTAMENTO ADMINISTRATIVO",
  "PA TREVO - INTITUTO ESPERANÇA",
  "VIACAO AGUIA BRANCA SA",
  "DRIFT COMERCIO DE ALIMENTOS S/A - CARONE JD CAMBUR",
  "ELKEM PARTICIPACOES, IND. E COM. LTDA",
  "DRIFT COMERCIO DE ALIMENTOS S /A - COQUEIRAL",
  "DRIFT COMERCIO DE ALIMENTOS S/A - CARONE LARANJEIR",
  "SIMEC-COMPANHIA SIDERURGICA DO ESPIRITO SANTO S.A.",
  "PANIFICADORA E ROTISSERIA MONZA LTDA",
  "IESP-INSTITUTO ESPERANCA",
  "SAO JOSE EMPREEND. IMOB. E PARTICIPAÇÕES SPE LTDA",
  "CONDOMINIO BRISTOL PRAIA DO CANTO APART",
  "CONDOMINIO DO EDIFICIO ROMA",
  "CONDOMINIO DO EDIFICIO JUAN FERNANDES",
  "CARONE MALL-ASSOC.LOC. DA DW EMPREENDIMENTOS",
  "LISA LOGISTICA INTEGRADA SULAMERICNAS SA",
  "MPU- MINISTERIO PUBLICO DA UNIAO",
  "DIACO DISTRIBUIDORA DE ACO S.A",
  "FUNDACAO ESTADUAL DE INOVACAO EM SAUDE",
  "SECTI - SECRETARIA EST.CIENCIA TECN.INOV EDUC PROF",
  "SEACR -SEC ESTADO AGRIC. ABAST AQUICULTURA PESCA",
  "REALMAR DISTRIBUIDORA LTDA- ALTO LAGE",
  "COND ED HAPPY DAYS MANGUINHOS",
  "EXTRAFRUTI SA - COMERCIO DE HORTIFRUTIGRANJEIROS",
  "DRIFT COM DE ALIM S/A - CARONE P. COSTA",
  "REAL EMPREENDIMENTOS IMOBILIARIOS LTDA",
  "DRIFT COMERCIO DE ALIMENTOS S.A - ITAPOA",
  "PA DO TREVO - INSTITUTO ESPERANCA",
  "LISA APEX- LOGISTICA INTEGRADA SULAMERICANA S.A",
  "INSTITUTO ESPERANÇA",
  "PRO MATRE -ISCMV",
  "DRIFT COMERCIO DE ALIMENTOS S.A -CARONINHO",
  "LISA TIMS - LOG INTEGRADA SULAMERICANA S.A",
  "IGREJA EVANG. ASSEMB. DEUS MINISTERIO FONTE VIDA",
  "DRIFT COMERCIO DE ALIMENTOS S /A - GAIVOTAS",
  "AFASTADOS",
  "ADM - MENOR APRENDIZ",
  "DEPARTAMENTO ESTADUAL DE TRANSITO DO ESP",
  "ISCMV- HOSPITAL SANTA CASA MISERICORDIA VITORIA",
  "GRANICAP - GRANITOS CAPIXABA",
  "UPA CASTELANDIA - INSTITUTO ESPERANCA",
  "ISCMV - HOSPITAL MATERNO INFANTIL - SERRA",
  "NASSAU EDITORA RADIO E TV LTDA",
  "FUNDO MUNICIPAL DE SAUDE DE VIANA",
  "DRIFT COM DE ALIM S/A - CARONE ITAPOA",
  "CONDOMINIO DO EDIFICIO YVONE CUNHA",
  "SINDICATO DOS TRABALHADORES EM EMPRESAS",
  "DRIFT COM DE ALIM S/A - CARONE COQUEIRAL",
  "DRIFT COM DE ALIM S/A - SEMPRETEM LINHARES",
  "AFECC - ASSOC. FEM. DE EDUC. E COMBATE A",
  "PRODEST - INST RECNOLOGIA DA INFORMAÇAO E COMUNIC",
  "SAO JOSE EMPREENDIMENTOS IMOBILIARIOS E PARTICIPAC",
  "COND.ED. CARRARA",
  "SESP-SECRETARIA DE ESTADO DA SEG PUBL E DEF SOC",
  "REALMAR DISTRIBUIDORA LTDA - JACARAIPE",
  "ARGOSVIG SEGURANCA, VIGILANCIA E INTELIG",
  "IDAF- INST. DEF.AGROPECUARIA E FLORESTAL DO ES",
  "IJSN - INSTITUTO JONES DOS SANTOS NEVES",
  "DRIFT COMERCIO DE ALIMENTOS S.A - LINHARES",
  "DRIFT COMERCIO DE ALIMENTOS S.A - P. COSTA",
  "DRIFT COM DE ALIM S/A - SEMPRE TEM CACHOEIRO",
  "CONDOMINIO OCEAN VILLE",
  "EMESCAM - IISCMV",
  "DRIFT COMERCIO DE ALIMENTOS S/A - CARONE MATRIZ",
  "CONDOMINIO DO EDIFICIO ANNETI VITALI",
  "CONDOMINIO PARQUE VILA IMPERIAL",
  "DM EMPREENDIMENTOS COMERCIAIS S/A",
  "SECRETARIA DE ESTADO DA SAUDE",
  "MUNICIPIO VIANA",
  "FMS - FUNDO MUNICIPAL DE SAUDE LINHARES",
  "SCCE- SOCIEDADE CIVIL CASAS DE EDUCAÇÃO",
  "COMERCIAL MOTOCICLO",
  "SAMU - ISCMV"
].sort();

document.addEventListener("DOMContentLoaded", () => {
  loadAllRecords();
  populatePostosFilter();
  updateStatistics();
  renderCharts();
  renderRecordsList();
  
  // Aplicar restrições para usuário fiscal
  const userType = sessionStorage.getItem('argos_tipo');
  if (userType === 'fiscal') {
    // Ocultar botões de ações administrativas após um pequeno delay
    setTimeout(() => {
      document.querySelectorAll('button').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && (
          onclick.includes('clearAllRecords') ||
          onclick.includes('openImportModal') ||
          onclick.includes('deleteRecord')
        )) {
          btn.style.display = 'none';
        }
      });
    }, 100);
  }
});

function populatePostosFilter() {
  const filterSelect = document.getElementById('filterLocation');
  if (filterSelect) {
    // Limpa opções atuais e adiciona opção padrão
    filterSelect.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Todos os postos';
    filterSelect.appendChild(defaultOpt);

    // Dedupe e ordena lista combinando estática + dos registros salvos
    const fromRecords = Array.from(new Set((allRecords || [])
      .map(r => r.location)
      .filter(Boolean)));
    const combined = Array.from(new Set([...
      postosList,
      ...fromRecords
    ])).sort((a,b)=>a.localeCompare(b,'pt-BR'));

    combined.forEach(posto => {
      const option = document.createElement('option');
      option.value = posto;
      option.textContent = posto;
      filterSelect.appendChild(option);
    });
  }
}

function loadAllRecords() {
  const saved = localStorage.getItem('allChecklistRecords');
  console.log('Carregando registros:', saved ? JSON.parse(saved) : 'nenhum'); // DEBUG
  if (saved) {
    allRecords = JSON.parse(saved);
  }
  filteredRecords = [...allRecords];
  console.log('allRecords.length:', allRecords.length, 'filteredRecords.length:', filteredRecords.length); // DEBUG
}

function updateStatistics() {
  document.getElementById('totalRecords').textContent = allRecords.length;
  
  let totalNonConform = 0;
  const uniqueLocations = new Set();
  
  allRecords.forEach(record => {
    if (record.location) uniqueLocations.add(record.location);
    if (record.summary) {
      totalNonConform += record.summary.naoConforme || 0;
    }
  });
  
  document.getElementById('totalNonConform').textContent = totalNonConform;
  document.getElementById('totalLocations').textContent = uniqueLocations.size;
}

function renderCharts() {
  renderLocationsChart();
  renderInspectorsChart();
  renderNonConformChart();
}

function renderLocationsChart() {
  const locationCount = {};
  
  filteredRecords.forEach(record => {
    const loc = record.location || 'Não informado';
    locationCount[loc] = (locationCount[loc] || 0) + 1;
  });
  
  const sortedLocations = Object.entries(locationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  const labels = sortedLocations.map(([loc]) => loc);
  const data = sortedLocations.map(([, count]) => count);
  
  const ctx = document.getElementById('chartLocations');
  
  if (chartLocations) {
    chartLocations.destroy();
  }
  
  chartLocations = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Número de Fiscalizações',
        data: data,
        backgroundColor: 'rgba(0, 212, 255, 0.7)',
        borderColor: 'rgba(0, 212, 255, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#e6eef8', font: { size: 14 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#9aa6bf', stepSize: 1 },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: {
          ticks: { color: '#9aa6bf', maxRotation: 45, minRotation: 45 },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function renderInspectorsChart() {
  const inspectorCount = {};
  
  filteredRecords.forEach(record => {
    const inspector = record.inspector || 'Não informado';
    inspectorCount[inspector] = (inspectorCount[inspector] || 0) + 1;
  });
  
  const sortedInspectors = Object.entries(inspectorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  const labels = sortedInspectors.map(([inspector]) => inspector);
  const data = sortedInspectors.map(([, count]) => count);
  
  const ctx = document.getElementById('chartInspectors');
  
  if (chartInspectors) {
    chartInspectors.destroy();
  }
  
  chartInspectors = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Número de Fiscalizações',
        data: data,
        backgroundColor: 'rgba(102, 187, 106, 0.7)',
        borderColor: 'rgba(102, 187, 106, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#e6eef8', font: { size: 14 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y + ' fiscalização(ões)';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#9aa6bf', stepSize: 1 },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: {
          ticks: { color: '#9aa6bf', maxRotation: 45, minRotation: 45 },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function renderNonConformChart() {
  const questionNonConform = {};
  
  filteredRecords.forEach(record => {
    if (record.answers) {
      record.answers.forEach(answer => {
        if (answer.answer === 'nao-conforme') {
          const key = answer.question;
          questionNonConform[key] = (questionNonConform[key] || 0) + 1;
        }
      });
    }
  });
  
  const sortedQuestions = Object.entries(questionNonConform)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  const labels = sortedQuestions.map(([q]) => q.length > 40 ? q.substring(0, 40) + '...' : q);
  const data = sortedQuestions.map(([, count]) => count);
  
  const ctx = document.getElementById('chartNonConform');
  
  if (chartNonConform) {
    chartNonConform.destroy();
  }
  
  chartNonConform = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Não Conformidades',
        data: data,
        backgroundColor: 'rgba(255, 82, 82, 0.7)',
        borderColor: 'rgba(255, 82, 82, 1)',
        borderWidth: 2
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#e6eef8', font: { size: 14 } }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: '#9aa6bf', stepSize: 1 },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          ticks: { color: '#9aa6bf' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function renderRecordsList() {
  const sidebarContainer = document.getElementById('records-sidebar');
  const detailsContainer = document.getElementById('record-details');
  
  console.log('renderRecordsList - filteredRecords.length:', filteredRecords.length);
  
  if (filteredRecords.length === 0) {
    if (sidebarContainer) {
      sidebarContainer.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px;font-size:12px">Nenhum registro encontrado.</p>';
    }
    if (detailsContainer) {
      detailsContainer.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">Complete uma fiscalização na página inicial para ver os dados aqui.</p>';
    }
    return;
  }
  
  // Verificar tipo de usuário
  const userType = sessionStorage.getItem('argos_tipo');
  const isFiscal = userType === 'fiscal';
  
  // Renderizar cards resumidos na sidebar
  const sidebarHTML = filteredRecords.map((record, index) => {
    const date = record.date || 'Data não informada';
    const inspector = record.inspector || 'Não informado';
    const location = record.location || 'Não informado';
    const conforme = record.summary?.conforme || 0;
    const naoConforme = record.summary?.naoConforme || 0;
    const na = record.summary?.na || 0;
    
    return `
      <div class="record-card-mini" data-index="${index}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <h4 style="margin:0;font-size:13px;color:#00d4ff;line-height:1.3;flex:1;cursor:pointer" onclick="selectRecord(${index})">${location}</h4>
          <button class="toggle-card-btn" onclick="event.stopPropagation(); toggleCardDetails(${index})" style="background:none;border:none;color:#00d4ff;cursor:pointer;font-size:14px;padding:4px;transition:transform 0.3s ease;line-height:1" title="Expandir/Recolher">
            <span class="arrow-icon">▼</span>
          </button>
        </div>
        <div class="card-details" id="card-details-${index}" style="overflow:hidden;max-height:0;transition:max-height 0.3s ease">
          <p style="margin:4px 0;font-size:11px;color:#9aa6bf">👤 ${inspector}</p>
          <p style="margin:4px 0;font-size:11px;color:#9aa6bf">📅 ${date}</p>
          <div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">
            <span style="font-size:10px;padding:3px 6px;border-radius:4px;background:rgba(0,230,118,0.15);color:#00e676">✓${conforme}</span>
            <span style="font-size:10px;padding:3px 6px;border-radius:4px;background:rgba(255,82,82,0.15);color:#ff5252">✗${naoConforme}</span>
            <span style="font-size:10px;padding:3px 6px;border-radius:4px;background:rgba(154,166,191,0.15);color:#9aa6bf">—${na}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  if (sidebarContainer) {
    sidebarContainer.innerHTML = sidebarHTML;
  }
  
  // Selecionar automaticamente o primeiro registro
  if (filteredRecords.length > 0) {
    selectRecord(0);
  }
}

function toggleCardDetails(index) {
  const cardDetails = document.getElementById(`card-details-${index}`);
  const cardElement = document.querySelector(`.record-card-mini[data-index="${index}"]`);
  const arrowIcon = cardElement.querySelector('.arrow-icon');
  
  if (!cardDetails) return;
  
  const isExpanded = cardDetails.style.maxHeight && cardDetails.style.maxHeight !== '0px';
  
  if (isExpanded) {
    // Colapsar
    cardDetails.style.maxHeight = '0';
    arrowIcon.style.transform = 'rotate(0deg)';
  } else {
    // Expandir
    cardDetails.style.maxHeight = cardDetails.scrollHeight + 'px';
    arrowIcon.style.transform = 'rotate(180deg)';
  }
}

function selectRecord(index) {
  const record = filteredRecords[index];
  const detailsContainer = document.getElementById('record-details');
  
  if (!record || !detailsContainer) return;
  
  // Marcar card selecionado
  document.querySelectorAll('.record-card-mini').forEach(card => {
    card.classList.remove('selected');
  });
  const selectedCard = document.querySelector(`.record-card-mini[data-index="${index}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }
  
  // Renderizar detalhes completos
  const date = record.date || 'Data não informada';
  const inspector = record.inspector || 'Não informado';
  const location = record.location || 'Não informado';
  const reference = record.reference || 'Não informado';
  // Fallback: se arrivalTime não existe, usa reference (compatibilidade retroativa)
  const arrivalTime = record.arrivalTime || record.reference || 'Não informado';
  const exitTime = record.exitTime || 'Não informado';
  const route = record.route || 'Não informada';
  const conforme = record.summary?.conforme || 0;
  const naoConforme = record.summary?.naoConforme || 0;
  const na = record.summary?.na || 0;
  
  // Verificar tipo de usuário
  const userType = sessionStorage.getItem('argos_tipo');
  const isFiscal = userType === 'fiscal';
  const deleteButton = isFiscal ? '' : `<button class="btn-delete" onclick="deleteRecord(${index})" style="margin-left:8px">🗑️ Excluir</button>`;
  
  let html = `
    <div style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;background:rgba(255,255,255,0.02)">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <div style="flex:1;min-width:300px">
          <h2 style="margin:0 0 12px 0;font-size:22px;color:#00d4ff">📍 ${location}</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
            <p style="margin:0;font-size:13px"><strong>👤 Fiscal:</strong> ${inspector}</p>
            <p style="margin:0;font-size:13px"><strong>📅 Data:</strong> ${date}</p>
            <p style="margin:0;font-size:13px"><strong>🕐 Chegada:</strong> ${arrivalTime}</p>
            <p style="margin:0;font-size:13px"><strong>🕐 Saída:</strong> ${exitTime}</p>
            <p style="margin:0;font-size:13px"><strong>🗺️ Rota:</strong> ${route}</p>
            <p style="margin:0;font-size:13px"><strong>📋 Protocolo:</strong> ${reference}</p>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn-view" onclick="openRecordPage(${index})" style="background:linear-gradient(90deg,#00d4ff,#0066cc)">🔎 Abrir Página</button>
          <button class="btn-view" onclick="exportRecordToPDF(${index})" style="background:linear-gradient(90deg,#ff6b9d,#c44569)">📄 PDF</button>
          ${deleteButton}
        </div>
      </div>
      
      <div style="display:flex;gap:8px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.05);flex-wrap:wrap">
        <span class="badge-conforme">✓ ${conforme} Conforme</span>
        <span class="badge-nao-conforme">✗ ${naoConforme} Não Conforme</span>
        <span class="badge-na">— ${na} N/A</span>
      </div>
  `;
  
  // Renderizar respostas
  if (record.answers && record.answers.length > 0) {
    html += '<h3 style="font-size:16px;color:#00d4ff;margin-bottom:12px">📋 Perguntas Respondidas</h3>';
    
    record.answers.forEach(answer => {
      const statusText = answer.answer === 'conforme' ? '✓ Conforme' : 
                        answer.answer === 'nao-conforme' ? '✗ Não Conforme' : '— N/A';
      const statusColor = answer.answer === 'conforme' ? '#00e676' : 
                         answer.answer === 'nao-conforme' ? '#ff5252' : '#9aa6bf';
      
      html += `
        <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;margin-bottom:10px;border-left:3px solid ${statusColor}">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;margin-bottom:6px">
            <p style="margin:0;font-size:13px;font-weight:600;color:#e6eef8;flex:1">${answer.question}</p>
            <span style="font-size:12px;font-weight:700;color:${statusColor};white-space:nowrap">${statusText}</span>
          </div>
          ${answer.observation ? `<p style="margin:6px 0 0 0;font-size:12px;color:#9aa6bf"><strong>Obs:</strong> ${answer.observation}</p>` : ''}
          ${answer.nonConformity ? `
            <div style="margin-top:8px;padding:8px;background:rgba(255,82,82,0.1);border-radius:6px;border:1px solid rgba(255,82,82,0.2)">
              <p style="margin:0;font-size:12px;color:#ff9999"><strong>⚠️ Não Conformidade:</strong></p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#ffcccc">${answer.nonConformity.reason || 'Não informada'}</p>
              ${answer.nonConformity.filesCount > 0 ? `<p style="margin:4px 0 0 0;font-size:11px;color:#ff9999">📎 ${answer.nonConformity.filesCount} arquivo(s) anexado(s)</p>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });
  }
  
  // Observações gerais
  if (record.generalNotes) {
    html += `
      <div style="margin-top:16px;padding:12px;background:rgba(0,212,255,0.05);border-radius:8px;border-left:3px solid #00d4ff">
        <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#00d4ff">💬 Observações Gerais</p>
        <p style="margin:0;font-size:12px;color:#9aa6bf">${record.generalNotes}</p>
      </div>
    `;
  }
  
  html += '</div>';
  detailsContainer.innerHTML = html;
}


function viewRecord(index) {
  const record = filteredRecords[index];
  
  // Fallback para compatibilidade retroativa
  const arrivalTime = record.arrivalTime || record.reference || 'Não informado';
  const exitTime = record.exitTime || 'Não informado';
  
  let detailsHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">✕</button>
        <h2>${record.location || 'Sem título'}</h2>
        <div class="modal-info">
          <p><strong>Fiscal:</strong> ${record.inspector || 'Não informado'}</p>
          <p><strong>Data:</strong> ${record.date || 'Não informada'}</p>
          <p><strong>Chegada:</strong> ${arrivalTime} &nbsp; | &nbsp; <strong>Saída:</strong> ${exitTime}</p>
          <p><strong>Local da fiscalização:</strong> ${record.location || 'Não informado'}</p>
          <p><strong>Protocolo:</strong> ${record.reference || 'Não informado'}</p>
        </div>
        <div class="modal-summary">
          <span class="badge-conforme">✓ ${record.summary?.conforme || 0} Conforme</span>
          <span class="badge-nao-conforme">✗ ${record.summary?.naoConforme || 0} Não Conforme</span>
          <span class="badge-na">— ${record.summary?.na || 0} N/A</span>
        </div>
        <h3>Respostas:</h3>
        <div class="answers-list">
  `;
  
  if (record.answers) {
    record.answers.forEach(answer => {
      const statusClass = answer.answer === 'conforme' ? 'conforme' : 
                         answer.answer === 'nao-conforme' ? 'nao-conforme' : 'na';
      const statusText = answer.answer === 'conforme' ? '✓ Em Conforme' : 
                        answer.answer === 'nao-conforme' ? '✗ Não Conforme' : '— N/A';
      
      detailsHTML += `
        <div class="answer-detail">
          <p class="question-text">${answer.id}. ${answer.question}</p>
          <span class="answer-status ${statusClass}">${statusText}</span>
          ${answer.observation ? `<p class="observation-text"><strong>Observação:</strong> ${answer.observation}</p>` : ''}
          ${answer.nonConformity ? `
            <div class="nc-details">
              <p><strong>📝 Descrição da Não Conformidade:</strong></p>
              <p>${answer.nonConformity.reason || 'Não informada'}</p>
              ${answer.nonConformity.filesCount > 0 ? `<p><strong>📎 Arquivos anexados:</strong> ${answer.nonConformity.filesCount}</p>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });
  }
  
  if (record.generalNotes) {
    detailsHTML += `
      <div class="general-notes">
        <h3>Observações Gerais:</h3>
        <p>${record.generalNotes}</p>
      </div>
    `;
  }
  
  detailsHTML += `
        </div>
        <div style="display:flex;gap:10px;margin-top:20px">
          <button class="btn-primary" onclick="exportRecordToPDF(${index})" style="flex:1;background:linear-gradient(90deg,#ff6b9d,#c44569)">📄 Exportar PDF</button>
          <button class="btn-primary" onclick="downloadRecordJSON(${index})" style="flex:1">📥 Baixar JSON</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', detailsHTML);
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) modal.remove();
}

function deleteRecord(index) {
  // Verificar se é fiscal
  const userType = sessionStorage.getItem('argos_tipo');
  if (userType === 'fiscal') {
    showToast('⚠️ Usuários fiscais não podem excluir registros', 'error');
    return;
  }
  
  if (!confirm('Tem certeza que deseja excluir este registro?')) return;
  
  const actualIndex = allRecords.findIndex(r => r === filteredRecords[index]);
  allRecords.splice(actualIndex, 1);
  localStorage.setItem('allChecklistRecords', JSON.stringify(allRecords));
  
  loadAllRecords();
  updateStatistics();
  renderCharts();
  renderRecordsList();
  
  showToast('Registro excluído com sucesso', 'success');
}

function downloadRecordJSON(index) {
  const record = filteredRecords[index];
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `registro_${record.location}_${new Date().getTime()}.json`;
  a.click();
  showToast('JSON baixado com sucesso', 'success');
}

function openRecordPage(index) {
  const record = filteredRecords[index];
  if (!record) return;
  const id = record.timestamp || record.date || index;
  // abrir nova aba com query param id (timestamp)
  window.open(`registro.html?id=${encodeURIComponent(id)}`, '_blank');
}

function exportRecordToPDF(index) {
  const record = filteredRecords[index];
  
  // Cria uma janela de impressão com o conteúdo formatado
  const printWindow = window.open('', '_blank');
  
  let answersHTML = '';
  let categoryHTML = '';
  let currentCategory = '';
  
  if (record.answers) {
    record.answers.forEach((answer, idx) => {
      // Agrupa por categoria
      if (answer.category && answer.category !== currentCategory) {
        if (currentCategory !== '') {
          answersHTML += '</div>';
        }
        currentCategory = answer.category;
        answersHTML += `
          <div style="margin-top:20px;page-break-inside:avoid">
            <div style="background:#00d4ff;color:#fff;padding:8px 12px;font-weight:700;font-size:13px;margin-bottom:10px">
              ${currentCategory}
            </div>
        `;
      }
      
      const statusText = answer.answer === 'conforme' ? '✓ CONFORME' : 
                        answer.answer === 'nao-conforme' ? '✗ NÃO CONFORME' : '— N/A';
      const statusSymbol = answer.answer === 'conforme' ? '☑' : 
                          answer.answer === 'nao-conforme' ? '☒' : '☐';
      const statusColor = answer.answer === 'conforme' ? '#00e676' : 
                         answer.answer === 'nao-conforme' ? '#ff5252' : '#9aa6bf';
      
      // Gerar HTML das imagens das não conformidades
      let imagesHTML = '';
      if (answer.nonConformity && answer.nonConformity.files && answer.nonConformity.files.length > 0) {
        const imageFiles = answer.nonConformity.files.filter(f => f.type.startsWith('image/'));
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
              ${answer.question}
            </td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd">
              <span style="color:${statusColor};font-weight:700;font-size:18px;margin-right:8px">${statusSymbol}</span>
              <span style="color:${statusColor};font-weight:700;font-size:12px">${statusText}</span>
            </td>
          </tr>
          ${answer.observation ? `
            <tr>
              <td style="padding:10px;border-bottom:1px solid #ddd;font-size:11px;background:#fafafa">
                <strong>Observação:</strong> ${answer.observation}
              </td>
            </tr>
          ` : ''}
          ${answer.nonConformity ? `
            <tr>
              <td style="padding:10px;background:#fff3cd">
                <div style="font-size:11px;color:#856404">
                  <strong>📝 Descrição da Não Conformidade:</strong><br>
                  ${answer.nonConformity.reason || 'Não informada'}
                  ${answer.nonConformity.filesCount > 0 ? `<br><br><strong>📎 Evidências anexadas:</strong> ${answer.nonConformity.filesCount} arquivo(s)` : ''}
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
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Fiscalização - ${record.location}</title>
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
          margin: 25px 0;
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
        .section-title {
          font-size: 18px;
          font-weight: 700;
          margin: 25px 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #00d4ff;
          color: #333;
        }
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
          <div class="info-item"><strong>Local:</strong> ${record.location || 'Não informado'}</div>
          <div class="info-item"><strong>Fiscal:</strong> ${record.inspector || 'Não informado'}</div>
          <div class="info-item"><strong>Data:</strong> ${record.date || 'Não informada'}</div>
          <div class="info-item"><strong>Protocolo:</strong> ${record.reference || 'Não informado'}</div>
          ${record.geolocation ? `
            <div class="info-item full"><strong>Localização GPS:</strong> ${record.geolocation.address || record.geolocation.coordinates || 'Não disponível'}</div>
          ` : ''}
        </div>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <span class="number conforme">${record.summary?.conforme || 0}</span>
          <span class="label">Em Conforme</span>
        </div>
        <div class="summary-item">
          <span class="number nao-conforme">${record.summary?.naoConforme || 0}</span>
          <span class="label">Não Conforme</span>
        </div>
        <div class="summary-item">
          <span class="number na">${record.summary?.na || 0}</span>
          <span class="label">N/A</span>
        </div>
      </div>
      
      <div style="margin:0 20px 20px 20px">
        <div style="background:#333;color:#fff;padding:10px 15px;font-weight:700;font-size:14px;text-transform:uppercase;margin-bottom:15px">
          Checklist de Inspeção
        </div>
        ${answersHTML}
      </div>
      
      ${record.generalNotes ? `
        <div style="margin:0 20px 20px 20px;border:2px solid #333;page-break-inside:avoid">
          <div style="background:#333;color:#fff;padding:8px 15px;font-weight:700;font-size:13px">
            OBSERVAÇÕES GERAIS
          </div>
          <div style="padding:15px;font-size:12px;color:#333;line-height:1.6">
            ${record.generalNotes}
          </div>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <p>© ${new Date().getFullYear()} Sistema ARGOS de Fiscalização - Todos os direitos reservados</p>
      </div>
      
      <div class="no-print" style="position:fixed;top:20px;right:20px;background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.2)">
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

function applyFilters() {
  const locationFilter = document.getElementById('filterLocation').value;
  const dateFilter = document.getElementById('filterDate').value;

  filteredRecords = allRecords.filter(record => {
    const matchLocation = !locationFilter || (record.location || '') === locationFilter;
    const matchDate = !dateFilter || record.date === new Date(dateFilter).toLocaleDateString('pt-BR');
    return matchLocation && matchDate;
  });

  renderCharts();
  renderRecordsList();
  showToast('Filtros aplicados', 'info');
}

function clearFilters() {
  document.getElementById('filterLocation').value = '';
  document.getElementById('filterDate').value = '';
  filteredRecords = [...allRecords];
  renderCharts();
  renderRecordsList();
  showToast('Filtros limpos', 'info');
}

function exportAllToJSON() {
  if (allRecords.length === 0) {
    showToast('Nenhum registro para exportar', 'error');
    return;
  }
  
  const blob = new Blob([JSON.stringify(allRecords, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todos_registros_${new Date().getTime()}.json`;
  a.click();
  showToast('Todos os registros exportados', 'success');
}

function exportAllToPDF() {
  if (allRecords.length === 0) {
    showToast('Nenhum registro para exportar', 'error');
    return;
  }
  
  const printWindow = window.open('', '_blank');
  
  // Estatísticas gerais
  let totalConforme = 0;
  let totalNaoConforme = 0;
  let totalNA = 0;
  const uniqueLocations = new Set();
  const uniqueInspectors = new Set();
  
  allRecords.forEach(record => {
    if (record.location) uniqueLocations.add(record.location);
    if (record.inspector) uniqueInspectors.add(record.inspector);
    if (record.summary) {
      totalConforme += record.summary.conforme || 0;
      totalNaoConforme += record.summary.naoConforme || 0;
      totalNA += record.summary.na || 0;
    }
  });
  
  // Gera HTML para cada registro
  let recordsHTML = '';
  allRecords.forEach((record, idx) => {
    let answersHTML = '';
    if (record.answers) {
      record.answers.forEach(answer => {
        const statusText = answer.answer === 'conforme' ? '✓ EM CONFORME' : 
                          answer.answer === 'nao-conforme' ? '✗ NÃO CONFORME' : '— N/A';
        const statusColor = answer.answer === 'conforme' ? '#00e676' : 
                           answer.answer === 'nao-conforme' ? '#ff5252' : '#9aa6bf';
        
        // Gerar HTML das imagens das não conformidades
        let imagesHTML = '';
        if (answer.nonConformity && answer.nonConformity.files && answer.nonConformity.files.length > 0) {
          const imageFiles = answer.nonConformity.files.filter(f => f.type.startsWith('image/'));
          if (imageFiles.length > 0) {
            imagesHTML = '<div style="margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">';
            imageFiles.forEach(file => {
              imagesHTML += `
                <div style="border:2px solid #ff9800;border-radius:6px;overflow:hidden;background:#fff">
                  <img src="${file.data}" alt="${file.name}" style="width:100%;height:auto;display:block;max-height:200px;object-fit:contain">
                  <div style="padding:3px;background:#fff3cd;font-size:9px;color:#856404;text-align:center;border-top:1px solid #ff9800">
                    ${file.name}
                  </div>
                </div>
              `;
            });
            imagesHTML += '</div>';
          }
        }
        
        answersHTML += `
          <div style="margin-bottom:12px;padding:10px;background:#f9f9f9;border-left:3px solid ${statusColor};page-break-inside:avoid;font-size:11px">
            <p style="margin:0 0 5px 0;font-weight:600;color:#333">${answer.id}. ${answer.question}</p>
            <p style="margin:0;color:${statusColor};font-weight:600;font-size:10px">${statusText}</p>
            ${answer.observation ? `<p style="margin:5px 0 0 0;font-size:10px;color:#666"><strong>Obs:</strong> ${answer.observation}</p>` : ''}
            ${answer.nonConformity && answer.nonConformity.reason ? `
              <p style="margin:5px 0 0 0;padding:5px;background:#fff3cd;border-radius:3px;font-size:10px;color:#856404">
                <strong>NC:</strong> ${answer.nonConformity.reason}
              </p>
              ${imagesHTML}
            ` : ''}
          </div>
        `;
      });
    }
    
    recordsHTML += `
      <div style="page-break-after:always;margin-bottom:30px">
        <div style="background:#e3f2fd;padding:12px;border-radius:6px;margin-bottom:15px">
          <h3 style="margin:0 0 8px 0;color:#1976d2;font-size:16px">Registro ${idx + 1}: ${record.location || 'Não informado'}</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">
            <p style="margin:0"><strong>Fiscal:</strong> ${record.inspector || 'Não informado'}</p>
            <p style="margin:0"><strong>Data:</strong> ${record.date || 'Não informada'}</p>
            <p style="margin:0"><strong>Protocolo:</strong> ${record.reference || 'Não informado'}</p>
            <p style="margin:0"><strong>Resumo:</strong> ${record.summary?.conforme || 0} Conforme, ${record.summary?.naoConforme || 0} NC, ${record.summary?.na || 0} N/A</p>
          </div>
        </div>
        ${answersHTML}
        ${record.generalNotes ? `
          <div style="margin-top:10px;padding:10px;background:#f5f5f5;border-radius:5px;font-size:11px">
            <strong>Observações Gerais:</strong> ${record.generalNotes}
          </div>
        ` : ''}
      </div>
    `;
  });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório Consolidado - Sistema ARGOS</title>
      <style>
        @page { margin: 1.5cm; }
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
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
        .header-logo img {
          width: 140px;
          height: auto;
        }
        .header-info {
          flex: 1;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 5px 0;
          color: #00d4ff;
          font-size: 20px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .header h2 {
          margin: 0;
          color: #666;
          font-size: 12px;
          font-weight: 600;
        }
        .stats-box {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          text-align: center;
        }
        .stat-item {
          padding: 10px;
          background: white;
          border-radius: 6px;
        }
        .stat-number {
          font-size: 28px;
          font-weight: 700;
          display: block;
          margin-bottom: 5px;
        }
        .stat-label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
        }
        .conforme { color: #00e676; }
        .nao-conforme { color: #ff5252; }
        .na { color: #9aa6bf; }
        .footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #e0e0e0;
          text-align: center;
          font-size: 10px;
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
          <h1>Relatório Consolidado de Fiscalizações</h1>
          <h2>Sistema ARGOS de Inspeção Operacional</h2>
        </div>
        <div style="text-align:right;font-size:11px;color:#666">
          <strong>Emissão:</strong><br>
          ${new Date().toLocaleDateString('pt-BR')}<br>
          ${new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>
      
      <div style="margin:0 20px 20px 20px;border:2px solid #00d4ff">
        <div style="background:#00d4ff;color:#fff;padding:8px 15px;font-weight:700;font-size:13px">
          RESUMO EXECUTIVO
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0">
          <div style="padding:12px 15px;border-right:1px solid #e0e0e0;font-size:12px">
            <strong style="color:#00d4ff">Total de Registros:</strong><br>
            <span style="font-size:24px;font-weight:700;color:#333">${allRecords.length}</span>
          </div>
          <div style="padding:12px 15px;border-right:1px solid #e0e0e0;font-size:12px">
            <strong style="color:#00d4ff">Postos Fiscalizados:</strong><br>
            <span style="font-size:24px;font-weight:700;color:#333">${uniqueLocations.size}</span>
          </div>
          <div style="padding:12px 15px;font-size:12px">
            <strong style="color:#00d4ff">Fiscais:</strong><br>
            <span style="font-size:24px;font-weight:700;color:#333">${uniqueInspectors.size}</span>
          </div>
        </div>
      </div>
      
      <div class="stats-box">
        <div class="stat-item">
          <span class="stat-number conforme">${totalConforme}</span>
          <span class="stat-label">Total Em Conforme</span>
        </div>
        <div class="stat-item">
          <span class="stat-number nao-conforme">${totalNaoConforme}</span>
          <span class="stat-label">Total Não Conforme</span>
        </div>
        <div class="stat-item">
          <span class="stat-number na">${totalNA}</span>
          <span class="stat-label">Total N/A</span>
        </div>
      </div>
      
      <h2 style="font-size:18px;margin:20px 0 15px 0;padding-bottom:8px;border-bottom:2px solid #00d4ff">Registros Detalhados</h2>
      
      ${recordsHTML}
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Sistema ARGOS de Fiscalização - Todos os direitos reservados</p>
      </div>
      
      <div class="no-print" style="position:fixed;top:20px;right:20px;background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.2)">
        <button onclick="window.print()" style="padding:10px 20px;background:#00d4ff;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:600">🖨️ Imprimir / Salvar PDF</button>
        <button onclick="window.close()" style="padding:10px 20px;background:#ff5252;color:#fff;border:none;border-radius:5px;cursor:pointer;margin-left:10px;font-weight:600">✕ Fechar</button>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  printWindow.onload = function() {
    setTimeout(() => {
      printWindow.focus();
    }, 250);
  };
  
  showToast('Relatório consolidado aberto. Use "Salvar como PDF" para exportar.', 'success');
}

function clearAllRecords() {
  if (!confirm('ATENÇÃO: Isso irá excluir TODOS os registros permanentemente. Tem certeza?')) return;
  
  localStorage.removeItem('allChecklistRecords');
  allRecords = [];
  filteredRecords = [];
  
  updateStatistics();
  renderCharts();
  renderRecordsList();
  
  showToast('Todos os registros foram excluídos', 'success');
}

let pendingImportData = null;

function openImportModal() {
  document.getElementById('importModal').style.display = 'flex';
  document.getElementById('importPreview').style.display = 'none';
  document.getElementById('importFileInput').value = '';
  pendingImportData = null;
}

function closeImportModal(event) {
  if (!event || event.target.classList.contains('modal-overlay') || event.target.classList.contains('modal-close')) {
    document.getElementById('importModal').style.display = 'none';
    pendingImportData = null;
  }
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.name.endsWith('.json')) {
    showToast('Por favor, selecione um arquivo JSON válido', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // Valida se é um array ou um objeto único
      let records = Array.isArray(data) ? data : [data];
      
      // Valida estrutura básica dos registros
      const validRecords = records.filter(record => {
        return record && (record.date || record.timestamp) && (record.inspector || record.answers);
      });
      
      if (validRecords.length === 0) {
        showToast('Nenhum registro válido encontrado no arquivo', 'error');
        return;
      }
      
      pendingImportData = validRecords;
      
      // Mostra preview
      const previewDiv = document.getElementById('importPreview');
      const infoDiv = document.getElementById('importInfo');
      
      let naoConformeTotal = 0;
      const locations = new Set();
      
      validRecords.forEach(record => {
        if (record.location) locations.add(record.location);
        if (record.summary && record.summary.naoConforme) {
          naoConformeTotal += record.summary.naoConforme;
        }
      });
      
      infoDiv.innerHTML = `
        <p style="margin:5px 0"><strong>Registros encontrados:</strong> ${validRecords.length}</p>
        <p style="margin:5px 0"><strong>Postos diferentes:</strong> ${locations.size}</p>
        <p style="margin:5px 0"><strong>Não conformidades totais:</strong> ${naoConformeTotal}</p>
        <p style="margin:10px 0 5px 0;color:var(--muted);font-size:13px">
          <strong>Atenção:</strong> Os registros serão adicionados aos existentes (não serão substituídos).
        </p>
      `;
      
      previewDiv.style.display = 'block';
      showToast('Arquivo carregado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      showToast('Erro ao ler arquivo JSON. Verifique o formato.', 'error');
    }
  };
  
  reader.onerror = () => {
    showToast('Erro ao ler arquivo', 'error');
  };
  
  reader.readAsText(file);
}

function confirmImport() {
  if (!pendingImportData || pendingImportData.length === 0) {
    showToast('Nenhum dado para importar', 'error');
    return;
  }
  
  // Adiciona os novos registros aos existentes
  allRecords = [...allRecords, ...pendingImportData];
  filteredRecords = [...allRecords];
  
  // Salva no localStorage
  localStorage.setItem('allChecklistRecords', JSON.stringify(allRecords));
  
  // Atualiza interface
  updateStatistics();
  renderCharts();
  renderRecordsList();
  
  showToast(`${pendingImportData.length} registro(s) importado(s) com sucesso!`, 'success');
  closeImportModal();
}

function cancelImport() {
  pendingImportData = null;
  document.getElementById('importPreview').style.display = 'none';
  document.getElementById('importFileInput').value = '';
  showToast('Importação cancelada', 'info');
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
