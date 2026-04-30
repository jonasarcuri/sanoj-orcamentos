// ===== ESTADO =====
let linhaId = 0;
let orcamentoEditandoId = null;
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
    atualizarNumeroDisplay();
});

// ===== ABAS =====
function mudarAba(aba, btn) {
    document.querySelectorAll('.aba').forEach(a => a.classList.remove('ativo'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('ativo'));
    document.getElementById('aba-' + aba).classList.add('ativo');
    btn.classList.add('ativo');
    if (aba === 'historico') renderizarHistorico();
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
        pagamento: document.getElementById('campo-pagamento').value,
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
        hist.push({ ...dados, id: Date.now(), numero: num, savedAt: new Date().toISOString(), revisao: null, revisoes: [] });
    }

    setHistorico(hist);
    mostrarToast('Orçamento salvo com sucesso!', 'sucesso');
    orcamentoEditandoId = null;
    document.getElementById('display-rev').innerHTML = '';
    atualizarNumeroDisplay();
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
    document.getElementById('campo-cliente').value = '';
    document.getElementById('campo-obra').value = '';
    document.getElementById('campo-endereco').value = '';
    document.getElementById('campo-estado').value = '';
    document.getElementById('campo-prazo').value = '';
    document.getElementById('campo-pagamento').value = '';
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
    document.getElementById('campo-pagamento').value = orc.pagamento || '';
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
    const INFO_H = 28;
    doc.setFillColor(...C_AZUL_FADE);
    doc.rect(0, y, PW, INFO_H, 'F');

    const campos = [
        { label: 'CLIENTE', val: dados.cliente || '—' },
        { label: 'TIPO DE PROJETO', val: dados.obra || '—' },
        { label: 'LOCAL', val: [dados.endereco, dados.estado].filter(Boolean).join(', ') || '—' },
        { label: 'DATA', val: dataFmt },
        { label: 'VÁLIDO ATÉ', val: validFmt },
        { label: 'PAGAMENTO', val: dados.pagamento || '—' },
    ];

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
