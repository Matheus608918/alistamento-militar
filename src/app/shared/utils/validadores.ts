import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfValido(cpf: string): boolean {

  if (!cpf) {
    return false;
  }

  const numeros = cpf.replace(/\D/g, '');

  if (numeros.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(numeros)) {
    return false;
  }

  const calcularDigito = (quantidade: number): number => {

    let soma = 0;

    for (let i = 0; i < quantidade; i++) {
      soma += Number(numeros[i]) * (quantidade + 1 - i);
    }

    const resto = (soma * 10) % 11;

    return resto === 10 ? 0 : resto;

  };

  return (
    calcularDigito(9) === Number(numeros[9]) &&
    calcularDigito(10) === Number(numeros[10])
  );

}

export const validadorCpf: ValidatorFn = (
  controle: AbstractControl
): ValidationErrors | null => {

  if (!controle.value) {
    return null;
  }

  return cpfValido(controle.value)
    ? null
    : { cpfInvalido: true };

};

export const SEXOS = ['Masculino', 'Feminino'];

export const NACIONALIDADES = ['Brasileira', 'Brasileira naturalizada'];

const IDADE_ALISTAMENTO = 18;

const IDADE_MAXIMA_MASCULINO = 45;

export function idadeNoAno(dataNascimento: string): number | null {

  const ano = Number((dataNascimento || '').split('-')[0]);

  if (!ano) {
    return null;
  }

  return new Date().getFullYear() - ano;

}

export function erroIdadeAlistamento(dataNascimento: string, sexo: string): string | null {

  const nascimento = new Date(`${dataNascimento}T00:00:00`);

  if (isNaN(nascimento.getTime())) {
    return 'Data de nascimento inválida.';
  }

  if (nascimento > new Date()) {
    return 'A data de nascimento não pode estar no futuro.';
  }

  const idade = idadeNoAno(dataNascimento) ?? 0;

  if (idade < IDADE_ALISTAMENTO) {
    return 'O alistamento só é permitido a partir do ano em que você completa 18 anos.';
  }

  if (sexo === 'Feminino' && idade > IDADE_ALISTAMENTO) {
    return 'O alistamento feminino é voluntário e só pode ser feito no ano em que a candidata completa 18 anos.';
  }

  if (sexo === 'Masculino' && idade > IDADE_MAXIMA_MASCULINO) {
    return 'Não há obrigação de alistamento após o ano em que se completa 45 anos.';
  }

  return null;

}

export function rgValido(rg: string): boolean {

  const texto = (rg || '').trim();

  if (!/^[0-9xX.\-\/ ]+$/.test(texto)) {
    return false;
  }

  const normalizado = texto.replace(/[^0-9xX]/g, '').toUpperCase();

  return /^[0-9]{5,13}[0-9X]$/.test(normalizado);

}

export function cepValido(cep: string): boolean {
  return (cep || '').replace(/\D/g, '').length === 8;
}

export function formatarCep(cep: string): string {

  const numeros = (cep || '').replace(/\D/g, '');

  if (numeros.length !== 8) {
    return cep;
  }

  return `${numeros.substring(0, 5)}-${numeros.substring(5)}`;

}

export function formatarCpf(cpf: string): string {

  const numeros = (cpf || '').replace(/\D/g, '');

  if (numeros.length !== 11) {
    return cpf;
  }

  return numeros.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );

}
// ----- LGPD: mostrar só parte do documento -----

// CPF mascarado: ***.456.789-** (só os dígitos do meio aparecem)
export function mascararCpf(cpf?: string | null): string {

  const numeros = (cpf || '').replace(/\D/g, '');

  if (numeros.length !== 11) {
    return cpf ? '***' : '-';
  }

  return `***.${numeros.substring(3, 6)}.${numeros.substring(6, 9)}-**`;

}

// RG mascarado: só os 3 últimos caracteres aparecem
export function mascararRg(rg?: string | null): string {

  const valor = (rg || '').replace(/[^0-9xX]/g, '').toUpperCase();

  if (!valor) {
    return '-';
  }

  return '*'.repeat(Math.max(valor.length - 3, 0)) + valor.slice(-3);

}