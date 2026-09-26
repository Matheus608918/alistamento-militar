import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import {
  AgendamentoApi,
  AlistamentoApi,
  AlistamentoCompletoApi,
  AvaliacaoMedicaApi,
  DocumentoApi,
  UsuarioApi
} from '../models/api.models';
import { StatusAlistamento, StatusDocumento } from '../shared/enums/perfil.enum';
import { formatarData, formatarHora, hojeIso } from '../shared/utils/formatadores';

export interface Processo {
  usuario: UsuarioApi;
  alistamento: AlistamentoApi | null;
  documentos: DocumentoApi[];
  agendamento: AgendamentoApi | null;
  avaliacao: AvaliacaoMedicaApi | null;
  status: string;
}

export interface DocumentoView {
  id: number;
  tipo: string;
  nomeArquivo: string;
  dataEnvio: string;
  status: string;
}

export interface AgendamentoView {
  id: number;
  data: string;
  horario: string;
  local: string;
  endereco: string;
  medico: string;
  status: string;
}

export interface AvaliacaoView {
  data: string;
  resultado: string;
  observacoes: string;
  medico: string;
}

export interface CidadaoView {
  processo: Processo;
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  rg: string;
  nomeMae: string;
  nomePai: string;
  localNascimento: string;
  estadoCivil: string;
  escolaridade: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  pais: string;
  zonaResidencial: string;
  status: string;
  dataCadastro: string;
  documentos: DocumentoView[];
  agendamento: AgendamentoView | null;
  avaliacao: AvaliacaoView | null;
}

const STATUS_ENVIO_DOCUMENTOS: string[] = [
  StatusAlistamento.CADASTRO_INCOMPLETO,
  StatusAlistamento.AGUARDANDO_DOCUMENTOS,
  StatusAlistamento.EM_ANALISE,
  StatusAlistamento.DOCUMENTOS_REPROVADOS
];

@Injectable({ providedIn: 'root' })
export class ProcessoService {

  private api = inject(ApiService);

  async carregarTodos(): Promise<Processo[]> {

    const [usuarios, alistamentos, documentos, agendamentos, avaliacoes] = await Promise.all([
      this.api.listarUsuarios(),
      this.api.listarAlistamentos(),
      this.api.listarDocumentos(),
      this.api.listarAgendamentos(),
      this.api.listarAvaliacoes()
    ]);

    return usuarios.map(usuario => {

      const alistamento =
        alistamentos.find(a => a.usuarioResponseDTO?.id === usuario.id) ?? null;

      const idAlistamento = alistamento?.id ?? -1;

      return this.montar(
        usuario,
        alistamento,
        documentos.filter(d => d.alistamentoResponseDTO?.id === idAlistamento),
        agendamentos.find(a => a.alistamentoResponseDTO?.id === idAlistamento) ?? null,
        avaliacoes.find(a => a.alistamentoResponseDTO?.id === idAlistamento) ?? null
      );

    });

  }

  async carregarDoUsuario(idUsuario: number): Promise<Processo> {

    const usuario = await this.api.buscarUsuario(idUsuario);
    const alistamento = await this.api.buscarAlistamentoDoUsuario(idUsuario);

    if (!alistamento) {
      return this.montar(usuario, null, [], null, null);
    }

    const completo = await this.api.buscarAlistamentoCompleto(alistamento.id);

    return this.montarDoCompleto(completo, usuario);

  }

  async carregarPorAlistamento(idAlistamento: number): Promise<Processo> {

    const processos = await this.carregarTodos();

    const processo = processos.find(p => p.alistamento?.id === idAlistamento);

    if (!processo) {
      throw new Error('Alistamento não encontrado.');
    }

    return processo;

  }

  async garantirAlistamento(idUsuario: number): Promise<AlistamentoApi> {

    const existente = await this.api.buscarAlistamentoDoUsuario(idUsuario);

    if (existente) {
      return existente;
    }

    const administradores = await this.api.listarAdministradores();

    if (administradores.length === 0) {
      throw new Error('Nenhum administrador cadastrado no sistema. O alistamento não pôde ser aberto.');
    }

    return this.api.criarAlistamento({
      dataAlistamento: hojeIso(),
      status: StatusAlistamento.AGUARDANDO_DOCUMENTOS,
      idUsuario,
      idAdministrador: administradores[0].id
    });

  }

  async atualizarStatus(idAlistamento: number, status: string, idAdministrador?: number): Promise<void> {

    await this.api.atualizarAlistamentoParcial(idAlistamento, {
      status,
      ...(idAdministrador ? { idAdministrador } : {})
    });

  }

  async excluirCidadao(processo: Processo): Promise<void> {

    if (processo.avaliacao) {
      await this.api.excluirAvaliacao(processo.avaliacao.id);
    }

    if (processo.agendamento) {
      await this.api.excluirAgendamento(processo.agendamento.id);
    }

    for (const documento of processo.documentos) {
      await this.api.excluirDocumento(documento.id);
    }

    if (processo.alistamento) {
      await this.api.excluirAlistamento(processo.alistamento.id);
    }

    await this.api.excluirUsuario(processo.usuario.id);

  }

  statusDocumentos(processo: Processo): string {

    switch (processo.status) {

      case StatusAlistamento.DOCUMENTOS_REPROVADOS:
        return StatusDocumento.REPROVADO;

      case StatusAlistamento.DOCUMENTOS_APROVADOS:
      case StatusAlistamento.AVALIACAO_AGENDADA:
      case StatusAlistamento.AVALIACAO_CONCLUIDA:
      case StatusAlistamento.APROVADO:
      case StatusAlistamento.REPROVADO:
        return StatusDocumento.APROVADO;

      default:
        return processo.documentos.length > 0
          ? StatusDocumento.EM_ANALISE
          : StatusDocumento.PENDENTE;

    }

  }

  podeEnviarDocumentos(processo: Processo): boolean {
    return STATUS_ENVIO_DOCUMENTOS.includes(processo.status);
  }

  proximaEtapa(status: string): string {

    switch (status) {

      case StatusAlistamento.CADASTRO_INCOMPLETO:
      case StatusAlistamento.AGUARDANDO_DOCUMENTOS:
        return 'Envie seus documentos para análise da Junta Militar.';

      case StatusAlistamento.EM_ANALISE:
        return 'Seus documentos estão sendo analisados pela Junta Militar.';

      case StatusAlistamento.DOCUMENTOS_REPROVADOS:
        return 'Sua documentação foi reprovada. Envie novamente os documentos corrigidos.';

      case StatusAlistamento.DOCUMENTOS_APROVADOS:
        return 'Documentos aprovados. Aguarde o agendamento da avaliação médica.';

      case StatusAlistamento.AVALIACAO_AGENDADA:
        return 'Compareça na data e horário informados para sua avaliação médica.';

      case StatusAlistamento.AVALIACAO_CONCLUIDA:
        return 'Avaliação médica concluída. Aguarde o parecer da Junta Militar.';

      case StatusAlistamento.APROVADO:
        return 'Você foi considerado APTO. Aguarde a convocação para incorporação.';

      case StatusAlistamento.REPROVADO:
        return 'Você foi dispensado do serviço militar. Procure a Junta Militar para mais informações.';

      default:
        return 'Aguardando atualização do processo.';

    }

  }

  paraView(processo: Processo): CidadaoView {

    const u = processo.usuario;
    const statusDocs = this.statusDocumentos(processo);

    const agendamento = processo.agendamento;
    const avaliacao = processo.avaliacao;

    return {
      processo,
      id: u.id,
      nome: u.nome ?? '',
      cpf: u.cpf ?? '',
      email: u.email ?? '',
      telefone: u.telefone ?? '',
      dataNascimento: formatarData(u.dataNascimento),
      rg: u.rg ?? '',
      nomeMae: u.nomeMae ?? '',
      nomePai: u.nomePai ?? '',
      localNascimento: u.localNascimento ?? '',
      estadoCivil: u.estadoCivil ?? '',
      escolaridade: u.escolaridade ?? '',
      cep: u.cep ?? '',
      logradouro: u.logradouro ?? '',
      numero: u.numeroResidencia ?? '',
      bairro: u.bairro ?? '',
      municipio: u.municipio ?? '',
      uf: u.uf ?? '',
      pais: u.paisResidencia ?? '',
      zonaResidencial: u.zonaResidencial ?? '',
      status: processo.status,
      dataCadastro: formatarData(processo.alistamento?.dataAlistamento),
      documentos: processo.documentos.map(d => ({
        id: d.id,
        tipo: d.tipoDocumentoResponseDTO?.nomeTipo ?? '-',
        nomeArquivo: d.nomeArquivo,
        dataEnvio: formatarData(d.dataEnvio),
        status: statusDocs
      })),
      agendamento: agendamento
        ? {
            id: agendamento.id,
            data: formatarData(agendamento.dataAgendamento),
            horario: formatarHora(agendamento.horario),
            local: agendamento.localResponseDTO?.nomeUnidade ?? '-',
            endereco: agendamento.localResponseDTO
              ? `${agendamento.localResponseDTO.enderecoLocal} — ${agendamento.localResponseDTO.cidadeLocal}/${agendamento.localResponseDTO.estadoLocal}`
              : '-',
            medico: agendamento.medicoResponseDTO?.nomeMedico
              ?? avaliacao?.medicoResponseDTO?.nomeMedico
              ?? '',
            status: avaliacao ? 'Concluído' : 'Agendado'
          }
        : null,
      avaliacao: avaliacao
        ? {
            data: formatarData(avaliacao.dataAvaliacao),
            resultado: avaliacao.resultado,
            observacoes: avaliacao.observacoes ?? '',
            medico: avaliacao.medicoResponseDTO?.nomeMedico ?? ''
          }
        : null
    };

  }

  private montarDoCompleto(completo: AlistamentoCompletoApi, usuario: UsuarioApi): Processo {

    return this.montar(
      usuario,
      completo.alistamento,
      completo.documentos ?? [],
      completo.agendamento ?? null,
      completo.avaliacaoMedica ?? null
    );

  }

  private montar(
    usuario: UsuarioApi,
    alistamento: AlistamentoApi | null,
    documentos: DocumentoApi[],
    agendamento: AgendamentoApi | null,
    avaliacao: AvaliacaoMedicaApi | null
  ): Processo {

    return {
      usuario,
      alistamento,
      documentos,
      agendamento,
      avaliacao,
      status: alistamento
        ? (alistamento.status || StatusAlistamento.EM_ANALISE)
        : StatusAlistamento.CADASTRO_INCOMPLETO
    };

  }

}