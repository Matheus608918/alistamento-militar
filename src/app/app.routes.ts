import { Routes } from '@angular/router';

import { authGuard, roleGuard } from './guards/auth.guard';
import { Perfil } from './shared/enums/perfil.enum';

import { MainLayout } from './layouts/main-layout/main-layout';

import { Home } from './pages/home/home';

import { Login } from './pages/auth/login/login';
import { Cadastro } from './pages/auth/cadastro/cadastro';
import { CadastroComplementar } from './pages/usuario/cadastro-complementar/cadastro-complementar';

import { Dashboard } from './pages/usuario/dashboard/dashboard';
import { Dados } from './pages/usuario/dados/dados';
import { Documentos } from './pages/usuario/documentos/documentos';
import { Status } from './pages/usuario/status/status';
import { Resultado } from './pages/usuario/resultado/resultado';
import { Agendamento } from './pages/usuario/agendamento/agendamento';

import { Dashboard as DashboardMedico } from './pages/medico/dashboard/dashboard';
import { Avaliacao } from './pages/medico/avaliacao/avaliacao';

import { Dashboard as DashboardAdmin } from './pages/admin/dashboard/dashboard';
import { Cidadaos } from './pages/admin/cidadaos/cidadaos';
import { Medicos } from './pages/admin/medicos/medicos';
import { Documentos as DocumentosAdmin } from './pages/admin/documentos/documentos';
import { Agendamentos as AgendamentosAdmin } from './pages/admin/agendamentos/agendamentos';
import { Relatorios as RelatoriosAdmin } from './pages/admin/relatorios/relatorios';
import { Alistamentos as AlistamentosAdmin } from './pages/admin/alistamentos/alistamentos';
import { Configuracoes as ConfiguracoesAdmin } from './pages/admin/configuracoes/configuracoes';

export const routes: Routes = [

  {
    path: '',
    component: Home,
    title: 'Alistamento Militar'
  },

  {
    path: 'login',
    component: Login,
    title: 'Entrar'
  },

  {
    path: 'cadastro',
    component: Cadastro,
    title: 'Criar conta'
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.CIDADAO] },
        title: 'Meu painel'
      },

      {
        path: 'cadastro-complementar',
        component: CadastroComplementar,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.CIDADAO] },
        title: 'Cadastro complementar'
      },

      {
        path: 'dados',
        component: Dados,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.CIDADAO] },
        title: 'Meus dados'
      },

      {
        path: 'documentos',
        component: Documentos,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.CIDADAO] },
        title: 'Meus documentos'
      },

      {
        path: 'status',
        component: Status,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.CIDADAO] },
        title: 'Situação do processo'
      },

      {
        path: 'resultado',
        component: Resultado,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.CIDADAO] },
        title: 'Resultado'
      },

      {
        path: 'agendamento',
        component: Agendamento,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.CIDADAO] },
        title: 'Agendamento'
      },

      {
        path: 'medico/dashboard',
        component: DashboardMedico,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.MEDICO] },
        title: 'Painel médico'
      },

      {
        path: 'medico/avaliacao',
        component: Avaliacao,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.MEDICO] },
        title: 'Avaliação médica'
      },

      {
        path: 'admin/dashboard',
        component: DashboardAdmin,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.ADMIN] },
        title: 'Painel administrativo'
      },

      {
        path: 'admin/cidadaos',
        component: Cidadaos,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.ADMIN] },
        title: 'Cidadãos'
      },

      {
        path: 'admin/medicos',
        component: Medicos,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.ADMIN] },
        title: 'Médicos'
      },

      {
        path: 'admin/documentos',
        component: DocumentosAdmin,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.ADMIN] },
        title: 'Documentos'
      },

      {
        path: 'admin/agendamentos',
        component: AgendamentosAdmin,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.ADMIN] },
        title: 'Agendamentos'
      },

      {
        path: 'admin/alistamentos',
        component: AlistamentosAdmin,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.ADMIN] },
        title: 'Alistamentos'
      },

      {
        path: 'admin/relatorios',
        component: RelatoriosAdmin,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.ADMIN] },
        title: 'Relatórios'
      },

      {
        path: 'admin/configuracoes',
        component: ConfiguracoesAdmin,
        canActivate: [roleGuard],
        data: { perfis: [Perfil.ADMIN] },
        title: 'Configurações'
      }

    ]
  },

  {
    path: '**',
    redirectTo: ''
  }

];