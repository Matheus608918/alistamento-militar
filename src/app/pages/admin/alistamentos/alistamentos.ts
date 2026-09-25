import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { mensagemErro } from '../../../services/api.service';
import { AuthService } from '../../../services/auth';
import { CidadaoView, ProcessoService } from '../../../services/processo.service';

@Component({
  selector: 'app-alistamentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alistamentos.html',
  styleUrl: './alistamentos.css'
})
export class Alistamentos implements OnInit {

  private auth = inject(AuthService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: CidadaoView[] = [];

  erro = '';

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  async carregarUsuarios(): Promise<void> {

    try {

      const processos = await this.processoService.carregarTodos();

      this.usuarios = processos.map(p => this.processoService.paraView(p));
      this.erro = '';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar os alistamentos.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  async alterarStatus(usuario: CidadaoView, status: string): Promise<void> {

    const alistamento = usuario.processo.alistamento;

    if (!alistamento) {
      alert('Este cidadão ainda não possui alistamento aberto.');
      return;
    }

    try {

      await this.processoService.atualizarStatus(
        alistamento.id,
        status,
        this.auth.usuarioAtual()?.id
      );

      alert('Status atualizado com sucesso.');

      await this.carregarUsuarios();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível atualizar o status.'));

    }

  }

}