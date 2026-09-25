import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth';
import { ApiService, mensagemErro } from '../../../services/api.service';
import { formatarData } from '../../../shared/utils/formatadores';

interface DadosView {
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  nomeMae: string;
  nomePai: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  pais: string;
  zonaResidencial: string;
  estadoCivil: string;
  escolaridade: string;
  localNascimento: string;
}

@Component({
  selector: 'app-dados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dados.html',
  styleUrl: './dados.css'
})
export class Dados implements OnInit {

  private auth = inject(AuthService);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  usuario: Partial<DadosView> = {};

  erro = '';

  async ngOnInit(): Promise<void> {

    const sessao = this.auth.usuarioAtual();

    if (!sessao) {
      return;
    }

    try {

      const u = await this.api.buscarUsuario(sessao.id);

      this.usuario = {
        nome: u.nome,
        cpf: u.cpf,
        rg: u.rg ?? '',
        dataNascimento: formatarData(u.dataNascimento),
        nomeMae: u.nomeMae ?? '',
        nomePai: u.nomePai ?? '',
        email: u.email,
        telefone: u.telefone ?? '',
        cep: u.cep ?? '',
        logradouro: u.logradouro ?? '',
        numero: u.numeroResidencia ?? '',
        bairro: u.bairro ?? '',
        municipio: u.municipio ?? '',
        uf: u.uf ?? '',
        pais: u.paisResidencia ?? '',
        zonaResidencial: u.zonaResidencial ?? '',
        estadoCivil: u.estadoCivil ?? '',
        escolaridade: u.escolaridade ?? '',
        localNascimento: u.localNascimento ?? ''
      };

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar seus dados.');

    } finally {

      this.cdr.markForCheck();

    }

  }

}