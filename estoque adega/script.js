// Dados iniciais baseados no PDF[cite: 1]
let estoque = JSON.parse(localStorage.getItem('adega_estoque')) || [
    { nome: "Vinho de mesa tinto seco 3L", qtd: 3, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa tinto suave 3L", qtd: 7, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa branco seco 3L", qtd: 2, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa branco suave 3L", qtd: 2, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa tinto 750 ml", qtd: 5, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa rosado seco 1,47L", qtd: 1, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa tinto suave 2L", qtd: 10, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa tinto seco 2L", qtd: 5, custo: 0, nota: "S/N" },
    { nome: "Cooler morango 2L", qtd: 3, custo: 0, nota: "S/N" },
    { nome: "Suco de uva integral 950 ml", qtd: 2, custo: 0, nota: "S/N" },
    { nome: "Vinho fino tinto seco (cabernet sauvignon) 3L", qtd: 2, custo: 0, nota: "S/N" },
    { nome: "Vinho fino tinto seco (merlot) 3L", qtd: 1, custo: 0, nota: "S/N" },
    { nome: "Suco de uva tinto integral 3L", qtd: 1, custo: 0, nota: "S/N" },
    { nome: "Vinho fino branco seco 750 ml (moscato gialo)", qtd: 2, custo: 0, nota: "S/N" },
    { nome: "Suco de uva integral 1,5 L", qtd: 4, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa tinto suave 4,5 L", qtd: 1, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa tinto seco 4,5 L", qtd: 2, custo: 0, nota: "S/N" },
    { nome: "Vinho de mesa tinto seco bordo 4,5 L", qtd: 2, custo: 0, nota: "S/N" },
    { nome: "Cooler de pêssego 4,55 L", qtd: 5, custo: 0, nota: "S/N" },
    { nome: "Cooler de morango 4,55 L", qtd: 4, custo: 0, nota: "S/N" },
    { nome: "Suco de uva tinto integral 4,5 L", qtd: 1, custo: 0, nota: "S/N" }
];

let vendas = JSON.parse(localStorage.getItem('adega_vendas')) || [];
let editandoIndex = null;

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    renderizarEstoque();
    renderizarVendas();
    calcularLiquidez();
}

function renderizarEstoque() {
    const lista = document.getElementById('lista-estoque');
    const datalist = document.getElementById('produtos-existentes');
    lista.innerHTML = "";
    datalist.innerHTML = "";
    estoque.forEach((item, index) => {
        lista.innerHTML += `<tr><td>${item.nome}</td><td>${item.qtd}</td><td>R$ ${item.custo.toFixed(2)}</td><td>${item.nota}</td>
            <td><button class="btn-edit" onclick="prepararEdicao(${index})">Editar</button><button class="btn-del" onclick="removerItem(${index})">X</button></td></tr>`;
        datalist.innerHTML += `<option value="${item.nome}">`;
    });
    atualizarSelectVendas();
}

function prepararEdicao(index) {
    editandoIndex = index;
    const item = estoque[index];
    document.getElementById('est-nome').value = item.nome;
    document.getElementById('est-qtd').value = item.qtd;
    document.getElementById('est-custo').value = item.custo;
    document.getElementById('est-nota').value = item.nota;
    document.getElementById('btn-estoque-main').innerText = "Salvar Alterações";
}

function adicionarOuEditarEstoque(e) {
    e.preventDefault();
    const nome = document.getElementById('est-nome').value;
    const qtd = parseInt(document.getElementById('est-qtd').value);
    const custo = parseFloat(document.getElementById('est-custo').value);
    const nota = document.getElementById('est-nota').value;

    if (editandoIndex !== null) {
        estoque[editandoIndex] = { nome, qtd, custo, nota };
        editandoIndex = null;
        document.getElementById('btn-estoque-main').innerText = "Adicionar ao Estoque";
    } else {
        const existente = estoque.find(i => i.nome.toLowerCase() === nome.toLowerCase());
        if (existente) { existente.qtd += qtd; existente.custo = custo; existente.nota = nota; }
        else { estoque.push({ nome, qtd, custo, nota }); }
    }
    salvarESincronizar();
    e.target.reset();
}

function cadastrarVenda(e) {
    e.preventDefault();
    const idx = document.getElementById('venda-produto').value;
    const qtd = parseInt(document.getElementById('venda-qtd').value);
    const preco = parseFloat(document.getElementById('venda-preco').value);
    const data = document.getElementById('venda-data').value;

    if (estoque[idx].qtd >= qtd) {
        vendas.push({ data, produto: estoque[idx].nome, quantidade: qtd, custoTotal: estoque[idx].custo * qtd, vendaTotal: preco * qtd, cliente: document.getElementById('venda-cliente').value });
        estoque[idx].qtd -= qtd;
        salvarESincronizar();
        e.target.reset();
    } else { alert("Estoque insuficiente!"); }
}

function calcularLiquidez() {
    const filtro = document.getElementById('filtro-data-liquidez').value;
    let c = 0, v = 0;
    vendas.filter(venda => !filtro || venda.data.startsWith(filtro)).forEach(venda => { c += venda.custoTotal; v += venda.vendaTotal; });
    document.getElementById('liq-investido').innerText = `R$ ${c.toFixed(2)}`;
    document.getElementById('liq-bruto').innerText = `R$ ${v.toFixed(2)}`;
    document.getElementById('liq-lucro').innerText = `R$ ${(v - c).toFixed(2)}`;
}

function limparFiltroLiquidez() { document.getElementById('filtro-data-liquidez').value = ""; calcularLiquidez(); }
function atualizarSelectVendas() {
    const s = document.getElementById('venda-produto');
    s.innerHTML = '<option value="">Selecione o Vinho</option>';
    estoque.forEach((item, index) => s.innerHTML += `<option value="${index}">${item.nome} (${item.qtd} un)</option>`);
}
function renderizarVendas() {
    const l = document.getElementById('lista-vendas'); l.innerHTML = "";
    vendas.forEach(v => l.innerHTML += `<tr><td>${v.data}</td><td>${v.produto}</td><td>${v.quantidade}</td><td>${v.cliente}</td><td>R$ ${v.vendaTotal.toFixed(2)}</td></tr>`);
}
function removerItem(i) { if(confirm("Excluir?")) { estoque.splice(i, 1); salvarESincronizar(); } }
function salvarESincronizar() {
    localStorage.setItem('adega_estoque', JSON.stringify(estoque));
    localStorage.setItem('adega_vendas', JSON.stringify(vendas));
    renderizarEstoque(); renderizarVendas(); calcularLiquidez();
}
window.onload = () => showTab('estoque');