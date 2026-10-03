/* =========================
       CONFIGURAÇÕES
    ========================= */

    const STORAGE_KEY = "crianca-feliz-lista";

    let dados = [];

    /* =========================
       ELEMENTOS DO DOM
    ========================= */

    const nomeInput = document.getElementById("nome");
    const nascimentoInput = document.getElementById("nasc");
    const erroElement = document.getElementById("err");
    const botaoAdicionar = document.getElementById("btn");
    const listaElement = document.getElementById("lista");
    const contadorElement = document.getElementById("count");

    /* =========================
       LOCAL STORAGE
    ========================= */

    function carregarDados() {
      try {
        const dadosSalvos = localStorage.getItem(STORAGE_KEY);

        dados = dadosSalvos
          ? JSON.parse(dadosSalvos)
          : [];

        if (!Array.isArray(dados)) {
          dados = [];
        }

      } catch (erro) {
        dados = [];
      }
    }

    function salvarDados() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(dados)
        );

      } catch (erro) {
        // O armazenamento pode estar indisponível.
      }
    }

    /* =========================
       CÁLCULO DA IDADE
    ========================= */

    function calcularMeses(dataNascimento) {
      const partes = dataNascimento.split("-");
      const hoje = new Date();

      const anoNascimento = Number(partes[0]);
      const mesNascimento = Number(partes[1]);
      const diaNascimento = Number(partes[2]);

      let meses =
        (hoje.getFullYear() - anoNascimento) * 12 +
        (hoje.getMonth() + 1 - mesNascimento);

      if (hoje.getDate() < diaNascimento) {
        meses--;
      }

      return Math.max(meses, 0);
    }

    function formatarIdade(meses) {
      const anos = Math.floor(meses / 12);
      const mesesRestantes = meses % 12;

      const resultado = [];

      if (anos > 0) {
        resultado.push(
          anos + (anos === 1 ? " ano" : " anos")
        );
      }

      if (mesesRestantes > 0 || anos === 0) {
        resultado.push(
          mesesRestantes +
          (mesesRestantes === 1 ? " mês" : " meses")
        );
      }

      return resultado.join(" e ");
    }

    /* =========================
       FAIXA ETÁRIA
    ========================= */

    function obterFaixaEtaria(meses) {
      if (meses <= 36) {
        return "Visita semanal (0 a 36 meses)";
      }

      if (meses <= 72) {
        return "Visita mensal (37 a 72 meses)";
      }

      return "Acima de 6 anos";
    }

    /* =========================
       FORMATAÇÃO
    ========================= */

    function formatarData(data) {
      const partes = data.split("-");

      return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
      );
    }

    /* =========================
       SEGURANÇA
    ========================= */

    function escaparHTML(texto) {
      const elemento = document.createElement("div");

      elemento.textContent = texto;

      return elemento.innerHTML;
    }

    /* =========================
       RENDERIZAÇÃO DA LISTA
    ========================= */

    function renderizarLista() {
      contadorElement.textContent = dados.length;

      if (dados.length === 0) {
        listaElement.innerHTML = `
          <div class="empty">
            Nenhuma criança cadastrada ainda.
          </div>
        `;

        return;
      }

      const listaOrdenada = [...dados].sort(
        (a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt-BR"
          )
      );

      listaElement.innerHTML = listaOrdenada
        .map((crianca) => {

          const meses = calcularMeses(
            crianca.nasc
          );

          const idade = formatarIdade(meses);

          const faixa = obterFaixaEtaria(meses);

          const nascimento = formatarData(
            crianca.nasc
          );

          return `
            <div class="item">

              <div class="av">
                👶
              </div>

              <div class="info">

                <div class="nm">
                  ${escaparHTML(crianca.nome)}
                </div>

                <div class="sub">
                  ${idade}
                  • nasc. ${nascimento}
                </div>

                <span class="tag">
                  ${faixa}
                </span>

              </div>

              <button
                class="del"
                type="button"
                data-id="${crianca.id}"
                aria-label="Remover ${escaparHTML(crianca.nome)}"
              >
                🗑️
              </button>

            </div>
          `;
        })
        .join("");
    }

    /* =========================
       VALIDAÇÃO
    ========================= */

    function validarFormulario(nome, nascimento) {
      erroElement.textContent = "";

      if (!nome) {
        erroElement.textContent =
          "Informe o nome da criança.";

        return false;
      }

      if (!nascimento) {
        erroElement.textContent =
          "Informe a data de nascimento.";

        return false;
      }

      const hoje = new Date()
        .toISOString()
        .slice(0, 10);

      if (nascimento > hoje) {
        erroElement.textContent =
          "A data não pode ser no futuro.";

        return false;
      }

      return true;
    }

    /* =========================
       ADICIONAR CRIANÇA
    ========================= */

    function adicionarCrianca() {
      const nome = nomeInput.value.trim();
      const nascimento = nascimentoInput.value;

      if (
        !validarFormulario(
          nome,
          nascimento
        )
      ) {
        return;
      }

      const novaCrianca = {
        id:
          Date.now() +
          "" +
          Math.floor(
            Math.random() * 1000
          ),

        nome: nome,
        nasc: nascimento
      };

      dados.push(novaCrianca);

      salvarDados();

      nomeInput.value = "";
      nascimentoInput.value = "";

      renderizarLista();

      nomeInput.focus();
    }

    /* =========================
       REMOVER CRIANÇA
    ========================= */

    function removerCrianca(id) {
      const crianca = dados.find(
        (item) => item.id === id
      );

      if (!crianca) {
        return;
      }

      const confirmou = confirm(
        "Remover esta criança da lista?"
      );

      if (!confirmou) {
        return;
      }

      dados = dados.filter(
        (item) => item.id !== id
      );

      salvarDados();

      renderizarLista();
    }

    /* =========================
       EVENTOS
    ========================= */

    botaoAdicionar.addEventListener(
      "click",
      adicionarCrianca
    );

    listaElement.addEventListener(
      "click",
      (evento) => {

        const botao =
          evento.target.closest(".del");

        if (!botao) {
          return;
        }

        const id = botao.dataset.id;

        removerCrianca(id);
      }
    );

    /* Permite adicionar pressionando Enter */
    nomeInput.addEventListener(
      "keydown",
      (evento) => {

        if (evento.key === "Enter") {
          adicionarCrianca();
        }
      }
    );

    nascimentoInput.addEventListener(
      "keydown",
      (evento) => {

        if (evento.key === "Enter") {
          adicionarCrianca();
        }
      }
    );

    /* =========================
       INICIALIZAÇÃO
    ========================= */

    carregarDados();
    renderizarLista();