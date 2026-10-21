/* HABILIDADES (aba "Habilidades")
   CATS: as áreas do filtro (chave, nome, cor).
   SK: uma linha por habilidade: [área, sigla, nome, descrição, nível de 0 a 5, flag de uso pontual]. Para adicionar, copie uma linha. */
var CATS = [
  { k: 'bi', n: 'BI e painéis', c: '#9d6bff' },
  { k: 'dados', n: 'Dados e engenharia', c: '#3fe0f0' },
  { k: 'ia', n: 'Análise e IA', c: '#ff5fb0' },
  { k: 'neg', n: 'Negócio e prática', c: '#ffc857' }
];
var SK = [
  ['bi', 'BI', 'Power BI', 'Dashboards e relatórios interativos', 1, 0],
  ['bi', 'fx', 'DAX', '', 0, 0],
  ['bi', 'Xl', 'Excel', '', 1, 0],
  ['bi', 'Sh', 'Google Sheets', '', 0, 0],
  ['bi', 'Mb', 'Metabase', '', 0, 0],
  ['bi', 'Lk', 'Looker', '', 0, 1],
  ['dados', 'SQL', 'SQL', 'JOINs, subqueries e window functions', 1, 0],
  ['dados', 'Py', 'Python', '', 1, 0],
  ['dados', 'ETL', 'ETL', 'Tratamento e preparação de bases', 0, 0],
  ['dados', 'Se', 'Selenium', '', 0, 0],
  ['dados', 'R', 'R', '', 0, 1],
  ['ia', 'IA', 'Inteligência artificial', '', 0, 0],
  ['ia', 'Pd', 'Pandas e NumPy', 'Tratamento e análise de dados', 0, 0],
  ['ia', 'Sk', 'Scikit-Learn', '', 0, 0],
  ['ia', 'Mp', 'Matplotlib e Seaborn', 'Gráficos em Python', 0, 0],
  ['ia', 'A/B', 'Teste A/B', '', 0, 0],
  ['neg', 'KPI', 'Métricas por área', 'Indicadores de cada área', 1, 0],
  ['neg', 'St', 'Storytelling com dados', 'Resultados claros, com recomendação', 1, 0],
  ['neg', 'Ag', 'Metodologias ágeis', '', 0, 0],
  ['neg', 'Git', 'Versionamento com Git', '', 0, 0],
  ['neg', 'En', 'Inglês', 'Leitura intermediária, conversação básica', 0, 0]
];
