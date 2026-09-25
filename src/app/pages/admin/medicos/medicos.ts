import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService, mensagemErro } from '../../../services/api.service';
import { MedicoRequest } from '../../../models/api.models';

interface MedicoView {
  id: number;
  nome: string;
  email: string;
  crm: string;
  especialidade: string;
  telefone: string;
}

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './medicos.html',
  styleUrl: './medicos.css'
})
export class Medicos implements OnInit {

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  medicos: MedicoView[] = [];

  medico = {
    nome: '',
    email: '',
    senha: '',
    crm: '',
    especialidade: '',
    telefone: ''
  };

  editando = false;

  idEdicao: number | null = null;

  salvando = false;

  erro = '';

  ngOnInit(): void {
    this.carregarMedicos();
  }

  async carregarMedicos(): Promise<void> {

    try {

      const lista = await this.api.listarMedicos();

      this.medicos = lista.map(m => ({
        id: m.id,
        nome: m.nomeMedico,
        email: m.emailMedico ?? '',
        crm: m.crm,
        especialidade: m.especialidade ?? '',
        telefone: m.telefoneMedico ?? ''
      }));

      this.erro = '';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar os médicos.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  async salvar(): Promise<void> {

    if (
      !this.medico.nome ||
      !this.medico.email ||
      (!this.editando && !this.medico.senha) ||
      !this.medico.crm ||
      !this.medico.especialidade ||
      !this.medico.telefone
    ) {

      alert('Preencha todos os campos.');
      return;

    }

    const dto: MedicoRequest = {
      nomeMedico: this.medico.nome.trim(),
      emailMedico: this.medico.email.trim(),
      crm: this.medico.crm.trim(),
      especialidade: this.medico.especialidade.trim(),
      telefoneMedico: this.medico.telefone.trim()
    };

    this.salvando = true;
    this.cdr.markForCheck();

    try {

      if (this.editando && this.idEdicao !== null) {

        await this.api.atualizarMedico(this.idEdicao, dto);

        alert('Médico atualizado com sucesso.');

      } else {

        await this.api.cadastrarMedico({ ...dto, senhaMedico: this.medico.senha });

        alert('Médico cadastrado com sucesso.');

      }

      this.limparFormulario();

      await this.carregarMedicos();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível salvar o médico. Verifique se o CRM já não está cadastrado.'));

    } finally {

      this.salvando = false;
      this.cdr.markForCheck();

    }

  }

  editar(indice: number) {

    const selecionado = this.medicos[indice];

    this.editando = true;

    this.idEdicao = selecionado.id;

    this.medico = {
      nome: selecionado.nome,
      email: selecionado.email,
      senha: '',
      crm: selecionado.crm,
      especialidade: selecionado.especialidade,
      telefone: selecionado.telefone
    };

  }

  async excluir(indice: number): Promise<void> {

    const selecionado = this.medicos[indice];

    if (!confirm(`Deseja excluir o médico ${selecionado.nome}?`)) {
      return;
    }

    try {

      await this.api.excluirMedico(selecionado.id);

      await this.carregarMedicos();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível excluir. O médico pode ter avaliações registradas.'));

    }

  }

  limparFormulario() {

    this.medico = {
      nome: '',
      email: '',
      senha: '',
      crm: '',
      especialidade: '',
      telefone: ''
    };

    this.editando = false;

    this.idEdicao = null;

  }

}