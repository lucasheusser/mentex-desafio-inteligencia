export type SkillCategory =
  | 'Lógica numérica'
  | 'Padrões visuais'
  | 'Raciocínio espacial'
  | 'Lógica verbal'
  | 'Memória'
  | 'Atenção';

export type ChallengeQuestion = {
  id: string;
  category: SkillCategory;
  instruction: string;
  prompt: string;
  helper?: string;
  options: { id: string; label: string }[];
  answer: string;
  difficulty: 1 | 2 | 3;
  expectedMs: number;
  display?: 'sequence' | 'matrix' | 'memory' | 'symbols' | 'plain';
};

export const questions: ChallengeQuestion[] = [
  {
    id: 'seq-01', category: 'Lógica numérica', instruction: 'Complete a sequência',
    prompt: '2 · 6 · 12 · 20 · 30 · ?', options: ['36','40','42','44'].map((label, i) => ({ id: String(i), label })),
    answer: '2', difficulty: 1, expectedMs: 18000, display: 'sequence',
  },
  {
    id: 'pat-01', category: 'Padrões visuais', instruction: 'Escolha o próximo símbolo',
    prompt: '◆  ◇  ◆  ◇  ◆  ?', options: ['◆','◇','●','△'].map((label, i) => ({ id: String(i), label })),
    answer: '1', difficulty: 1, expectedMs: 12000, display: 'symbols',
  },
  {
    id: 'spa-01', category: 'Raciocínio espacial', instruction: 'Continue a rotação',
    prompt: '↗  →  ↘  ↓  ?', options: ['↙','←','↖','↑'].map((label, i) => ({ id: String(i), label })),
    answer: '0', difficulty: 1, expectedMs: 15000, display: 'symbols',
  },
  {
    id: 'mat-01', category: 'Lógica numérica', instruction: 'Complete a matriz',
    prompt: '2  4  8\n3  6  12\n5  10  ?', options: ['15','18','20','25'].map((label, i) => ({ id: String(i), label })),
    answer: '2', difficulty: 2, expectedMs: 26000, display: 'matrix',
  },
  {
    id: 'ver-01', category: 'Lógica verbal', instruction: 'Complete a relação',
    prompt: 'Capítulo está para livro como cena está para…', options: ['roteiro','filme','ator','câmera'].map((label, i) => ({ id: String(i), label })),
    answer: '1', difficulty: 1, expectedMs: 18000, display: 'plain',
  },
  {
    id: 'mem-01', category: 'Memória', instruction: 'Recupere a sequência',
    prompt: 'AZUL · 7 · LUA · 3', helper: 'Qual era o terceiro item?', options: ['7','LUA','AZUL','3'].map((label, i) => ({ id: String(i), label })),
    answer: '1', difficulty: 1, expectedMs: 14000, display: 'memory',
  },
  {
    id: 'att-01', category: 'Atenção', instruction: 'Conte com precisão',
    prompt: 'ABRACADABRA', helper: 'Quantas vezes a letra A aparece?', options: ['4','5','6','7'].map((label, i) => ({ id: String(i), label })),
    answer: '1', difficulty: 1, expectedMs: 16000, display: 'sequence',
  },
  {
    id: 'odd-01', category: 'Padrões visuais', instruction: 'Encontre o elemento diferente',
    prompt: '○  ○  ◉  ○', options: ['1º','2º','3º','4º'].map((label, i) => ({ id: String(i), label })),
    answer: '2', difficulty: 1, expectedMs: 10000, display: 'symbols',
  },
  {
    id: 'seq-02', category: 'Lógica verbal', instruction: 'Complete a progressão',
    prompt: 'A · C · F · J · O · ?', options: ['T','U','V','W'].map((label, i) => ({ id: String(i), label })),
    answer: '1', difficulty: 2, expectedMs: 24000, display: 'sequence',
  },
  {
    id: 'seq-03', category: 'Lógica numérica', instruction: 'Encontre o próximo número',
    prompt: '1 · 1 · 2 · 3 · 5 · ?', options: ['6','7','8','10'].map((label, i) => ({ id: String(i), label })),
    answer: '2', difficulty: 1, expectedMs: 14000, display: 'sequence',
  },
  {
    id: 'spa-02', category: 'Raciocínio espacial', instruction: 'Gire mentalmente 90° à direita',
    prompt: '↑  →  ↓  ?', options: ['↗','←','↙','↑'].map((label, i) => ({ id: String(i), label })),
    answer: '1', difficulty: 2, expectedMs: 17000, display: 'symbols',
  },
  {
    id: 'ver-02', category: 'Lógica verbal', instruction: 'Complete a analogia',
    prompt: 'Peixe está para cardume como lobo está para…', options: ['rebanho','matilha','alcateia','colmeia'].map((label, i) => ({ id: String(i), label })),
    answer: '2', difficulty: 2, expectedMs: 20000, display: 'plain',
  },
  {
    id: 'mem-02', category: 'Memória', instruction: 'Inverta a ordem mentalmente',
    prompt: '4 · 9 · 2 · 7', helper: 'Qual sequência está na ordem inversa?', options: ['7 · 2 · 9 · 4','7 · 9 · 2 · 4','4 · 2 · 9 · 7','2 · 7 · 9 · 4'].map((label, i) => ({ id: String(i), label })),
    answer: '0', difficulty: 2, expectedMs: 22000, display: 'memory',
  },
  {
    id: 'att-02', category: 'Atenção', instruction: 'Compare os quatro grupos',
    prompt: 'Qual grupo tem os dois códigos exatamente iguais?', options: ['K8R2 / KBR2','M41Q / M41Q','7LP9 / 7L9P','TX33 / TK33'].map((label, i) => ({ id: String(i), label })),
    answer: '1', difficulty: 2, expectedMs: 18000, display: 'plain',
  },
  {
    id: 'odd-02', category: 'Lógica numérica', instruction: 'Identifique o número fora do grupo',
    prompt: 'Todos, exceto um, são números primos.', options: ['11','17','21','29'].map((label, i) => ({ id: String(i), label })),
    answer: '2', difficulty: 3, expectedMs: 24000, display: 'sequence',
  },
];

export const publicQuestions = questions.map(({ answer: _answer, ...question }) => question);
