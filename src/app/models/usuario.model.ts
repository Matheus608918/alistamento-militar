import { Documento } from './documento.model';

import { Agendamento } from './agendamento.model';

import { Avaliacao } from './avaliacao.model';

export interface Usuario {

  nome: string;

  cpf: string;

  dataNascimento: string;

  email: string;

  telefone: string;

  senha: string;

  confirmarSenha?: string;

  tipo?: 'cidadao' | 'medico' | 'admin';

  nomeMae?: string;

  nomePai?: string;

  rg?: string;

  localNascimento?: string;

  estadoCivil?: string;

  escolaridade?: string;

  cep?: string;

  logradouro?: string;

  numero?: string;

  bairro?: string;

  municipio?: string;

  uf?: string;

  pais?: string;

  zonaResidencial?: string;

  voluntario?: boolean;

  documentos?: Documento[];

  status?: string;

  resultado?: string;

  dataCadastro?: string;

  agendamento?: Agendamento;

  avaliacao?: Avaliacao;

  senhaProvisoria?: boolean;

}