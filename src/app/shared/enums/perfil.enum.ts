export enum Perfil {
  CIDADAO = 'cidadao',
  MEDICO = 'medico',
  ADMIN = 'admin'
}

export enum StatusAlistamento {
  CADASTRO_INCOMPLETO = 'Cadastro incompleto',
  AGUARDANDO_DOCUMENTOS = 'Aguardando documentos',
  EM_ANALISE = 'Em análise',
  DOCUMENTOS_APROVADOS = 'Documentos aprovados',
  AVALIACAO_AGENDADA = 'Avaliação médica agendada',
  AVALIACAO_CONCLUIDA = 'Avaliação médica concluída',
  APROVADO = 'Aprovado',
  REPROVADO = 'Reprovado'
}

export enum StatusDocumento {
  EM_ANALISE = 'Em análise',
  APROVADO = 'Aprovado',
  REPROVADO = 'Reprovado'
}