import { siteConfig } from '@/config/site';

export const legalPages: Record<string, { title: string; eyebrow: string; intro: string; sections: { heading: string; body: string }[] }> = {
  privacidade: {
    title: 'Política de privacidade', eyebrow: 'MINUTA CONFIGURÁVEL · LGPD',
    intro: 'Esta página descreve a estrutura de tratamento de dados do MenteX. Antes da operação comercial, os campos destacados devem ser revisados e preenchidos pela empresa responsável.',
    sections: [
      { heading: 'Dados utilizados', body: 'O teste usa um identificador anônimo de sessão, respostas, tempo por desafio, resultado calculado, estado do pagamento e dados técnicos mínimos de segurança. Não exigimos nome, e-mail ou criação de conta para realizar o teste.' },
      { heading: 'Finalidades', body: 'Os dados são utilizados para manter a sessão, calcular o resultado, validar o desbloqueio, prevenir abuso e permitir a recuperação temporária no mesmo dispositivo. Analytics e publicidade só devem ser ativados mediante consentimento e com IDs reais configurados.' },
      { heading: 'Compartilhamento e retenção', body: `Dados de pagamento são processados pelo provedor configurado; o MenteX não armazena dados de cartão. A configuração inicial prevê retenção do resultado por ${siteConfig.resultRetentionDays} dias. Prazos finais, operadores e transferências internacionais devem ser informados pela empresa responsável.` },
      { heading: 'Direitos e contato', body: `O titular poderá solicitar confirmação, acesso, correção, eliminação e informações sobre o tratamento, conforme aplicável. Canal do encarregado ou responsável: ${siteConfig.supportEmail}.` },
    ],
  },
  termos: {
    title: 'Termos de uso', eyebrow: 'REGRAS DA EXPERIÊNCIA',
    intro: 'Ao utilizar o MenteX, você concorda com estes termos. Esta é uma minuta e precisa de revisão jurídica e dados reais antes do lançamento comercial.',
    sections: [
      { heading: 'Natureza do serviço', body: 'O MenteX oferece jogos recreativos de lógica, memória, atenção e percepção. O resultado descreve o desempenho neste conjunto e não representa diagnóstico, laudo psicológico, avaliação educacional ou teste clínico de QI.' },
      { heading: 'Uso permitido', body: 'Você pode realizar o desafio para fins pessoais e recreativos. Não é permitido tentar acessar resultados de terceiros, interferir na segurança, automatizar respostas abusivamente ou explorar falhas do serviço.' },
      { heading: 'Disponibilidade', body: 'O serviço pode passar por manutenção ou apresentar indisponibilidade temporária. Em caso de falha após cobrança confirmada, o suporte deve oferecer recuperação de acesso ou analisar reembolso conforme a política publicada.' },
      { heading: 'Responsável', body: `Empresa: ${siteConfig.companyName}. Documento: ${siteConfig.companyDocument}. Domínio oficial: ${siteConfig.domain}.` },
    ],
  },
  reembolso: {
    title: 'Pagamento e reembolso', eyebrow: 'PAGAMENTO ÚNICO',
    intro: 'O desbloqueio do relatório é uma compra única. Nenhuma assinatura é criada.',
    sections: [
      { heading: 'Cobrança', body: `O valor configurado é ${siteConfig.priceLabel}, exibido antes do início do checkout. Pix e cartão podem ser disponibilizados pelo provedor escolhido. Enquanto o site estiver em modo de demonstração, nenhuma cobrança real será realizada.` },
      { heading: 'Confirmação', body: 'A liberação ocorre somente após confirmação do provedor recebida e validada no servidor. Estados pendente, recusado e cancelado não liberam o relatório.' },
      { heading: 'Solicitação de reembolso', body: `Pedidos devem ser enviados para ${siteConfig.supportEmail}, com as informações mínimas que permitam localizar a transação. Prazos, hipóteses e procedimento final devem ser revisados para a operação, o produto digital e a legislação aplicável.` },
      { heading: 'Falhas de acesso', body: 'Se o pagamento for aprovado e o resultado não abrir, não refaça a compra. Procure o suporte para recuperação ou análise do reembolso.' },
    ],
  },
  'aviso-recreativo': {
    title: 'Aviso sobre a natureza recreativa', eyebrow: 'LEIA ANTES DE INTERPRETAR',
    intro: 'O MenteX foi desenhado como entretenimento e auto-observação, não como instrumento clínico.',
    sections: [
      { heading: 'O que o resultado indica', body: 'A pontuação mostra como suas respostas se distribuíram neste conjunto específico de desafios, considerando acertos, dificuldade, categoria e tempo como fator secundário.' },
      { heading: 'O que o resultado não indica', body: 'O índice não é QI certificado, diagnóstico cognitivo, parecer psicológico, medida de capacidade profissional ou previsão acadêmica. Fatores como sono, distração, familiaridade e dispositivo podem influenciar o desempenho.' },
      { heading: 'Quando buscar avaliação profissional', body: 'Se você precisa de uma avaliação válida para fins clínicos, educacionais ou profissionais, procure um profissional habilitado e instrumentos padronizados adequados à finalidade.' },
    ],
  },
  suporte: {
    title: 'Contato e suporte', eyebrow: 'AJUDA COM ACESSO OU PAGAMENTO',
    intro: 'Use este canal para dúvidas, recuperação de resultado, privacidade e solicitações relacionadas ao pagamento.',
    sections: [
      { heading: 'Canal principal', body: `E-mail: ${siteConfig.supportEmail}.` },
      { heading: 'Para agilizar', body: 'Informe o horário aproximado do teste, o método de pagamento e o identificador da transação, quando disponível. Nunca envie número completo do cartão, senha ou código de segurança.' },
      { heading: 'Prazo de resposta', body: 'CONFIGURAR_PRAZO_REAL_DE_ATENDIMENTO antes da publicação comercial.' },
    ],
  },
};
