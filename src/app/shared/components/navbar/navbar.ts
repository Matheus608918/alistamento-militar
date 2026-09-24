import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth';
import { Perfil } from '../../enums/perfil.enum';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  private auth = inject(AuthService);

  readonly usuario = this.auth.usuarioAtual;

  readonly nome = computed(
    () => this.usuario()?.nome ?? 'Usuário'
  );

  readonly perfilLegivel = computed(() => {

    switch (this.usuario()?.tipo) {

      case Perfil.ADMIN:
        return 'Administrador';

      case Perfil.MEDICO:
        return 'Médico';

      case Perfil.CIDADAO:
        return 'Cidadão';

      default:
        return '';

    }

  });

  sair(): void {
    this.auth.sair();
  }

}