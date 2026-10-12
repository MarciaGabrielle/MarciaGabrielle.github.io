/* PROJETOS (aba "Projetos")
   Para adicionar um projeto: copie um bloco { ... } abaixo, cole no lugar desejado e troque os campos.
   - t: título | cat: 'tre' ou 'pessoal' (define o filtro) | tag: selo que aparece no card
   - ph: desenho usado enquanto não há captura ('bars', 'line' ou 'donut')
   - imgs: lista de capturas { src: 'img/arquivo.jpg', cap: 'legenda' }; thumb: qual captura vira miniatura (0 = a primeira)
   - p: descrição | res: resultado (opcional) | hl: destaque (opcional) | link: botão "Abrir painel interativo" (opcional)
   - tools: ferramentas usadas | story: true abre a janela "Sobre o projeto" (hoje só no Casos de AVC)
   - list: em vez de capturas, mostra uma lista de resumos (usado em "Outros painéis do TRE-RR")
   As imagens ficam na pasta img/. */
var AVC_LINK = 'https://app.powerbi.com/view?r=eyJrIjoiODE1NTNlMTEtMzk2Yi00MTM3LWI5NzEtMDdhOWRiODZhNjdiIiwidCI6IjBlMmRhOGZjLTFmZDYtNGQ0NC05MGU0LTM1M2I4OWVhY2ZhOSJ9';
/* img: caminho da captura de tela (ex.: 'img/avc.jpg'). Sem img, aparece um espaço reservado. */
var PROJ = [
  { t: 'Casos de AVC', cat: 'pessoal', tag: 'Pessoal', ph: 'donut', thumb: 1, link: AVC_LINK,
    imgs: [
      { src: 'img/avc-1.jpg', cap: 'Capa do painel' },
      { src: 'img/avc-2.jpg', cap: 'Visão geral' },
      { src: 'img/avc-3.jpg', cap: 'Insights: fatores de risco' },
      { src: 'img/avc-4.jpg', cap: 'Modelo de IA: importância das variáveis' },
      { src: 'img/avc-5.jpg', cap: 'Predição: formulário e resultado' }
    ],
    p: 'Painel do curso Data Science Aplicado à Saúde, com dados públicos sobre AVC: visão geral, análises demográficas, fatores de risco e um módulo de predição com machine learning.',
    story: true, tools: ['Power BI', 'Machine learning'], hl: '1º lugar entre os trabalhos finais do curso, feito em dupla.' },
  { t: 'Gestão de Comissões e Comitês', cat: 'tre', tag: 'TRE-RR', ph: 'bars', thumb: 1,
    imgs: [
      { src: 'img/comissoes-1.jpg', cap: 'Capa do painel' },
      { src: 'img/comissoes-2.jpg', cap: 'Visão geral' },
      { src: 'img/comissoes-3.jpg', cap: 'Detalhamento: tabela de colegiados' },
      { src: 'img/comissoes-4.jpg', cap: 'Detalhamento: pesquisa por colegiado' },
      { src: 'img/comissoes-5.jpg', cap: 'Detalhamento: pesquisa por nome' }
    ],
    res: 'Comissões, comitês e seus membros ficavam espalhados pelo SEI, e era difícil saber quantos existiam e quem participava de cada um. Agora tudo está reunido em um só lugar, com pesquisa por nome e o link da portaria atualizada.',
    p: 'Solução de BI para mapear a estrutura de trabalho do tribunal: composição de comissões permanentes e provisórias, pesquisa automatizada por nome de membros e acesso aos atos publicados no Diário da Justiça Eletrônico.',
    tools: ['Power BI'] },
  { t: 'Sustentabilidade', cat: 'tre', tag: 'TRE-RR', ph: 'line', thumb: 0,
    imgs: [
      { src: 'img/sust-1.jpg', cap: 'Papel: consumo e gasto por mês' },
      { src: 'img/sust-2.jpg', cap: 'Energia' },
      { src: 'img/sust-3.jpg', cap: 'Água e esgoto' },
      { src: 'img/sust-4.jpg', cap: 'Copos descartáveis' },
      { src: 'img/sust-5.jpg', cap: 'Painel de navegação entre os temas' }
    ],
    res: 'Os números ficavam em planilhas espalhadas. Agora a comissão de sustentabilidade acompanha os indicadores de forma clara e visual, e a chefia ganhou uma noção rápida do cenário.',
    p: 'Monitoramento estratégico de gastos com papel, energia e água no TRE-RR, com análise de tendências mensais e anuais.',
    tools: ['Power BI'] },
  { t: 'TRE em Números', cat: 'tre', tag: 'TRE-RR', ph: 'line', thumb: 0,
    imgs: [
      { src: 'img/valor-1.jpg', cap: 'Recursos físicos' },
      { src: 'img/valor-2.jpg', cap: 'Recursos financeiros' },
      { src: 'img/valor-3.jpg', cap: 'Recursos humanos' }
    ],
    res: 'Cada setor preenchia a sua própria planilha. Com o painel, as informações ficaram reunidas em um só lugar, o que facilita o controle.',
    p: 'Painel interativo com séries históricas de recursos físicos, financeiros e humanos, para apoiar a gestão.',
    tools: ['Power BI'] },
  { t: 'Outros painéis do TRE-RR', cat: 'tre', tag: 'TRE-RR', ph: 'bars', img: null,
    p: 'Outros painéis que desenvolvi no tribunal. Por conterem informações restritas, aqui ficam só os resumos.',
    tools: ['Power BI'],
    list: [
      { t: 'MPM', d: 'Monitoramento demográfico e funcional de magistrados e servidores, para garantir a conformidade com a Resolução CNJ nº 587.' },
      { t: 'Valor em Números', d: 'Indicadores de atendimento ao eleitor, produtividade processual e alcance em mídias sociais.' },
      { t: 'Processos Tramitando', d: 'Tramitação de processos de 1º e 2º graus: volume por zona eleitoral, movimentações recentes, pendências e controle de prazos.' },
      { t: 'Indicadores Estratégicos', d: 'Acompanhamento de 26 indicadores ligados aos macrodesafios do tribunal, como produtividade, acessibilidade e transparência, com comparação às metas de 2024.' }
    ] }
];
