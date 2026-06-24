// ===== ESTADO =====
let linhaId = 0;
let orcamentoEditandoId = null;
let clienteOrcamentoPendenteId = null;
let descontoAplicado = 0;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const validade = new Date();
    validade.setDate(hoje.getDate() + 30);
    document.getElementById('campo-data').value = hoje.toISOString().split('T')[0];
    document.getElementById('campo-validade').value = validade.toISOString().split('T')[0];
    adicionarLinha();
    adicionarLinha();
    renderizarHistorico();
    importarTrashLeads();
    importarLeadsIniciais();
    importarClientesAtivos();
    importarContratosAtivos();
    renderizarLeads();
    renderizarClientes();
    renderizarContratos();
    atualizarNumeroDisplay();
});

// ===== ABAS =====
function mudarAba(aba, btn) {
    document.querySelectorAll('.aba').forEach(a => a.classList.remove('ativo'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('ativo'));
    document.getElementById('aba-' + aba).classList.add('ativo');
    btn.classList.add('ativo');
    if (aba === 'historico') renderizarHistorico();
    if (aba === 'leads') renderizarLeads();
    if (aba === 'clientes') renderizarClientes();
    if (aba === 'contratos') renderizarContratos();
}

// ===== NUMERO DO ORCAMENTO =====
function proximoNumero() {
    const hist = getHistorico();
    const nums = hist.map(o => parseInt(o.numero)).filter(n => !isNaN(n));
    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
}

function atualizarNumeroDisplay() {
    const num = orcamentoEditandoId
        ? getHistorico().find(o => o.id === orcamentoEditandoId)?.numero || proximoNumero()
        : proximoNumero();
    document.getElementById('display-numero').textContent = '#' + String(num).padStart(3, '0');
}

// ===== TECNOLOGIAS DISPONÍVEIS =====
const TECNOLOGIAS = [
    'React.js',
    'Vue.js',
    'Angular',
    'Next.js',
    'Node.js',
    'Python / Django',
    'Python / FastAPI',
    'PHP / Laravel',
    'Java / Spring',
    '.NET / C#',
    'React Native',
    'Flutter',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Firebase',
    'AWS / Cloud',
    'Docker / DevOps',
    'WordPress',
    'HTML / CSS / JS',
    'Design UI/UX',
    'Outro',
];

// ===== MÓDULOS PREDEFINIDOS =====
const MODULOS = [
    'Levantamento de Requisitos',
    'Prototipação / Wireframes',
    'Design UI/UX',
    'Landing Page',
    'Hospedagem Site',
    'Hospedagem Sistema',
    'Pacote Sistema + Site',
    'Integração Site + Sistema',
    'Configuração de Ambiente',
    'Módulo de Autenticação',
    'Módulo de Cadastro',
    'Módulo de Dashboard',
    'Módulo de Relatórios',
    'Módulo Financeiro',
    'Módulo de Usuários',
    'Módulo de Permissões',
    'Módulo de Notificações',
    'Integração com API Externa',
    'Integração de Pagamento',
    'Integração WhatsApp',
    'Deploy / Publicação',
    'Manutenção / Suporte',
    'Treinamento',
    'Documentação',
    'Testes / QA',
    'Outro',
];

// ===== FORMAS DE PAGAMENTO =====
function togglePagamento() {
    document.getElementById('form-pagamento').classList.toggle('visivel');
}

// ===== LINHAS DA TABELA =====
function adicionarLinha(desc = '', horas = '', tecnologia = '', valorHora = '', valorFixo = '', total = 0) {
    linhaId++;
    const id = linhaId;
    const tbody = document.getElementById('linhas-tbody');
    const tr = document.createElement('tr');

    tr.dataset.id = id;

    tr.innerHTML = `
<td class="col-desc">
  <select onchange="calcularLinha(${id})">
    ${MODULOS.map(v => `<option ${v === desc ? 'selected' : ''}>${v}</option>`).join('')}
  </select>
</td>

<td class="col-horas">
  <input type="number"
    placeholder="Horas"
    step="0.5"
    min="0"
    value="${horas}"
    oninput="calcularLinha(${id})">
</td>

<td class="col-tecnologia">
  <select onchange="calcularLinha(${id})">
    <option value="">Selecione</option>
    ${TECNOLOGIAS.map(v => `<option ${v === tecnologia ? 'selected' : ''}>${v}</option>`).join('')}
  </select>
</td>

<td class="col-qtd">
  <input type="number"
    placeholder="R$/hora"
    step="0.01"
    min="0"
    value="${valorHora}"
    oninput="calcularLinha(${id})">
</td>

<td class="col-unit">
  <input type="number"
    placeholder="Fixo R$"
    step="0.01"
    min="0"
    value="${valorFixo}"
    oninput="calcularLinha(${id})">
</td>

<td class="col-total">
  <span id="total-${id}">${formatarMoeda(total)}</span>
</td>

<td class="col-acao">
  <button class="btn-remover" onclick="removerLinha(${id})">×</button>
</td>
`;

    tbody.appendChild(tr);
}

function removerLinha(id) {
    const tr = document.querySelector(`tr[data-id="${id}"]`);
    if (tr) tr.remove();
    calcularTotais();
}

function calcularLinha(id) {
    const tr = document.querySelector(`tr[data-id="${id}"]`);
    if (!tr) return;

    const inputs = tr.querySelectorAll('input[type=number]');
    const horas = parseFloat(inputs[0].value) || 0;
    const valorHora = parseFloat(inputs[1].value) || 0;
    const valorFixo = parseFloat(inputs[2]?.value || 0) || 0;

    const totalHoras = horas * valorHora;
    const total = totalHoras + valorFixo;

    tr.querySelector(`#total-${id}`).textContent = formatarMoeda(total);

    calcularTotais();
}

function calcularTotais() {
    let subtotalHoras = 0;
    let subtotalFixo = 0;
    let totalGeral = 0;

    document.querySelectorAll('#linhas-tbody tr').forEach(tr => {
        const inputs = tr.querySelectorAll('input[type=number]');
        const horas = parseFloat(inputs[0].value) || 0;
        const valorHora = parseFloat(inputs[1].value) || 0;
        const valorFixo = parseFloat(inputs[2]?.value || 0) || 0;

        const subHora = horas * valorHora;
        subtotalHoras += subHora;
        subtotalFixo += valorFixo;
        totalGeral += subHora + valorFixo;
    });

    document.getElementById('disp-subtotal-horas').textContent = formatarMoeda(subtotalHoras);
    document.getElementById('disp-subtotal-fixo').textContent = formatarMoeda(subtotalFixo);
    document.getElementById('disp-total').textContent = formatarMoeda(totalGeral);

    limparDescontoCalculo();

    return { subtotalHoras, subtotalFixo, totalGeral };
}

// ===== DESCONTO =====
function toggleDesconto() {
    const form = document.getElementById('form-desconto');
    form.classList.toggle('visivel');
}

function aplicarDesconto() {
    const pct = parseFloat(document.getElementById('input-desconto').value);

    if (isNaN(pct) || pct <= 0 || pct >= 100) {
        mostrarToast('Informe um percentual entre 0 e 100.', 'erro');
        return;
    }

    const totais = calcularTotais();
    const totalGeral = totais.totalGeral;
    descontoAplicado = pct;

    const descValor = totalGeral * pct / 100;
    const comDesc = totalGeral - descValor;

    const cartoes = document.getElementById('desc-cartoes');
    cartoes.innerHTML = `
    <div class="desc-cartao" style="background:#1a4fa8">
      <span class="dc-label">Total com ${pct}% desconto</span>
      <span class="dc-valor">${formatarMoeda(comDesc)}</span>
      <span class="dc-economia">Economia de ${formatarMoeda(descValor)}</span>
    </div>
    <div class="desc-cartao" style="background:#e05c20">
      <span class="dc-label">Valor do desconto</span>
      <span class="dc-valor">${formatarMoeda(descValor)}</span>
      <span class="dc-economia">Sobre ${formatarMoeda(totalGeral)}</span>
    </div>
    `;

    document.getElementById('resultados-desconto').classList.add('visivel');
}

function limparDesconto() {
    descontoAplicado = 0;
    limparDescontoCalculo();
    document.getElementById('form-desconto').classList.remove('visivel');
    document.getElementById('input-desconto').value = '';
}

function limparDescontoCalculo() {
    descontoAplicado = 0;
    document.getElementById('resultados-desconto').classList.remove('visivel');
}

// ===== COLETA DOS DADOS =====
function coletarDados() {
    const linhas = [];
    document.querySelectorAll('#linhas-tbody tr').forEach(tr => {
        const desc = tr.children[0].querySelector('select').value;
        const horas = parseFloat(tr.children[1].querySelector('input').value) || 0;
        const tecnologia = tr.children[2].querySelector('select').value;
        const valorHora = parseFloat(tr.children[3].querySelector('input').value) || 0;
        const valorFixo = parseFloat(tr.children[4].querySelector('input').value) || 0;

        const subtotalHoras = horas * valorHora;
        const total = subtotalHoras + valorFixo;

        linhas.push({ desc, horas, tecnologia, valorHora, valorFixo, subtotalHoras, total });
    });

    const subtotal = linhas.reduce((a, l) => a + l.total, 0);
    return {
        cliente: document.getElementById('campo-cliente').value,
        obra: document.getElementById('campo-obra').value,
        endereco: document.getElementById('campo-endereco').value,
        estado: document.getElementById('campo-estado').value,
        data: document.getElementById('campo-data').value,
        validade: document.getElementById('campo-validade').value,
        prazo: document.getElementById('campo-prazo').value,
        pagamento: Array.from(document.querySelectorAll('#campo-pagamento-wrap input:checked')).map(cb => cb.value),
        obs: document.getElementById('campo-obs').value,
        linhas, subtotal,
        desconto: descontoAplicado,
        totalComDesconto: descontoAplicado ? subtotal * (1 - descontoAplicado / 100) : subtotal
    };
}

// ===== SALVAR =====
function getHistorico() {
    try { return JSON.parse(localStorage.getItem('sanoj_historico') || '[]'); } catch { return []; }
}
function setHistorico(h) { localStorage.setItem('sanoj_historico', JSON.stringify(h)); }

function salvarOrcamento() {
    const dados = coletarDados();
    if (!dados.cliente) { mostrarToast('Informe o nome do cliente.', 'erro'); return; }
    const hist = getHistorico();
    let orcamentoSalvoId = orcamentoEditandoId;

    if (orcamentoEditandoId) {
        const idx = hist.findIndex(o => o.id === orcamentoEditandoId);
        if (idx !== -1) {
            const atual = hist[idx];
            const revBase = atual.revisoes ? atual.revisoes.length + 1 : 1;
            if (!atual.revisoes) atual.revisoes = [];
            atual.revisoes.push({ ...atual, revisoes: undefined, savedAt: atual.savedAt });
            const revLabel = 'REV ' + numeroRomano(revBase);
            hist[idx] = { ...dados, id: orcamentoEditandoId, numero: atual.numero, savedAt: new Date().toISOString(), revisao: revLabel, revisoes: atual.revisoes };
        }
    } else {
        const num = proximoNumero();
        orcamentoSalvoId = Date.now();
        hist.push({ ...dados, id: orcamentoSalvoId, numero: num, savedAt: new Date().toISOString(), revisao: null, revisoes: [] });
    }

    setHistorico(hist);
    if (clienteOrcamentoPendenteId && orcamentoSalvoId) {
        atrelarOrcamentoCliente(clienteOrcamentoPendenteId, orcamentoSalvoId);
        clienteOrcamentoPendenteId = null;
    }
    mostrarToast('Orçamento salvo com sucesso!', 'sucesso');
    orcamentoEditandoId = null;
    document.getElementById('display-rev').innerHTML = '';
    atualizarNumeroDisplay();
    renderizarClientes();
}

function numeroRomano(n) {
    const romanos = [['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];
    let res = '';
    for (const [r, v] of romanos) { while (n >= v) { res += r; n -= v; } }
    return res;
}

// ===== NOVO ORÇAMENTO =====
function novoOrcamento() {
    orcamentoEditandoId = null;
    clienteOrcamentoPendenteId = null;
    document.getElementById('campo-cliente').value = '';
    document.getElementById('campo-obra').value = '';
    document.getElementById('campo-endereco').value = '';
    document.getElementById('campo-estado').value = '';
    document.getElementById('campo-prazo').value = '';
    document.querySelectorAll('#campo-pagamento-wrap input').forEach(cb => cb.checked = false);
    document.getElementById('campo-obs').value = '';
    document.getElementById('display-rev').innerHTML = '';
    const hoje = new Date();
    const validade = new Date();
    validade.setDate(hoje.getDate() + 30);
    document.getElementById('campo-data').value = hoje.toISOString().split('T')[0];
    document.getElementById('campo-validade').value = validade.toISOString().split('T')[0];
    document.getElementById('linhas-tbody').innerHTML = '';
    linhaId = 0;
    adicionarLinha();
    adicionarLinha();
    limparDesconto();
    calcularTotais();
    atualizarNumeroDisplay();
    mudarAba('orcamento', document.querySelector('.nav-tab'));
}

// ===== EDITAR =====
function editarOrcamento(id) {
    const hist = getHistorico();
    const orc = hist.find(o => o.id === id);
    if (!orc) return;
    orcamentoEditandoId = id;
    document.getElementById('campo-cliente').value = orc.cliente || '';
    document.getElementById('campo-obra').value = orc.obra || '';
    document.getElementById('campo-endereco').value = orc.endereco || '';
    document.getElementById('campo-estado').value = orc.estado || '';
    document.getElementById('campo-data').value = orc.data || '';
    document.getElementById('campo-validade').value = orc.validade || '';
    document.getElementById('campo-prazo').value = orc.prazo || '';
    const pagamentoSalvo = Array.isArray(orc.pagamento) ? orc.pagamento : (orc.pagamento ? [orc.pagamento] : []);
    document.querySelectorAll('#campo-pagamento-wrap input').forEach(cb => {
        cb.checked = pagamentoSalvo.includes(cb.value);
    });
    document.getElementById('campo-obs').value = orc.obs || '';
    document.getElementById('linhas-tbody').innerHTML = '';
    linhaId = 0;
    (orc.linhas || []).forEach(l =>
        adicionarLinha(l.desc, l.horas, l.tecnologia, l.valorHora, l.valorFixo, l.total)
    );
    descontoAplicado = orc.desconto || 0;
    limparDescontoCalculo();
    calcularTotais();
    document.getElementById('display-numero').textContent = '#' + String(orc.numero).padStart(3, '0');
    const revLabel = orc.revisoes && orc.revisoes.length > 0
        ? 'REV ' + numeroRomano(orc.revisoes.length + 1) + ' (próxima ao salvar)'
        : '';
    document.getElementById('display-rev').innerHTML = revLabel ? `<div class="orca-rev-badge">${revLabel}</div>` : '';
    mudarAba('orcamento', document.querySelector('.nav-tab'));
    mostrarToast('Orçamento carregado para edição.', 'sucesso');
}

// ===== EXCLUIR =====
function confirmarExcluir(id) {
    abrirModal('Excluir Orçamento', 'Esta ação é irreversível. Deseja excluir este orçamento?', () => {
        const hist = getHistorico().filter(o => o.id !== id);
        setHistorico(hist);
        renderizarHistorico();
        mostrarToast('Orçamento excluído.', 'erro');
    });
}

// ===== HISTORICO =====
let filtroBusca = '';

function filtrarHistorico(v) {
    filtroBusca = v.toLowerCase();
    renderizarHistorico();
}

function renderizarHistorico() {
    const hist = getHistorico().slice().reverse();
    const cont = document.getElementById('hist-conteudo');
    const filtrados = filtroBusca
        ? hist.filter(o => (o.cliente || '').toLowerCase().includes(filtroBusca) || String(o.numero).includes(filtroBusca))
        : hist;
    if (filtrados.length === 0) {
        cont.innerHTML = `<div class="hist-vazio"><div class="icone">💻</div><p>Nenhum orçamento encontrado.<br>Crie seu primeiro orçamento na aba <strong>Novo Orçamento</strong>.</p></div>`;
        return;
    }
    cont.innerHTML = `<div class="hist-lista">${filtrados.map(o => renderItemHistorico(o)).join('')}</div>`;
}

function renderItemHistorico(o) {
    const nRevs = (o.revisoes || []).length;
    const dataFmt = o.data ? new Date(o.data + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
    const savedFmt = o.savedAt ? new Date(o.savedAt).toLocaleDateString('pt-BR') : '';
    const revBadge = o.revisao ? `<span class="hist-rev-badge">${o.revisao}</span>` : '';
    const nRevBadge = nRevs > 0 ? `<span class="hist-rev-badge" style="background:#6b6660">${nRevs} rev.</span>` : '';
    return `
    <div class="hist-item ${o.revisao ? 'rev' : ''}">
      <div class="hist-item-header">
        <div class="hist-item-info">
          <div class="hist-item-num">#${String(o.numero).padStart(3, '0')} ${revBadge} ${nRevBadge}</div>
          <div class="hist-item-cliente">${o.cliente || '(sem nome)'}</div>
          <div class="hist-item-meta">${o.obra || ''} ${o.estado ? '· ' + o.estado : ''} ${dataFmt ? '· ' + dataFmt : ''} ${savedFmt ? '· Salvo em ' + savedFmt : ''}</div>
        </div>
        <div class="hist-item-total">${formatarMoeda(o.totalComDesconto || o.subtotal || 0)}</div>
        <div class="hist-item-acoes">
          <button class="btn-mini editar" onclick="editarOrcamento(${o.id})">✎ Editar</button>
          <button class="btn-mini excluir" onclick="confirmarExcluir(${o.id})">× Excluir</button>
        </div>
      </div>
    </div>`;
}

// ===== LEADS =====
let filtroLeads = '';
let filtroClientes = '';
let filtroContratos = '';
let leadEditandoId = null;
const STATUS_LEADS = ['Novo', 'Em contato', 'Proposta enviada', 'Qualificado', 'Recusado'];
const TIPOS_OPORTUNIDADE = [
    'Clínica odontológica',
    'Clínica médica',
    'Loja de móveis',
    'Arquiteto',
    'Restaurante',
    'Academia',
    'Salão de beleza',
    'Pet shop',
    'Escritório contábil',
    'Imobiliária',
    'Loja de roupas',
    'Oficina mecânica',
];

function getLeads() {
    try { return JSON.parse(localStorage.getItem('sanoj_leads') || '[]'); } catch { return []; }
}

function setLeads(leads) {
    localStorage.setItem('sanoj_leads', JSON.stringify(leads));
}

function getTrashLeads() {
    try { return JSON.parse(localStorage.getItem('sanoj_trash_leads') || '[]'); } catch { return []; }
}

function setTrashLeads(leads) {
    localStorage.setItem('sanoj_trash_leads', JSON.stringify(leads));
}

function getServicosClientes() {
    try { return JSON.parse(localStorage.getItem('sanoj_servicos_clientes') || '{}'); } catch { return {}; }
}

function setServicosClientes(servicos) {
    localStorage.setItem('sanoj_servicos_clientes', JSON.stringify(servicos));
}

function getContratosClientes() {
    try { return JSON.parse(localStorage.getItem('sanoj_contratos_clientes') || '[]'); } catch { return []; }
}

function setContratosClientes(contratos) {
    localStorage.setItem('sanoj_contratos_clientes', JSON.stringify(contratos));
}

function importarContratosAtivos() {
    const contratosAtivos = Array.isArray(window.CONTRACTS_ACTIVE) ? window.CONTRACTS_ACTIVE : [];
    if (contratosAtivos.length === 0) return;

    const contratos = getContratosClientes();
    const ids = new Set(contratos.map(contrato => String(contrato.id)));
    let importou = false;

    contratosAtivos.forEach((contrato, index) => {
        const id = String(contrato.id || Date.now() + 12000 + index);
        if (ids.has(id)) return;
        contratos.push({
            ...contrato,
            id: contrato.id || Number(id),
            createdAt: contrato.createdAt || new Date().toISOString()
        });
        ids.add(id);
        importou = true;
    });

    if (importou) setContratosClientes(contratos);
}

function mudarSubmenuLeads(painel, btn) {
    document.querySelectorAll('.lead-subtab').forEach(tab => tab.classList.remove('ativo'));
    document.querySelectorAll('.lead-subpainel').forEach(el => el.classList.remove('ativo'));
    document.getElementById('lead-painel-' + painel).classList.add('ativo');
    btn.classList.add('ativo');
    if (painel === 'excluidos') renderizarTrashLeads();
}

function gerarBuscasOportunidades() {
    const tipoSelecionado = document.getElementById('opp-tipo').value;
    const localidade = document.getElementById('opp-localidade').value.trim();
    const dataInicio = document.getElementById('opp-data-inicio').value;
    const dataFim = document.getElementById('opp-data-fim').value;
    const cont = document.getElementById('oportunidades-resultados');

    if (!localidade) {
        mostrarToast('Informe a localidade para buscar oportunidades.', 'erro');
        return;
    }

    const tipos = tipoSelecionado === 'todos' ? TIPOS_OPORTUNIDADE : [tipoSelecionado];
    cont.innerHTML = tipos.map(tipo => renderBuscaOportunidade(tipo, localidade, dataInicio, dataFim)).join('');
}

function renderBuscaOportunidade(tipo, localidade, dataInicio, dataFim) {
    const mapsQuery = `${tipo} em ${localidade}`;
    const periodo = formatarPeriodoBusca(dataInicio, dataFim);
    const aberturaQuery = [tipo, localidade, periodo, 'inauguração OR abriu OR abertura CNPJ'].filter(Boolean).join(' ');
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapsQuery);
    const googleUrl = 'https://www.google.com/search?q=' + encodeURIComponent(aberturaQuery);

    return `
    <div class="oportunidade-item">
      <div>
        <div class="oportunidade-titulo">${escapeHtml(tipo)}</div>
        <div class="oportunidade-meta">${escapeHtml(localidade)}${periodo ? ' · ' + escapeHtml(periodo) : ''}</div>
      </div>
      <div class="oportunidade-acoes">
        <a class="btn-mini ver" href="${mapsUrl}" target="_blank" rel="noopener">Google Maps</a>
        <a class="btn-mini editar" href="${googleUrl}" target="_blank" rel="noopener">Data de abertura</a>
      </div>
    </div>`;
}

function formatarPeriodoBusca(inicio, fim) {
    const partes = [];
    if (inicio) partes.push('a partir de ' + new Date(inicio + 'T12:00:00').toLocaleDateString('pt-BR'));
    if (fim) partes.push('até ' + new Date(fim + 'T12:00:00').toLocaleDateString('pt-BR'));
    return partes.join(' ');
}

function limparBuscasOportunidades() {
    document.getElementById('opp-tipo').value = 'todos';
    document.getElementById('opp-localidade').value = '';
    document.getElementById('opp-data-inicio').value = '';
    document.getElementById('opp-data-fim').value = '';
    document.getElementById('oportunidades-resultados').innerHTML = '';
}

function importarLeadsIniciais() {
    const leadsIniciais = Array.isArray(window.ENTRY_LEADS) ? window.ENTRY_LEADS : [];
    if (leadsIniciais.length === 0) return;

    const leads = getLeads();
    const trash = getTrashLeads();
    const telefones = new Set([...leads, ...trash].map(lead => apenasDigitos(lead.contato)));
    const agora = new Date().toISOString();
    let importou = false;

    leadsIniciais.forEach((lead, index) => {
        const telefone = apenasDigitos(lead.contato);
        if (!telefone || telefones.has(telefone)) return;

        leads.push({
            id: Date.now() + index,
            nome: lead.nome,
            contato: lead.contato,
            email: '',
            projeto: '',
            ramo: lead.ramo,
            dataAbordagem: lead.dataAbordagem,
            cidade: lead.cidade,
            estado: lead.estado,
            status: ['Não', 'Nao'].includes(lead.resposta) ? 'Recusado' : 'Novo',
            obs: `Resposta: ${lead.resposta}`,
            createdAt: agora
        });
        telefones.add(telefone);
        importou = true;
    });

    if (importou) setLeads(leads);
}

function importarClientesAtivos() {
    const clientesAtivos = Array.isArray(window.CLIENT_ACTIVE) ? window.CLIENT_ACTIVE : [];
    if (clientesAtivos.length === 0) return;

    const leads = getLeads();
    const servicos = getServicosClientes();
    let alterouLeads = false;
    let alterouServicos = false;

    clientesAtivos.forEach((cliente, index) => {
        const telefone = apenasDigitos(cliente.contato);
        let lead = leads.find(item => {
            const mesmoTelefone = telefone && apenasDigitos(item.contato) === telefone;
            const mesmoNome = (item.nome || '').toLowerCase() === (cliente.nome || '').toLowerCase();
            return mesmoTelefone || mesmoNome;
        });

        if (!lead) {
            lead = {
                id: Date.now() + 5000 + index,
                nome: cliente.nome || 'Cliente ativo',
                contato: cliente.contato || '',
                email: cliente.email || '',
                projeto: cliente.projeto || '',
                ramo: cliente.ramo || '',
                dataAbordagem: cliente.dataAbordagem || '',
                cidade: cliente.cidade || '',
                estado: cliente.estado || '',
                status: 'Qualificado',
                obs: cliente.obsLead || '',
                createdAt: new Date().toISOString()
            };
            leads.push(lead);
            alterouLeads = true;
        } else if (normalizarStatusLead(lead.status) !== 'Qualificado') {
            lead.status = 'Qualificado';
            alterouLeads = true;
        }

        const servicoAtual = servicos[lead.id] || {};
        servicos[lead.id] = {
            ...servicoAtual,
            orcamentoId: cliente.orcamentoId || servicoAtual.orcamentoId || '',
            sistema: cliente.sistema || servicoAtual.sistema || '',
            webpage: cliente.webpage || servicoAtual.webpage || '',
            webpages: cliente.webpages || servicoAtual.webpages || (cliente.webpage ? [{ url: cliente.webpage }] : undefined),
            dominios: cliente.dominios || servicoAtual.dominios || '',
            dominiosLista: cliente.dominiosLista || servicoAtual.dominiosLista || undefined,
            planos: cliente.planos || servicoAtual.planos || '',
            planosLista: cliente.planosLista || servicoAtual.planosLista || undefined,
            statusServico: cliente.statusServico || servicoAtual.statusServico || 'Planejamento',
            obs: cliente.obs || servicoAtual.obs || '',
            updatedAt: servicoAtual.updatedAt || new Date().toISOString()
        };
        alterouServicos = true;
    });

    if (alterouLeads) setLeads(leads);
    if (alterouServicos) setServicosClientes(servicos);
}

function importarTrashLeads() {
    const trashInicial = Array.isArray(window.TRASH_LEADS) ? window.TRASH_LEADS : [];
    if (trashInicial.length === 0) return;

    const trash = getTrashLeads();
    const chaves = new Set(trash.map(lead => apenasDigitos(lead.contato) || String(lead.id || lead.nome)));
    let importou = false;

    trashInicial.forEach((lead, index) => {
        const chave = apenasDigitos(lead.contato) || String(lead.id || lead.nome || index);
        if (chaves.has(chave)) return;
        trash.push({
            ...lead,
            id: lead.id || Date.now() + 9000 + index,
            deletedAt: lead.deletedAt || new Date().toISOString()
        });
        chaves.add(chave);
        importou = true;
    });

    if (importou) setTrashLeads(trash);
}

function abrirModalLead() {
    leadEditandoId = null;
    limparFormLead();
    document.querySelector('#lead-modal-overlay h3').textContent = 'Novo Lead';
    document.getElementById('lead-data-abordagem').value = new Date().toISOString().split('T')[0];
    document.getElementById('lead-modal-overlay').classList.add('aberto');
    setTimeout(() => document.getElementById('lead-nome').focus(), 50);
}

function fecharModalLead() {
    document.getElementById('lead-modal-overlay').classList.remove('aberto');
    leadEditandoId = null;
}

function salvarLead() {
    const nome = document.getElementById('lead-nome').value.trim();
    if (!nome) { mostrarToast('Informe o nome do lead.', 'erro'); return; }

    const leads = getLeads();
    const dados = {
        nome,
        contato: document.getElementById('lead-contato').value.trim(),
        email: document.getElementById('lead-email').value.trim(),
        projeto: document.getElementById('lead-projeto').value.trim(),
        ramo: document.getElementById('lead-ramo').value.trim(),
        dataAbordagem: document.getElementById('lead-data-abordagem').value,
        cidade: document.getElementById('lead-cidade').value.trim(),
        estado: document.getElementById('lead-estado').value.trim().toUpperCase(),
        status: document.getElementById('lead-status').value,
        obs: document.getElementById('lead-obs').value.trim(),
    };

    const estavaEditando = !!leadEditandoId;
    if (leadEditandoId) {
        const idx = leads.findIndex(lead => lead.id === leadEditandoId);
        if (idx !== -1) {
            leads[idx] = { ...leads[idx], ...dados, updatedAt: new Date().toISOString() };
        }
    } else {
        leads.push({ id: Date.now(), ...dados, createdAt: new Date().toISOString() });
    }

    setLeads(leads);
    limparFormLead();
    fecharModalLead();
    renderizarLeads();
    renderizarClientes();
    mostrarToast(estavaEditando ? 'Lead atualizado com sucesso!' : 'Lead salvo com sucesso!', 'sucesso');
}

function limparFormLead() {
    ['lead-nome', 'lead-contato', 'lead-email', 'lead-projeto', 'lead-ramo', 'lead-data-abordagem', 'lead-cidade', 'lead-estado', 'lead-obs'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('lead-status').value = 'Novo';
}

function filtrarLeads(v) {
    filtroLeads = v.toLowerCase();
    renderizarLeads();
}

function renderizarLeads() {
    const cont = document.getElementById('leads-conteudo');
    if (!cont) return;

    const leads = getLeads().slice().reverse();
    const filtrados = filtroLeads
        ? leads.filter(l =>
            (l.nome || '').toLowerCase().includes(filtroLeads) ||
            (l.contato || '').toLowerCase().includes(filtroLeads) ||
            (l.email || '').toLowerCase().includes(filtroLeads) ||
            (l.projeto || '').toLowerCase().includes(filtroLeads) ||
            (l.ramo || '').toLowerCase().includes(filtroLeads) ||
            (l.status || '').toLowerCase().includes(filtroLeads))
        : leads;

    cont.innerHTML = `<div class="kanban-leads">
        ${STATUS_LEADS.map(status => renderColunaLead(status, filtrados)).join('')}
    </div>`;
}

function renderColunaLead(status, leads) {
    const itens = leads.filter(lead => normalizarStatusLead(lead.status) === status);
    const vazio = `<div class="lead-coluna-vazia">Nenhum lead</div>`;

    return `
    <div class="lead-coluna" data-status="${escapeHtml(status)}" ondragover="permitirSoltarLead(event)" ondragleave="sairColunaLead(event)" ondrop="soltarLead(event, '${escapeHtml(status)}')">
      <div class="lead-coluna-topo">
        <span>${escapeHtml(status)}</span>
        <strong>${itens.length}</strong>
      </div>
      <div class="lead-lista">
        ${itens.length ? itens.map(renderItemLead).join('') : vazio}
      </div>
    </div>`;
}

function normalizarStatusLead(status) {
    return STATUS_LEADS.includes(status) ? status : 'Novo';
}

function renderItemLead(lead) {
    const dataFmt = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : '';
    const abordagemFmt = lead.dataAbordagem ? new Date(lead.dataAbordagem + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    const meta = [lead.projeto, lead.ramo, lead.cidade, lead.estado].filter(Boolean).join(' · ');
    const telefone = formatarTelefoneLead(lead.contato || '');
    const whatsappUrl = gerarWhatsappUrl(lead.contato || '');

    return `
    <div class="lead-item" draggable="true" ondragstart="iniciarArrastoLead(event, ${lead.id})" ondragend="finalizarArrastoLead(event)">
      <div class="lead-item-info">
        <div class="lead-item-nome">${escapeHtml(lead.nome || '(sem nome)')}</div>
        <div class="lead-item-meta">${escapeHtml(meta)}</div>
        <div class="lead-item-contato">${escapeHtml(telefone || 'Sem telefone informado')}</div>
        ${lead.email ? `<div class="lead-item-contato">${escapeHtml(lead.email)}</div>` : ''}
        ${abordagemFmt ? `<div class="lead-item-data">Abordagem: ${escapeHtml(abordagemFmt)}</div>` : ''}
        ${dataFmt ? `<div class="lead-item-data">Cadastro: ${escapeHtml(dataFmt)}</div>` : ''}
        ${lead.obs ? `<div class="lead-item-obs">${escapeHtml(lead.obs)}</div>` : ''}
      </div>
      <div class="lead-item-lado">
        <div class="hist-item-acoes">
          ${whatsappUrl ? `<a class="btn-mini whatsapp" href="${whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
          <button class="btn-mini ver" onclick="usarLead(${lead.id})">Usar no orçamento</button>
          <button class="btn-mini editar" onclick="editarLead(${lead.id})">Editar</button>
          <button class="btn-mini excluir" onclick="excluirLead(${lead.id})">Excluir</button>
        </div>
      </div>
    </div>`;
}

function editarLead(id) {
    const lead = getLeads().find(item => item.id === id);
    if (!lead) return;

    leadEditandoId = id;
    document.querySelector('#lead-modal-overlay h3').textContent = 'Editar Lead';
    document.getElementById('lead-nome').value = lead.nome || '';
    document.getElementById('lead-contato').value = lead.contato || '';
    document.getElementById('lead-email').value = lead.email || '';
    document.getElementById('lead-projeto').value = lead.projeto || '';
    document.getElementById('lead-ramo').value = lead.ramo || '';
    document.getElementById('lead-data-abordagem').value = lead.dataAbordagem || '';
    document.getElementById('lead-cidade').value = lead.cidade || '';
    document.getElementById('lead-estado').value = lead.estado || '';
    document.getElementById('lead-status').value = normalizarStatusLead(lead.status);
    document.getElementById('lead-obs').value = lead.obs || '';
    document.getElementById('lead-modal-overlay').classList.add('aberto');
    setTimeout(() => document.getElementById('lead-nome').focus(), 50);
}

function apenasDigitos(valor) {
    return String(valor || '').replace(/\D/g, '');
}

function formatarTelefoneLead(valor) {
    const digitos = apenasDigitos(valor);
    if (!digitos) return '';
    if (digitos.length === 11) return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (digitos.length === 10) return digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return valor;
}

function gerarWhatsappUrl(valor) {
    let digitos = apenasDigitos(valor);
    if (!digitos) return '';
    if (digitos.length === 10 || digitos.length === 11) digitos = '55' + digitos;
    return `https://wa.me/${digitos}`;
}

function iniciarArrastoLead(event, id) {
    event.dataTransfer.setData('text/plain', String(id));
    event.dataTransfer.effectAllowed = 'move';
    event.currentTarget.classList.add('arrastando');
}

function finalizarArrastoLead(event) {
    event.currentTarget.classList.remove('arrastando');
    document.querySelectorAll('.lead-coluna.drag-over').forEach(col => col.classList.remove('drag-over'));
}

function permitirSoltarLead(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drag-over');
}

function sairColunaLead(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
        event.currentTarget.classList.remove('drag-over');
    }
}

function soltarLead(event, status) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const id = Number(event.dataTransfer.getData('text/plain'));
    if (!id) return;
    alterarStatusLead(id, status);
}

function alterarStatusLead(id, status) {
    const leads = getLeads();
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    lead.status = normalizarStatusLead(status);
    setLeads(leads);
    renderizarLeads();
    renderizarClientes();
    mostrarToast(`Lead movido para ${lead.status}.`, 'sucesso');
}

function usarLead(id) {
    const lead = getLeads().find(l => l.id === id);
    if (!lead) return;

    document.getElementById('campo-cliente').value = lead.nome || '';
    document.getElementById('campo-endereco').value = lead.cidade || '';
    document.getElementById('campo-estado').value = lead.estado || '';
    document.getElementById('campo-obs').value = lead.obs || '';

    const campoObra = document.getElementById('campo-obra');
    const opcao = Array.from(campoObra.options).find(opt =>
        opt.textContent.toLowerCase() === (lead.projeto || '').toLowerCase()
    );
    campoObra.value = opcao ? opcao.value : (lead.projeto ? 'Outro' : '');

    mudarAba('orcamento', document.querySelector('.nav-tab[onclick*="orcamento"]'));
    mostrarToast('Lead selecionado para o orçamento.', 'sucesso');
}

function excluirLead(id) {
    abrirModal('Excluir Lead', 'Deseja mover este lead para Leads Excluídos?', () => {
        const leads = getLeads();
        const lead = leads.find(l => l.id === id);
        if (!lead) return;

        const trash = getTrashLeads();
        trash.unshift({
            ...lead,
            previousStatus: lead.status,
            deletedAt: new Date().toISOString()
        });

        setTrashLeads(trash);
        setLeads(leads.filter(l => l.id !== id));
        renderizarLeads();
        renderizarTrashLeads();
        renderizarClientes();
        mostrarToast('Lead movido para Leads Excluídos.', 'erro');
    });
}

function renderizarTrashLeads() {
    const cont = document.getElementById('trash-leads-conteudo');
    if (!cont) return;

    const trash = getTrashLeads();
    if (trash.length === 0) {
        cont.innerHTML = `<div class="hist-vazio"><p>Nenhum lead excluído.</p></div>`;
        return;
    }

    cont.innerHTML = `<div class="trash-lista">${trash.map(renderTrashLead).join('')}</div>`;
}

function renderTrashLead(lead) {
    const telefone = formatarTelefoneLead(lead.contato || '');
    const deletedFmt = lead.deletedAt ? new Date(lead.deletedAt).toLocaleDateString('pt-BR') : '';

    return `
    <div class="trash-item">
      <div>
        <div class="lead-item-nome">${escapeHtml(lead.nome || '(sem nome)')}</div>
        <div class="lead-item-meta">${escapeHtml([lead.ramo, lead.cidade, lead.estado].filter(Boolean).join(' · '))}</div>
        ${telefone ? `<div class="lead-item-contato">${escapeHtml(telefone)}</div>` : ''}
        ${deletedFmt ? `<div class="lead-item-data">Excluído em: ${escapeHtml(deletedFmt)}</div>` : ''}
      </div>
      <div class="hist-item-acoes">
        <button class="btn-mini ver" onclick="restaurarLead(${lead.id})">Restaurar</button>
      </div>
    </div>`;
}

function restaurarLead(id) {
    const trash = getTrashLeads();
    const lead = trash.find(item => item.id === id);
    if (!lead) return;

    const restaurado = { ...lead, status: 'Em contato', restoredAt: new Date().toISOString() };
    delete restaurado.deletedAt;
    delete restaurado.previousStatus;

    const leads = getLeads();
    const telefone = apenasDigitos(restaurado.contato);
    const jaExiste = leads.some(item => (telefone && apenasDigitos(item.contato) === telefone) || item.id === restaurado.id);
    if (!jaExiste) leads.push(restaurado);

    setLeads(leads);
    setTrashLeads(trash.filter(item => item.id !== id));
    renderizarLeads();
    renderizarTrashLeads();
    renderizarClientes();
    mostrarToast('Lead restaurado para Em contato.', 'sucesso');
}

function exportarTrashLeadsJs() {
    const conteudo = 'window.TRASH_LEADS = ' + JSON.stringify(getTrashLeads(), null, 2) + ';\n';
    const blob = new Blob([conteudo], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trash-leads.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    mostrarToast('Arquivo trash-leads.js gerado.', 'sucesso');
}

// ===== CLIENTES / SERVICOS =====
function filtrarClientes(v) {
    filtroClientes = v.toLowerCase();
    renderizarClientes();
}

function renderizarClientes() {
    const cont = document.getElementById('clientes-conteudo');
    if (!cont) return;

    const clientes = getLeads()
        .filter(lead => normalizarStatusLead(lead.status) === 'Qualificado')
        .filter(lead => {
            if (!filtroClientes) return true;
            return (lead.nome || '').toLowerCase().includes(filtroClientes) ||
                (lead.ramo || '').toLowerCase().includes(filtroClientes) ||
                (lead.cidade || '').toLowerCase().includes(filtroClientes);
        });

    if (clientes.length === 0) {
        cont.innerHTML = `<div class="hist-vazio"><p>Nenhum cliente qualificado ainda.<br>Mova um lead para <strong>Qualificado</strong> no Kanban para acompanhar/monitorar os serviços e assinaturas.</p></div>`;
        return;
    }

    cont.innerHTML = `<div class="clientes-grid">${clientes.map(renderClienteServico).join('')}</div>`;
}

function normalizarServicoCliente(dados = {}) {
    const webpages = Array.isArray(dados.webpages)
        ? dados.webpages
        : (dados.webpage ? [{ url: dados.webpage }] : []);
    const dominios = Array.isArray(dados.dominiosLista)
        ? dados.dominiosLista
        : (dados.dominios ? String(dados.dominios).split(',').map(dominio => ({ dominio: dominio.trim(), porta: '', vps: '' })).filter(item => item.dominio) : []);
    const planos = Array.isArray(dados.planosLista)
        ? dados.planosLista
        : (dados.planos ? [{ nome: dados.planos, dataInicio: '', dataFim: '', valor: '', periodicidade: 'mensal', dataVencimento: '' }] : []);

    return {
        ...dados,
        webpages: webpages.length ? webpages : [{ url: '' }],
        dominiosLista: dominios.length ? dominios : [{ dominio: '', porta: '', vps: '' }],
        planosLista: planos.length ? planos : [{ nome: '', dataInicio: '', dataFim: '', valor: '', periodicidade: 'mensal', dataVencimento: '' }],
    };
}

function renderClienteServico(lead) {
    const servicos = getServicosClientes();
    const dados = normalizarServicoCliente(servicos[lead.id] || {});
    const orcamentos = getHistorico();
    const telefone = formatarTelefoneLead(lead.contato || '');
    const whatsappUrl = gerarWhatsappUrl(lead.contato || '');
    const primeiraWebpage = dados.webpages.find(item => item.url)?.url || '';

    return `
    <div class="cliente-card" id="cliente-card-${lead.id}">
      <div class="cliente-card-topo">
        <div>
          <div class="cliente-nome">${escapeHtml(lead.nome || '(sem nome)')}</div>
          <div class="cliente-meta">${escapeHtml([lead.ramo, lead.cidade, lead.estado].filter(Boolean).join(' · '))}</div>
          ${telefone ? `<div class="cliente-contato-linha"><span class="cliente-meta">${escapeHtml(telefone)}</span>${whatsappUrl ? `<a class="btn-mini whatsapp" href="${whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>` : ''}</div>` : ''}
        </div>
        <span class="cliente-status">Qualificado</span>
      </div>

      <div class="cliente-servicos-form">
        <div class="campo">
          <label>Orcamento Atrelado</label>
          <select id="cliente-orcamento-${lead.id}">
            <option value="">Sem orcamento atrelado</option>
            ${orcamentos.map(orc => `<option value="${orc.id}" ${String(dados.orcamentoId || '') === String(orc.id) ? 'selected' : ''}>#${String(orc.numero).padStart(3, '0')} - ${escapeHtml(orc.cliente || 'Sem cliente')} - ${formatarMoeda(orc.totalComDesconto || orc.subtotal || 0)}</option>`).join('')}
          </select>
        </div>
        <div class="campo">
          <label>Sistema</label>
          <input type="text" id="cliente-sistema-${lead.id}" value="${escapeAttr(dados.sistema || '')}" placeholder="Ex.: CRM, ERP, portal, automacao">
        </div>

        <div class="cliente-campo-full cliente-lista-bloco">
          <div class="cliente-lista-titulo">
            <label>Webpages</label>
            <button class="btn-mini ver" onclick="adicionarWebpageCliente(${lead.id})">+ Webpage</button>
          </div>
          ${dados.webpages.map((item, index) => renderWebpageCliente(lead.id, item, index, dados.webpages.length)).join('')}
        </div>

        <div class="cliente-campo-full cliente-lista-bloco">
          <div class="cliente-lista-titulo">
            <label>Domínios</label>
            <button class="btn-mini ver" onclick="adicionarDominioCliente(${lead.id})">+ Domínio</button>
          </div>
          ${dados.dominiosLista.map((item, index) => renderDominioCliente(lead.id, item, index, dados.dominiosLista.length)).join('')}
        </div>

        <div class="cliente-campo-full cliente-lista-bloco">
          <div class="cliente-lista-titulo">
            <label>Planos</label>
            <button class="btn-mini ver" onclick="adicionarPlanoCliente(${lead.id})">+ Plano</button>
          </div>
          ${dados.planosLista.map((item, index) => renderPlanoCliente(lead.id, item, index, dados.planosLista.length)).join('')}
        </div>

        <div class="campo">
          <label>Status do Servico</label>
          <select id="cliente-status-servico-${lead.id}">
            ${['Planejamento', 'Em desenvolvimento', 'Publicado', 'Manutencao', 'Pausado'].map(status => `<option ${dados.statusServico === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </div>
        <div class="campo cliente-campo-full">
          <label>Observacoes</label>
          <textarea id="cliente-obs-${lead.id}" placeholder="Acessos, vencimentos, escopo, proximas acoes...">${escapeHtml(dados.obs || '')}</textarea>
        </div>
      </div>

      <div class="cliente-card-acoes">
        ${primeiraWebpage ? `<a class="btn-mini ver" href="${escapeAttr(primeiraWebpage)}" target="_blank" rel="noopener">Abrir webpage</a>` : ''}
        <button class="btn-mini ver" onclick="criarOrcamentoCliente(${lead.id})">Criar Orçamento</button>
        <button class="btn-mini ver" onclick="criarContratoCliente(${lead.id})">Criar Contrato</button>
        <button class="btn-mini ver" onclick="verContratosCliente(${lead.id})">Ver Contratos</button>
        <button class="btn-mini editar" onclick="salvarServicoCliente(${lead.id})">Salvar acompanhamento</button>
      </div>
    </div>`;
}

function renderWebpageCliente(leadId, item, index, total) {
    return `
    <div class="cliente-lista-item cliente-webpage-item">
      <input type="url" class="cliente-webpage-url" value="${escapeAttr(item.url || '')}" placeholder="https://site.com.br">
      <button class="btn-mini excluir" onclick="removerWebpageCliente(${leadId}, ${index})" ${total <= 1 ? 'disabled' : ''}>Remover</button>
    </div>`;
}

function renderDominioCliente(leadId, item, index, total) {
    return `
    <div class="cliente-lista-item cliente-dominio-item">
      <input type="text" class="cliente-dominio-nome" value="${escapeAttr(item.dominio || '')}" placeholder="dominio.com.br">
      <input type="text" class="cliente-dominio-porta" value="${escapeAttr(item.porta || '')}" placeholder="Porta">
      <input type="text" class="cliente-dominio-vps" value="${escapeAttr(item.vps || '')}" placeholder="VPS">
      <button class="btn-mini excluir" onclick="removerDominioCliente(${leadId}, ${index})" ${total <= 1 ? 'disabled' : ''}>Remover</button>
    </div>`;
}

function renderPlanoCliente(leadId, item, index, total) {
    const periodicidade = item.periodicidade || 'mensal';
    const exibirVencimento = periodicidade !== 'vitalicio';

    return `
    <div class="cliente-plano-item">
      <div class="cliente-plano-grid">
        <input type="text" class="cliente-plano-nome" value="${escapeAttr(item.nome || '')}" placeholder="Nome do plano">
        <input type="date" class="cliente-plano-inicio" value="${escapeAttr(item.dataInicio || '')}" title="Data inicial">
        <input type="date" class="cliente-plano-fim" value="${escapeAttr(item.dataFim || '')}" title="Data final">
        <input type="number" class="cliente-plano-valor" value="${escapeAttr(item.valor || '')}" placeholder="Valor" min="0" step="0.01">
        <div class="cliente-periodicidade">
          <button class="cliente-periodicidade-btn ${periodicidade === 'mensal' ? 'ativo' : ''}" data-periodicidade="mensal" onclick="atualizarPeriodicidadePlano(${leadId}, ${index}, 'mensal')">Mensal</button>
          <button class="cliente-periodicidade-btn ${periodicidade === 'anual' ? 'ativo' : ''}" data-periodicidade="anual" onclick="atualizarPeriodicidadePlano(${leadId}, ${index}, 'anual')">Anual</button>
          <button class="cliente-periodicidade-btn ${periodicidade === 'vitalicio' ? 'ativo' : ''}" data-periodicidade="vitalicio" onclick="atualizarPeriodicidadePlano(${leadId}, ${index}, 'vitalicio')">Vitalício</button>
        </div>
        <input type="date" class="cliente-plano-vencimento ${exibirVencimento ? '' : 'oculto'}" value="${escapeAttr(item.dataVencimento || '')}" title="Data vencimento">
        <button class="btn-mini excluir" onclick="removerPlanoCliente(${leadId}, ${index})" ${total <= 1 ? 'disabled' : ''}>Remover</button>
      </div>
    </div>`;
}

function coletarServicoCliente(leadId) {
    const card = document.getElementById(`cliente-card-${leadId}`);
    const servicoAtual = normalizarServicoCliente(getServicosClientes()[leadId] || {});
    if (!card) return servicoAtual;

    const webpages = Array.from(card.querySelectorAll('.cliente-webpage-item')).map(item => ({
        url: item.querySelector('.cliente-webpage-url').value.trim()
    }));
    const dominiosLista = Array.from(card.querySelectorAll('.cliente-dominio-item')).map(item => ({
        dominio: item.querySelector('.cliente-dominio-nome').value.trim(),
        porta: item.querySelector('.cliente-dominio-porta').value.trim(),
        vps: item.querySelector('.cliente-dominio-vps').value.trim()
    }));
    const planosLista = Array.from(card.querySelectorAll('.cliente-plano-item')).map(item => ({
        nome: item.querySelector('.cliente-plano-nome').value.trim(),
        dataInicio: item.querySelector('.cliente-plano-inicio').value,
        dataFim: item.querySelector('.cliente-plano-fim').value,
        valor: item.querySelector('.cliente-plano-valor').value,
        periodicidade: item.querySelector('.cliente-periodicidade-btn.ativo')?.dataset.periodicidade || 'mensal',
        dataVencimento: item.querySelector('.cliente-plano-vencimento').value
    }));

    return {
        orcamentoId: document.getElementById(`cliente-orcamento-${leadId}`).value,
        sistema: document.getElementById(`cliente-sistema-${leadId}`).value.trim(),
        webpage: webpages.find(item => item.url)?.url || '',
        webpages,
        dominios: dominiosLista.map(item => item.dominio).filter(Boolean).join(', '),
        dominiosLista,
        planos: planosLista.map(item => item.nome).filter(Boolean).join(', '),
        planosLista,
        statusServico: document.getElementById(`cliente-status-servico-${leadId}`).value,
        obs: document.getElementById(`cliente-obs-${leadId}`).value.trim(),
        updatedAt: new Date().toISOString()
    };
}

function salvarRascunhoServicoCliente(leadId) {
    const servicos = getServicosClientes();
    servicos[leadId] = coletarServicoCliente(leadId);
    setServicosClientes(servicos);
    return servicos[leadId];
}

function alterarListaServicoCliente(leadId, tipo, index = null, periodicidade = null) {
    const servicos = getServicosClientes();
    const dados = normalizarServicoCliente(salvarRascunhoServicoCliente(leadId));

    if (tipo === 'add-webpage') dados.webpages.push({ url: '' });
    if (tipo === 'remove-webpage') dados.webpages.splice(index, 1);
    if (tipo === 'add-dominio') dados.dominiosLista.push({ dominio: '', porta: '', vps: '' });
    if (tipo === 'remove-dominio') dados.dominiosLista.splice(index, 1);
    if (tipo === 'add-plano') dados.planosLista.push({ nome: '', dataInicio: '', dataFim: '', valor: '', periodicidade: 'mensal', dataVencimento: '' });
    if (tipo === 'remove-plano') dados.planosLista.splice(index, 1);
    if (tipo === 'periodicidade-plano') {
        dados.planosLista[index].periodicidade = periodicidade;
        if (periodicidade === 'vitalicio') dados.planosLista[index].dataVencimento = '';
    }

    servicos[leadId] = normalizarServicoCliente(dados);
    setServicosClientes(servicos);
    renderizarClientes();
}

function adicionarWebpageCliente(leadId) { alterarListaServicoCliente(leadId, 'add-webpage'); }
function removerWebpageCliente(leadId, index) { alterarListaServicoCliente(leadId, 'remove-webpage', index); }
function adicionarDominioCliente(leadId) { alterarListaServicoCliente(leadId, 'add-dominio'); }
function removerDominioCliente(leadId, index) { alterarListaServicoCliente(leadId, 'remove-dominio', index); }
function adicionarPlanoCliente(leadId) { alterarListaServicoCliente(leadId, 'add-plano'); }
function removerPlanoCliente(leadId, index) { alterarListaServicoCliente(leadId, 'remove-plano', index); }
function atualizarPeriodicidadePlano(leadId, index, periodicidade) { alterarListaServicoCliente(leadId, 'periodicidade-plano', index, periodicidade); }

function salvarServicoCliente(leadId) {
    const servicos = getServicosClientes();
    servicos[leadId] = coletarServicoCliente(leadId);
    setServicosClientes(servicos);
    renderizarClientes();
    mostrarToast('Acompanhamento do cliente salvo.', 'sucesso');
}

function atrelarOrcamentoCliente(leadId, orcamentoId) {
    const servicos = getServicosClientes();
    servicos[leadId] = {
        ...normalizarServicoCliente(servicos[leadId] || {}),
        orcamentoId: String(orcamentoId),
        updatedAt: new Date().toISOString()
    };
    setServicosClientes(servicos);
}

function criarOrcamentoCliente(leadId) {
    const lead = getLeads().find(item => item.id === leadId);
    if (!lead) return;

    salvarRascunhoServicoCliente(leadId);
    orcamentoEditandoId = null;
    clienteOrcamentoPendenteId = leadId;

    document.getElementById('campo-cliente').value = lead.nome || '';
    document.getElementById('campo-endereco').value = lead.cidade || '';
    document.getElementById('campo-estado').value = lead.estado || '';
    document.getElementById('campo-obs').value = lead.obs || '';

    const campoObra = document.getElementById('campo-obra');
    const servicos = normalizarServicoCliente(getServicosClientes()[leadId] || {});
    const tipoSugerido = servicos.sistema || lead.projeto || '';
    const opcao = Array.from(campoObra.options).find(opt =>
        opt.textContent.toLowerCase() === tipoSugerido.toLowerCase()
    );
    campoObra.value = opcao ? opcao.value : (tipoSugerido ? 'Outro' : '');

    const hoje = new Date();
    const validade = new Date();
    validade.setDate(hoje.getDate() + 30);
    document.getElementById('campo-data').value = hoje.toISOString().split('T')[0];
    document.getElementById('campo-validade').value = validade.toISOString().split('T')[0];
    document.getElementById('display-rev').innerHTML = '';
    atualizarNumeroDisplay();
    mudarAba('orcamento', document.querySelector('.nav-tab[onclick*="orcamento"]'));
    mostrarToast('Orçamento iniciado e vinculado ao cliente. Salve para confirmar o vínculo.', 'sucesso');
}

function criarContratoCliente(leadId) {
    const lead = getLeads().find(item => item.id === leadId);
    if (!lead) return;

    const servico = salvarRascunhoServicoCliente(leadId);
    const historico = getHistorico();
    const orcamento = historico.find(item => String(item.id) === String(servico.orcamentoId));
    const contratos = getContratosClientes();
    const numero = contratos.filter(item => item.leadId === leadId).length + 1;

    contratos.push({
        id: Date.now(),
        leadId,
        cliente: lead.nome || '',
        contratoNumero: numero,
        orcamentoId: servico.orcamentoId || '',
        orcamentoNumero: orcamento ? orcamento.numero : '',
        sistema: servico.sistema || '',
        webpages: servico.webpages || [],
        dominiosLista: servico.dominiosLista || [],
        planosLista: servico.planosLista || [],
        valorOrcamento: orcamento ? (orcamento.totalComDesconto || orcamento.subtotal || 0) : 0,
        status: 'Rascunho',
        createdAt: new Date().toISOString()
    });

    setContratosClientes(contratos);
    renderizarContratos();
    verContratosCliente(leadId);
    mostrarToast('Contrato criado em rascunho.', 'sucesso');
}

function verContratosCliente(leadId) {
    const lead = getLeads().find(item => item.id === leadId);
    const contratos = getContratosClientes().filter(item => item.leadId === leadId);
    document.getElementById('contratos-modal-titulo').textContent = `Contratos - ${lead?.nome || 'Cliente'}`;
    const cont = document.getElementById('contratos-modal-conteudo');

    if (contratos.length === 0) {
        cont.innerHTML = `<div class="hist-vazio contratos-vazio"><p>Nenhum contrato criado para este cliente.</p></div>`;
    } else {
        cont.innerHTML = `<div class="contratos-lista">${contratos.map(renderContratoCliente).join('')}</div>`;
    }

    document.getElementById('contratos-modal-overlay').classList.add('aberto');
}

function filtrarContratos(v) {
    filtroContratos = v.toLowerCase();
    renderizarContratos();
}

function renderizarContratos() {
    const cont = document.getElementById('contratos-conteudo');
    if (!cont) return;

    const contratos = getContratosClientes()
        .slice()
        .reverse()
        .filter(contrato => {
            if (!filtroContratos) return true;
            return (contrato.cliente || '').toLowerCase().includes(filtroContratos) ||
                (contrato.sistema || '').toLowerCase().includes(filtroContratos) ||
                String(contrato.orcamentoNumero || '').includes(filtroContratos) ||
                String(contrato.contratoNumero || '').includes(filtroContratos);
        });

    if (contratos.length === 0) {
        cont.innerHTML = `<div class="hist-vazio"><p>Nenhum contrato criado ainda.</p></div>`;
        return;
    }

    cont.innerHTML = `<div class="contratos-grid">${contratos.map(renderContratoCliente).join('')}</div>`;
}

function renderContratoCliente(contrato) {
    const criadoFmt = contrato.createdAt ? new Date(contrato.createdAt).toLocaleDateString('pt-BR') : '';
    const planos = (contrato.planosLista || []).map(plano => plano.nome).filter(Boolean).join(', ');
    const dominios = (contrato.dominiosLista || []).map(item => item.dominio).filter(Boolean).join(', ');

    return `
    <div class="contrato-item">
      <div>
        <div class="contrato-titulo">Contrato #${String(contrato.contratoNumero).padStart(2, '0')}</div>
        ${contrato.cliente ? `<div class="contrato-cliente">${escapeHtml(contrato.cliente)}</div>` : ''}
        <div class="contrato-meta">${contrato.orcamentoNumero ? `Orçamento #${String(contrato.orcamentoNumero).padStart(3, '0')} · ` : ''}${escapeHtml(contrato.status || 'Rascunho')}${criadoFmt ? ' · ' + escapeHtml(criadoFmt) : ''}</div>
        ${contrato.sistema ? `<div class="contrato-meta">Sistema: ${escapeHtml(contrato.sistema)}</div>` : ''}
        ${dominios ? `<div class="contrato-meta">Domínios: ${escapeHtml(dominios)}</div>` : ''}
        ${planos ? `<div class="contrato-meta">Planos: ${escapeHtml(planos)}</div>` : ''}
        ${contrato.valorOrcamento ? `<div class="contrato-valor">${formatarMoeda(contrato.valorOrcamento)}</div>` : ''}
      </div>
    </div>`;
}

function fecharModalContratos() {
    document.getElementById('contratos-modal-overlay').classList.remove('aberto');
}

// ===== PDF =====
function gerarPDF() {

    // Carrega a logo da imagem já presente no DOM e gera o PDF
    const logoImg = document.querySelector('.nav-logo-img');
    const canvas = document.createElement('canvas');
    canvas.width = logoImg.naturalWidth || 512;
    canvas.height = logoImg.naturalHeight || 256;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(logoImg, 0, 0);
    const LOGO_B64 = canvas.toDataURL('image/png');

    if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
        mostrarToast('Biblioteca PDF não carregada. Recarregue a página.', 'erro');
        return;
    }

    const dados = coletarDados();
    if (!dados.cliente) {
        mostrarToast('Informe o nome do cliente antes de gerar o PDF.', 'erro');
        return;
    }

    mostrarToast('Gerando PDF...', '');

    const { jsPDF: JsPDF } = window.jspdf || {};
    const Doc = JsPDF || jsPDF;
    const doc = new Doc({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const numDisplay = document.getElementById('display-numero').textContent;
    const dataFmt = dados.data ? new Date(dados.data + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
    const validFmt = dados.validade ? new Date(dados.validade + 'T12:00:00').toLocaleDateString('pt-BR') : '—';

    const PW = 210;
    const ML = 14;
    const MR = 14;
    const CW = PW - ML - MR;

    // Cores Sanoj
    const C_AZUL_ESC = [13, 33, 64];
    const C_AZUL_MED = [26, 79, 168];
    const C_AZUL_CLA = [59, 143, 232];
    const C_AZUL_BRILHO = [91, 179, 255];
    const C_AZUL_FADE = [230, 240, 252];
    const C_LARANJA = [224, 92, 32];
    const C_BRANCO = [255, 255, 255];
    const C_TEXTO = [13, 26, 46];
    const C_CINZA = [90, 101, 128];
    const C_BORDA = [205, 214, 232];
    const C_ZEBRA = [243, 246, 252];

    let y = 0;

    // ── CABEÇALHO ──
    const HEADER_H = 36;
    doc.setFillColor(...C_AZUL_ESC);
    doc.rect(0, 0, PW, HEADER_H, 'F');

    // Linha de destaque inferior do header
    doc.setFillColor(...C_AZUL_CLA);
    doc.rect(0, HEADER_H - 1.5, PW, 1.5, 'F');

    // Logo imagem (ícone S)
    const LOGO_SIZE = 46;
    const LOGO_X = ML;
    const LOGO_Y = (HEADER_H - LOGO_SIZE) / 2;
    doc.addImage(LOGO_B64, 'PNG', LOGO_X, LOGO_Y, LOGO_SIZE, LOGO_SIZE);

    // Texto "SANOJ SISTEMAS" ao lado da logo
    const TEXT_X = ML + LOGO_SIZE + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...C_BRANCO);
    doc.text('SANOJ ', TEXT_X, 15);
    const sanjW = doc.getTextWidth('SANOJ ');
    doc.setTextColor(...C_AZUL_BRILHO);
    doc.text('SISTEMAS', TEXT_X + sanjW, 15);

    // Subtítulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(160, 185, 220);
    doc.text('DESENVOLVIMENTO DE SISTEMAS · WEBSITES · LANDING PAGES', TEXT_X, 22);

    // Contato
    doc.setFontSize(7);
    doc.setTextColor(160, 185, 220);
    doc.text('47 99906-5181  ·  Joinville - SC', TEXT_X, 28.5);

    // Número do orçamento (direita)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 185, 220);
    doc.text('ORÇAMENTO DE DESENVOLVIMENTO', PW - MR, 13, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...C_AZUL_BRILHO);
    doc.text(numDisplay, PW - MR, 26, { align: 'right' });

    y = HEADER_H;

    // ── DADOS DO CLIENTE ──
    const campos = [
        { label: 'CLIENTE', val: dados.cliente || '' },
        { label: 'TIPO DE PROJETO', val: dados.obra || '' },
        { label: 'LOCAL', val: [dados.endereco, dados.estado].filter(Boolean).join(', ') },
        { label: 'DATA', val: dataFmt !== '—' ? dataFmt : '' },
        { label: 'VÁLIDO ATÉ', val: validFmt !== '—' ? validFmt : '' },
        { label: 'PAGAMENTO', val: Array.isArray(dados.pagamento) && dados.pagamento.length ? dados.pagamento.join(' · ') : '' },
    ].filter(c => c.val && c.val.trim() !== '');

    const campoRows = Math.ceil(campos.length / 3);
    const INFO_H = campoRows <= 1 ? 16 : campoRows * 14 + 4;
    doc.setFillColor(...C_AZUL_FADE);
    doc.rect(0, y, PW, INFO_H, 'F');

    const colW = CW / 3;
    campos.forEach((c, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = ML + col * colW;
        const cy = y + 7 + row * 11;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...C_AZUL_MED);
        doc.text(c.label, cx, cy);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...C_TEXTO);
        doc.text(truncarTexto(doc, c.val, colW - 4), cx, cy + 5);
    });

    y += INFO_H + 4;

    // Prazo (se informado)
    if (dados.prazo) {
        doc.setFillColor(230, 240, 252);
        doc.rect(ML, y, CW, 8, 'F');
        doc.setFillColor(...C_AZUL_MED);
        doc.rect(ML, y, 2.5, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...C_AZUL_MED);
        doc.text('PRAZO DE ENTREGA:', ML + 5, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...C_TEXTO);
        doc.text(dados.prazo, ML + 44, y + 5);
        y += 12;
    }

    // ── TABELA DE ITENS ──
    const COL_DESC = 48;
    const COL_HORAS = 18;
    const COL_TEC = 34;
    const COL_VHORA = 22;
    const COL_VFIXO = 22;
    const COL_TOTAL = 38;
    const ROW_H = 8;

    const cols = [
        { label: 'Módulo / Funcionalidade', w: COL_DESC, align: 'left' },
        { label: 'Horas', w: COL_HORAS, align: 'center' },
        { label: 'Tecnologia', w: COL_TEC, align: 'left' },
        { label: 'R$/Hora', w: COL_VHORA, align: 'right' },
        { label: 'Valor Fixo', w: COL_VFIXO, align: 'right' },
        { label: 'Total (R$)', w: COL_TOTAL, align: 'right' },
    ];

    // Cabeçalho tabela
    doc.setFillColor(...C_AZUL_ESC);
    doc.rect(ML, y, CW, ROW_H, 'F');

    let cx = ML;
    cols.forEach(col => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...C_BRANCO);
        const tx = col.align === 'right' ? cx + col.w - 2
            : col.align === 'center' ? cx + col.w / 2
                : cx + 2;
        doc.text(col.label, tx, y + 5.5, { align: col.align });
        cx += col.w;
    });

    y += ROW_H;

    const linhasFiltradas = dados.linhas.filter(l => l.desc || l.total > 0);

    if (linhasFiltradas.length === 0) {
        doc.setFillColor(...C_ZEBRA);
        doc.rect(ML, y, CW, ROW_H, 'F');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(...C_CINZA);
        doc.text('Nenhum item adicionado', ML + 2, y + 5.5);
        y += ROW_H;
    } else {
        linhasFiltradas.forEach((l, i) => {
            if (y + ROW_H > 270) { doc.addPage(); y = 14; }

            const bg = i % 2 === 0 ? C_ZEBRA : C_BRANCO;
            doc.setFillColor(...bg);
            doc.rect(ML, y, CW, ROW_H, 'F');

            doc.setDrawColor(...C_BORDA);
            doc.setLineWidth(0.2);
            doc.line(ML, y + ROW_H, ML + CW, y + ROW_H);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...C_TEXTO);

            let ccx = ML;

            // DESCRIÇÃO
            doc.text(truncarTexto(doc, l.desc || '-', COL_DESC - 4), ccx + 2, y + 5.5);
            ccx += COL_DESC;

            // HORAS
            doc.text(l.horas ? String(l.horas) + 'h' : '-', ccx + COL_HORAS / 2, y + 5.5, { align: 'center' });
            ccx += COL_HORAS;

            // TECNOLOGIA
            doc.text(truncarTexto(doc, l.tecnologia || '-', COL_TEC - 4), ccx + 2, y + 5.5);
            ccx += COL_TEC;

            // VALOR/HORA
            doc.text(l.valorHora ? formatarMoeda(l.valorHora) : '-', ccx + COL_VHORA - 2, y + 5.5, { align: 'right' });
            ccx += COL_VHORA;

            // VALOR FIXO
            doc.text(l.valorFixo ? formatarMoeda(l.valorFixo) : '-', ccx + COL_VFIXO - 2, y + 5.5, { align: 'right' });
            ccx += COL_VFIXO;

            // TOTAL
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...C_AZUL_ESC);
            doc.text(formatarMoeda(l.total), ccx + COL_TOTAL - 2, y + 5.5, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...C_TEXTO);

            y += ROW_H;
        });
    }

    // Linha separadora
    doc.setDrawColor(...C_AZUL_ESC);
    doc.setLineWidth(0.5);
    doc.line(ML, y, ML + CW, y);
    y += 1;

    const totais = calcularTotais();

    // Subtotal Horas
    if (y + 7 > 270) { doc.addPage(); y = 14; }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C_CINZA);
    doc.text('Subtotal por Hora', ML + CW - 60, y + 6, { align: 'right' });
    doc.setTextColor(...C_TEXTO);
    doc.text(formatarMoeda(totais.subtotalHoras), ML + CW - 2, y + 6, { align: 'right' });
    y += 6;

    // Subtotal Fixo
    doc.setTextColor(...C_CINZA);
    doc.text('Subtotal Valor Fixo', ML + CW - 60, y + 6, { align: 'right' });
    doc.setTextColor(...C_TEXTO);
    doc.text(formatarMoeda(totais.subtotalFixo), ML + CW - 2, y + 6, { align: 'right' });
    y += 8;

    // Desconto
    if (dados.desconto) {
        if (y + 7 > 270) { doc.addPage(); y = 14; }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...C_LARANJA);
        doc.text(`Desconto (${dados.desconto}%)`, ML + CW - 60, y + 6, { align: 'right' });
        doc.text(`- ${formatarMoeda(dados.subtotal * dados.desconto / 100)}`, ML + CW - 2, y + 6, { align: 'right' });
        y += 7;
    }

    // Total Geral
    if (y + 12 > 270) { doc.addPage(); y = 14; }
    doc.setFillColor(...C_AZUL_ESC);
    doc.rect(ML, y, CW, 13, 'F');
    doc.setFillColor(...C_AZUL_CLA);
    doc.rect(ML, y + 11.5, CW, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C_BRANCO);
    doc.text('TOTAL GERAL', ML + CW - 65, y + 8.5, { align: 'right' });
    doc.setFontSize(13);
    doc.setTextColor(...C_AZUL_BRILHO);
    doc.text(formatarMoeda(dados.totalComDesconto), ML + CW - 2, y + 9, { align: 'right' });
    y += 18;

    // ── OBSERVAÇÕES ──
    if (dados.obs && dados.obs.trim()) {
        if (y + 16 > 270) { doc.addPage(); y = 14; }
        const obsLinhas = doc.splitTextToSize(dados.obs.trim(), CW - 8);
        const obsH = Math.max(16, obsLinhas.length * 5 + 12);

        doc.setFillColor(...C_AZUL_FADE);
        doc.rect(ML, y, CW, obsH, 'F');
        doc.setFillColor(...C_AZUL_MED);
        doc.rect(ML, y, 3, obsH, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...C_AZUL_MED);
        doc.text('OBSERVAÇÕES & ESCOPO', ML + 6, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 70, 90);
        doc.text(obsLinhas, ML + 6, y + 12);

        y += obsH + 6;
    }

    // ── RODAPÉ ──
    if (y + 12 > 275) { doc.addPage(); y = 14; }

    doc.setDrawColor(...C_BORDA);
    doc.setLineWidth(0.3);
    doc.line(ML, y, ML + CW, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C_CINZA);
    doc.text('Sanoj Sistemas  ·  47 99906-5181  ·  Joinville - SC', ML, y);
    doc.text(`Orçamento válido até ${validFmt}`, ML + CW, y, { align: 'right' });

    const nomeArq = `Orcamento_Sanoj_${numDisplay.replace('#', '')}_${(dados.cliente || 'cliente').replace(/\s+/g, '_')}.pdf`;
    doc.save(nomeArq);
    mostrarToast('PDF gerado com sucesso!', 'sucesso');
}

// Trunca texto
function truncarTexto(doc, texto, maxW) {
    if (!texto) return '';
    if (doc.getTextWidth(texto) <= maxW) return texto;
    let t = texto;
    while (t.length > 1 && doc.getTextWidth(t + '…') > maxW) {
        t = t.slice(0, -1);
    }
    return t + '…';
}

// ===== UTILITÁRIOS =====
function formatarMoeda(v) {
    return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(texto) {
    return String(texto || '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[ch]));
}

function escapeAttr(texto) {
    return escapeHtml(texto).replace(/`/g, '&#096;');
}

function mostrarToast(msg, tipo = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + tipo;
    t.classList.add('visivel');
    setTimeout(() => t.classList.remove('visivel'), 3200);
}

function abrirModal(titulo, msg, cb) {
    document.getElementById('modal-titulo').textContent = titulo;
    document.getElementById('modal-msg').textContent = msg;
    document.getElementById('modal-confirmar').onclick = () => { cb(); fecharModal(); };
    document.getElementById('modal-overlay').classList.add('aberto');
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('aberto');
}

document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharModal();
});

document.getElementById('lead-modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharModalLead();
});

document.getElementById('contratos-modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharModalContratos();
});
