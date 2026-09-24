import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

let contadorIds = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.html',
  styleUrl: './input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputField),
      multi: true
    }
  ]
})
export class InputField implements ControlValueAccessor {

  @Input() rotulo = '';

  @Input() tipo = 'text';

  @Input() placeholder = '';

  @Input() obrigatorio = false;

  @Input() desabilitado = false;

  @Input() erro = '';

  @Input() ajuda = '';

  readonly id = `campo-${contadorIds++}`;

  valor = '';

  private aoMudar: (valor: string) => void = () => {};

  private aoTocar: () => void = () => {};

  get idErro(): string {
    return `${this.id}-erro`;
  }

  get idAjuda(): string {
    return `${this.id}-ajuda`;
  }

  get descritoPor(): string | null {

    const ids: string[] = [];

    if (this.erro) {
      ids.push(this.idErro);
    }

    if (this.ajuda) {
      ids.push(this.idAjuda);
    }

    return ids.length ? ids.join(' ') : null;

  }

  aoDigitar(evento: Event): void {

    const alvo = evento.target as HTMLInputElement;

    this.valor = alvo.value;

    this.aoMudar(this.valor);

  }

  writeValue(valor: string): void {
    this.valor = valor ?? '';
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado = desabilitado;
  }

  marcarTocado(): void {
    this.aoTocar();
  }

}