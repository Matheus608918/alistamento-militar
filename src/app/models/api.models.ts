export interface LoginResponse {
  token: string;
}

export interface UsuarioApi {
  id: number;
  nome: string;
  dataNascimento: string;
  email: string;
  telefone: string | null;
  cpf: string;
  nomePai?: string | null;
  nomeMae?: string | null;
  estadoCivil?: string | null;
  uf?: string | null;
  escolaridade?: string | null;
  rg?: string | null;
  localNascimento?: string | null;
  cep?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  paisResidencia?: string | null;
  zonaResidencial?: string | null;
  numeroResidencia?: string | null;
  logradouro?: string | null;
  estado?: string | null;
}

export interface UsuarioRequest {
  nome: string;
  dataNascimento: string;
  email: string;
  senha: string;
  telefone: string | null;
  cpf: string;
  nomePai: string | null;
  nomeMae: string | null;
  estadoCivil: string | null;
  uf: string | null;
  escolaridade: string | null;
  rg: string | null;
  localNascimento: string | null;
  cep: string | null;
  bairro: string | null;
  municipio: string | null;
  paisResidencia: string | null;
  zonaResidencial: string | null;
  numeroResidencia: string | null;
  logradouro: string | null;
  estado: string | null;
}

export interface AdministradorApi {
  id: number;
  nomeAdmin: string;
  emailAdmin: string;
}

export interface MedicoApi {
  id: number;
  nomeMedico: string;
  crm: string;
  especialidade: string | null;
  telefoneMedico: string | null;
  emailMedico: string | null;
}

export interface MedicoRequest {
  nomeMedico: string;
  crm: string;
  especialidade: string;
  telefoneMedico: string;
  emailMedico: string;
  senhaMedico?: string;
}

export interface AlistamentoApi {
  id: number;
  dataAlistamento: string | null;
  status: string | null;
  usuarioResponseDTO: UsuarioApi;
  administradorResponseDTO: AdministradorApi;
}

export interface AlistamentoRequest {
  dataAlistamento?: string;
  status?: string;
  idUsuario?: number;
  idAdministrador?: number;
}

export interface AlistamentoCompletoApi {
  alistamento: AlistamentoApi;
  documentos: DocumentoApi[];
  agendamento: AgendamentoApi | null;
  avaliacaoMedica: AvaliacaoMedicaApi | null;
}

export interface LocalApi {
  id: number;
  nomeUnidade: string;
  enderecoLocal: string;
  cidadeLocal: string;
  estadoLocal: string;
  cepLocal: string;
}

export type LocalRequest = Omit<LocalApi, 'id'>;

export interface TipoDocumentoApi {
  idTipoDocumento: number;
  nomeTipo: string;
  descricao: string | null;
}

export interface TipoDocumentoRequest {
  nomeTipo: string;
  descricao: string | null;
}

export interface DocumentoApi {
  id: number;
  numeroDocumento: string;
  numeroFolha: string | null;
  numeroLivro: string | null;
  dataEmissao: string;
  orgaoEmissor: string;
  cidadeEmissao: string;
  estadoEmissao: string;
  nomeArquivo: string;
  dataEnvio: string;
  usuarioResponseDTO: UsuarioApi;
  alistamentoResponseDTO: AlistamentoApi;
  tipoDocumentoResponseDTO: TipoDocumentoApi;
}

export interface DocumentoRequest {
  numeroDocumento: string;
  numeroFolha: string | null;
  numeroLivro: string | null;
  dataEmissao: string;
  orgaoEmissor: string;
  cidadeEmissao: string;
  estadoEmissao: string;
  nomeArquivo: string;
  dataEnvio: string;
  idUsuario: number;
  idAlistamento: number;
  idTipoDocumento: number;
}

export interface AgendamentoApi {
  id: number;
  dataAgendamento: string;
  horario: string;
  alistamentoResponseDTO: AlistamentoApi;
  localResponseDTO: LocalApi;
  medicoResponseDTO?: MedicoApi | null;
  confirmado?: boolean;
  status?: string;
}

export interface AgendamentoRequest {
  dataAgendamento: string;
  horario: string;
  idAlistamento: number;
  idLocal: number;
  idMedico: number;
}

export type ResultadoAvaliacao = 'Apto' | 'Inapto' | 'Em análise';

export interface AvaliacaoMedicaApi {
  id: number;
  dataAvaliacao: string;
  resultado: string;
  observacoes: string | null;
  alistamentoResponseDTO: AlistamentoApi;
  medicoResponseDTO: MedicoApi;
  localResponseDTO: LocalApi;
}

export interface AvaliacaoMedicaRequest {
  dataAvaliacao: string;
  resultado: ResultadoAvaliacao;
  observacoes: string | null;
  idAlistamento: number;
  idMedico: number;
  idLocal: number;
}