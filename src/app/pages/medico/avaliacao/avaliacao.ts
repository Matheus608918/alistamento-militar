import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../services/auth';
import { ApiService, mensagemErro } from '../../../services/api.service';
import { CidadaoView, ProcessoService } from '../../../services/processo.service';
import { ResultadoAvaliacao } from '../../../models/api.models';
import { StatusAlistamento } from '../../../shared/enums/perfil.enum';
import { hojeIso, vazioParaNull } from '../../../shared/utils/formatadores';

@Component({
  selector: 'app-avaliacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './avaliacao.html',
  styleUrl: './avaliacao.css'
})
export class Avaliacao implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  paciente: CidadaoView | null = null;

  resultado: ResultadoAvaliacao | '' = '';

  observacoes = '';

  salvando = false;

  erro = '';

  async ngOnInit(): Promise<void> {

    const idAlistamento = Number(this.route.snapshot.queryParamMap.get('alistamento'));

    if (!idAlistamento) {
      return;
    }

    try {

      const processo = await this.processoService.carregarPorAlistamento(idAlistamento);

      this.paciente = this.processoService.paraView(processo);

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar o paciente.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  async salvar(): Promise<void> {

    const paciente = this.paciente;
    const processo = paciente?.processo;
    const medico = this.auth.usuarioAtual();

    if (!paciente || !processo?.alistamento || !medico) {
      return;
    }

    if (paciente.avaliacao) {
      alert('Este paciente já foi avaliado.');
      return;
    }

    if (!processo.agendamento) {
      alert('Este paciente não possui agendamento.');
      return;
    }

    if (!this.resultado) {
      alert('Selecione o resultado da avaliação.');
      return;
    }

    this.salvando = true;
    this.cdr.markForCheck();

    try {

      await this.api.cadastrarAvaliacao({
        dataAvaliacao: hojeIso(),
        resultado: this.resultado,
        observacoes: vazioParaNull(this.observacoes),
        idAlistamento: processo.alistamento.id,
        idMedico: medico.id,
        idLocal: processo.agendamento.localResponseDTO.id
      });

      await this.processoService.atualizarStatus(
        processo.alistamento.id,
        StatusAlistamento.AVALIACAO_CONCLUIDA
      );

      alert('Avaliação médica salva com sucesso!');

      await this.router.navigate(['/medico/dashboard']);

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível salvar a avaliação.'));

    } finally {

      this.salvando = false;
      this.cdr.markForCheck();

    }

  }

}