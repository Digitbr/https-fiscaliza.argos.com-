const defaultConfig = {
    form_title: "Auditoria de Postos de Vigilância",
    submit_button_text: "Salvar Auditoria",
    primary_color: "#2563eb",
    surface_color: "#ffffff",
    text_color: "#1e293b",
    success_color: "#10b981",
    error_color: "#ef4444"
};

let currentRecordCount = 0;

const dataHandler = {
    onDataChanged(data) {
        currentRecordCount = data.length;
        renderAuditList(data);
    }
};

async function onConfigChange(config) {
    const formTitle = document.getElementById('formTitle');
    const submitBtnText = document.getElementById('submitBtnText');
    const submitBtn = document.getElementById('submitBtn');

    if (formTitle) {
        formTitle.textContent = config.form_title || defaultConfig.form_title;
    }
    if (submitBtnText) {
        submitBtnText.textContent = config.submit_button_text || defaultConfig.submit_button_text;
    }
    if (submitBtn) {
        const primaryColor = config.primary_color || defaultConfig.primary_color;
        submitBtn.style.backgroundColor = primaryColor;
    }
}

function renderAuditList(audits) {
    const auditList = document.getElementById('auditList');
    
    if (audits.length === 0) {
        auditList.innerHTML = '<p class="text-slate-500 text-center py-8">Nenhuma auditoria registrada ainda</p>';
        return;
    }

    auditList.innerHTML = audits.map((audit, index) => {
        const data = new Date(audit.data_criacao);
        const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        
        return `
            <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all" data-audit-id="${audit.__backendId}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold text-slate-800">${audit.responsavel}</h3>
                        <p class="text-sm text-slate-600">Registrado em: ${dataFormatada}</p>
                    </div>
                    <button onclick="deleteAudit('${audit.__backendId}')" class="text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded hover:bg-red-50 transition-all">
                        Excluir
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm mt-3">
                    <div><span class="font-semibold">Chegada:</span> ${formatDateTime(audit.data_chegada)}</div>
                    <div><span class="font-semibold">Saída:</span> ${formatDateTime(audit.data_saida)}</div>
                </div>
                <div class="mt-3 space-y-1 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">1. Efetivo:</span>
                        <span class="px-2 py-0.5 rounded ${audit.efetivo_posto === 'Conforme' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${audit.efetivo_posto}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">2. Postura:</span>
                        <span class="px-2 py-0.5 rounded ${audit.postura_apresentacao === 'Conforme' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${audit.postura_apresentacao}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">3. Livro:</span>
                        <span class="px-2 py-0.5 rounded ${audit.livro_ocorrencias === 'Conforme' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${audit.livro_ocorrencias}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">4. Equipamentos:</span>
                        <span class="px-2 py-0.5 rounded ${audit.equipamentos_posto === 'Conforme' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${audit.equipamentos_posto}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">5. Armamento:</span>
                        <span class="px-2 py-0.5 rounded ${audit.armamento_colete === 'Conforme' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${audit.armamento_colete}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">6. CNV:</span>
                        <span class="px-2 py-0.5 rounded ${audit.cnv === 'Conforme' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${audit.cnv}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">7. Condições:</span>
                        <span class="px-2 py-0.5 rounded ${audit.condicoes_posto === 'Conforme' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${audit.condicoes_posto}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

async function deleteAudit(backendId) {
    const auditElement = document.querySelector(`[data-audit-id="${backendId}"]`);
    if (!auditElement) return;

    const deleteBtn = auditElement.querySelector('button');
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = 'Excluindo...';
    deleteBtn.disabled = true;

    const allAudits = await getAllAudits();
    const auditToDelete = allAudits.find(a => a.__backendId === backendId);

    if (auditToDelete) {
        const result = await window.dataSdk.delete(auditToDelete);
        
        if (!result.isOk) {
            deleteBtn.textContent = originalText;
            deleteBtn.disabled = false;
            showMessage('errorMessage', 'Erro ao excluir auditoria');
        }
    }
}

async function getAllAudits() {
    return new Promise((resolve) => {
        let audits = [];
        const tempHandler = {
            onDataChanged(data) {
                audits = data;
            }
        };
        setTimeout(() => resolve(audits), 100);
    });
}

function showMessage(elementId, customMessage = null) {
    const element = document.getElementById(elementId);
    if (customMessage) {
        const isError = elementId === 'errorMessage';
        element.innerHTML = `${isError ? '✗' : '✓'} ${customMessage}`;
    }
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
    }, 3000);
}

document.getElementById('auditForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (currentRecordCount >= 999) {
        showMessage('errorMessage', 'Limite máximo de 999 auditorias atingido. Por favor, exclua algumas auditorias antes de continuar.');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const originalText = submitBtnText.textContent;
    
    submitBtn.disabled = true;
    submitBtnText.textContent = 'Salvando...';

    const formData = {
        data_chegada: document.getElementById('dataChegada').value,
        data_saida: document.getElementById('dataSaida').value,
        responsavel: document.getElementById('responsavel').value,
        efetivo_posto: document.querySelector('input[name="efetivoPosto"]:checked').value,
        efetivo_observacoes: document.getElementById('efetivoObs').value,
        postura_apresentacao: document.querySelector('input[name="posturaApresentacao"]:checked').value,
        postura_observacoes: document.getElementById('posturaObs').value,
        livro_ocorrencias: document.querySelector('input[name="livroOcorrencias"]:checked').value,
        livro_observacoes: document.getElementById('livroObs').value,
        equipamentos_posto: document.querySelector('input[name="equipamentosPosto"]:checked').value,
        equipamentos_observacoes: document.getElementById('equipamentosObs').value,
        armamento_colete: document.querySelector('input[name="armamentoColete"]:checked').value,
        armamento_observacoes: document.getElementById('armamentoObs').value,
        cnv: document.querySelector('input[name="cnv"]:checked').value,
        cnv_observacoes: document.getElementById('cnvObs').value,
        condicoes_posto: document.querySelector('input[name="condicoesPosto"]:checked').value,
        condicoes_observacoes: document.getElementById('condicoesObs').value,
        data_criacao: new Date().toISOString()
    };

    const result = await window.dataSdk.create(formData);

    submitBtn.disabled = false;
    submitBtnText.textContent = originalText;

    if (result.isOk) {
        showMessage('successMessage');
        e.target.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        showMessage('errorMessage');
    }
});

window.deleteAudit = deleteAudit;

(async () => {
    if (window.dataSdk) {
        await window.dataSdk.init(dataHandler);
    }

    if (window.elementSdk) {
        await window.elementSdk.init({
            defaultConfig,
            onConfigChange,
            mapToCapabilities: (config) => ({
                recolorables: [
                    {
                        get: () => config.primary_color || defaultConfig.primary_color,
                        set: (value) => {
                            config.primary_color = value;
                            window.elementSdk.setConfig({ primary_color: value });
                        }
                    }
                ],
                borderables: [],
                fontEditable: undefined,
                fontSizeable: undefined
            }),
            mapToEditPanelValues: (config) => new Map([
                ["form_title", config.form_title || defaultConfig.form_title],
                ["submit_button_text", config.submit_button_text || defaultConfig.submit_button_text]
            ])
        });

        await onConfigChange(window.elementSdk.config);
    }
})();
