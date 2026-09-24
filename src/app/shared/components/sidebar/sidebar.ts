import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../services/auth';

interface ItemMenu {
  rota: string;
  texto: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  private auth = inject(AuthService);

  readonly ehAdmin = computed(() => this.auth.perfil() === 'admin');
  readonly ehMedico = computed(() => this.auth.perfil() === 'medico');
  readonly ehCidadao = computed(() => this.auth.perfil() === 'cidadao');

  readonly itens = computed<ItemMenu[]>(() => {

    if (this.ehAdmin()) {

      return [
        { rota: '/admin/dashboard', texto: 'Painel' },
        { rota: '/admin/cidadaos', texto: 'Cidadãos' },
        { rota: '/admin/medicos', texto: 'Médicos' },
        { rota: '/admin/documentos', texto: 'Documentos' },
        { rota: '/admin/agendamentos', texto: 'Agendamentos' },
        { rota: '/admin/alistamentos', texto: 'Alistamentos' },
        { rota: '/admin/relatorios', texto: 'Relatórios' },
        { rota: '/admin/configuracoes', texto: 'Configurações' }
      ];

    }

    if (this.ehMedico()) {

      return [
        { rota: '/medico/dashboard', texto: 'Painel' },
        { rota: '/medico/avaliacao', texto: 'Avaliações' }
      ];

    }

    return [
      { rota: '/dashboard', texto: 'Painel' },
      { rota: '/dados', texto: 'Meus dados' },
      { rota: '/documentos', texto: 'Documentos' },
      { rota: '/agendamento', texto: 'Agendamento' },
      { rota: '/status', texto: 'Situação' },
      { rota: '/resultado', texto: 'Resultado' }
    ];

  });

  sair(): void {
    this.auth.sair();
  }

}