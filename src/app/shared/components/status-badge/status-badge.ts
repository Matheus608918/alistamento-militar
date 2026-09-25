import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatusAlistamento, StatusDocumento } from '../../enums/perfil.enum';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css'
})
export class StatusBadge {

  @Input() status = '';

  get tom(): string {

    switch (this.status) {

      case StatusAlistamento.APROVADO:
      case StatusDocumento.APROVADO:
      case StatusAlistamento.DOCUMENTOS_APROVADOS:
      case StatusAlistamento.AVALIACAO_CONCLUIDA:
        return 'sucesso';

      case StatusAlistamento.REPROVADO:
      case StatusDocumento.REPROVADO:
      case StatusAlistamento.DOCUMENTOS_REPROVADOS:
        return 'perigo';

      case StatusAlistamento.AVALIACAO_AGENDADA:
        return 'info';

      case StatusAlistamento.CADASTRO_INCOMPLETO:
      case StatusAlistamento.AGUARDANDO_DOCUMENTOS:
      case StatusDocumento.PENDENTE:
        return 'neutro';

      default:
        return 'alerta';

    }

  }

  get texto(): string {
    return this.status || StatusAlistamento.EM_ANALISE;
  }

}