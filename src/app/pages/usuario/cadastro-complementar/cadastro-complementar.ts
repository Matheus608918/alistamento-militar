import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiService, mensagemErro } from '../../../services/api.service';
import { AuthService } from '../../../services/auth';
import { CadastroRascunhoService } from '../../../services/cadastro-rascunho.service';
import { ProcessoService } from '../../../services/processo.service';
import { UsuarioRequest } from '../../../models/api.models';
import { vazioParaNull } from '../../../shared/utils/formatadores';

@Component({
  selector: 'app-cadastro-complementar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './cadastro-complementar.html',
  styleUrl: './cadastro-complementar.css'
})
export class CadastroComplementar {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private rascunho = inject(CadastroRascunhoService);
  private processoService = inject(ProcessoService);

  enviando = false;

  cadastroForm: FormGroup;

  constructor() {

    const etapa1 = this.rascunho.obter();

    this.cadastroForm = this.fb.group({

      nome: [etapa1?.nome || '', Validators.required],

      nomeMae: ['', Validators.required],

      nomePai: [''],

      cpf: [etapa1?.cpf || '', Validators.required],

      rg: ['', Validators.required],

      dataNascimento: [etapa1?.dataNascimento || '', Validators.required],

      localNascimento: [''],

      estadoCivil: [''],

      escolaridade: [''],

      telefone: [etapa1?.telefone || ''],

      email: [
        etapa1?.email || '',
        [Validators.required, Validators.email]
      ],

      cep: [''],

      logradouro: [''],

      numero: [''],

      bairro: [''],

      municipio: [''],

      uf: [''],

      pais: ['Brasil'],

      zonaResidencial: ['']

    });

  }

  validarFormulario(): boolean {

    const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;

    const rgRegex = /^[0-9.\-xX]{7,15}$/;

    const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

    const cepRegex = /^\d{5}-?\d{3}$/;

    const ufRegex = /^[A-Za-z]{2}$/;

    const valores = this.cadastroForm.value;

    const nome = valores.nome?.trim();

    const nomeMae = valores.nomeMae?.trim();

    const nomePai = valores.nomePai?.trim();

    if (!nomeRegex.test(nome)) {
      alert('Nome inválido. Digite apenas letras.');
      return false;
    }

    if (!nomeRegex.test(nomeMae)) {
      alert('Nome da mãe inválido. Digite apenas letras.');
      return false;
    }

    if (nomePai && !nomeRegex.test(nomePai)) {
      alert('Nome do pai inválido. Digite apenas letras.');
      return false;
    }

    if (!rgRegex.test(valores.rg)) {
      alert('RG inválido.');
      return false;
    }

    if (valores.telefone && !telefoneRegex.test(valores.telefone)) {
      alert('Telefone inválido.');
      return false;
    }

    if (valores.cep && !cepRegex.test(valores.cep)) {
      alert('CEP inválido.');
      return false;
    }

    if (valores.uf && !ufRegex.test(valores.uf)) {
      alert('UF inválida.');
      return false;
    }

    if (valores.numero && String(valores.numero).length > 10) {
      alert('Número da residência deve ter no máximo 10 caracteres.');
      return false;
    }

    return true;

  }

  async salvar(): Promise<void> {

    if (this.enviando) {
      return;
    }

    if (this.cadastroForm.invalid) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!this.validarFormulario()) {
      return;
    }

    const etapa1 = this.rascunho.obter();

    if (!etapa1) {
      this.router.navigate(['/cadastro']);
      return;
    }

    const v = this.cadastroForm.value;
    const uf = vazioParaNull(v.uf)?.toUpperCase() ?? null;

    const dto: UsuarioRequest = {
      nome: v.nome.trim(),
      dataNascimento: v.dataNascimento,
      email: v.email.trim(),
      senha: etapa1.senha,
      telefone: vazioParaNull(v.telefone),
      cpf: String(v.cpf).replace(/\D/g, ''),
      nomePai: vazioParaNull(v.nomePai),
      nomeMae: vazioParaNull(v.nomeMae),
      estadoCivil: vazioParaNull(v.estadoCivil),
      uf,
      escolaridade: vazioParaNull(v.escolaridade),
      rg: vazioParaNull(v.rg),
      localNascimento: vazioParaNull(v.localNascimento),
      cep: vazioParaNull(v.cep),
      bairro: vazioParaNull(v.bairro),
      municipio: vazioParaNull(v.municipio),
      paisResidencia: vazioParaNull(v.pais),
      zonaResidencial: vazioParaNull(v.zonaResidencial),
      numeroResidencia: vazioParaNull(v.numero),
      logradouro: vazioParaNull(v.logradouro),
      estado: uf
    };

    this.enviando = true;
    this.cdr.markForCheck();

    try {

      const usuario = await this.api.cadastrarUsuario(dto);

      await this.auth.entrar(dto.email, dto.senha);

      this.rascunho.limpar();

      try {
        await this.processoService.garantirAlistamento(usuario.id);
      } catch (erro) {
        console.error(erro);
      }

      alert('Cadastro realizado com sucesso!');

      await this.router.navigate(['/dashboard']);

    } catch (erro) {

      if (erro instanceof HttpErrorResponse && erro.status === 400) {
        alert('Este e-mail já está cadastrado.');
      } else if (erro instanceof HttpErrorResponse && erro.status !== 0) {
        alert('Não foi possível concluir o cadastro. Verifique se o CPF já não está cadastrado.');
      } else {
        alert(mensagemErro(erro, 'Não foi possível concluir o cadastro.'));
      }

    } finally {

      this.enviando = false;
      this.cdr.markForCheck();

    }

  }

}