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

export const validadorIdadeAlistamento: ValidatorFn = (
  controle: AbstractControl
): ValidationErrors | null => {

  if (!controle.value) {
    return null;
  }

  const nascimento = new Date(controle.value);

  if (isNaN(nascimento.getTime())) {
    return { dataInvalida: true };
  }

  const hoje = new Date();

  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  if (nascimento > hoje) {
    return { dataFutura: true };
  }

  return idade >= 17
    ? null
    : { idadeInsuficiente: { idade } };

};

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