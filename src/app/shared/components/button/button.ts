import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type VarianteBotao =
  | 'primario'
  | 'secundario'
  | 'sucesso'
  | 'perigo'
  | 'alerta'
  | 'texto';

export type TamanhoBotao = 'pequeno' | 'medio' | 'grande';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class Button {

  @Input() variante: VarianteBotao = 'primario';

  @Input() tamanho: TamanhoBotao = 'medio';

  @Input() tipo: 'button' | 'submit' = 'button';

  @Input() desabilitado = false;

  @Input() carregando = false;

  @Input() blocoCompleto = false;

  @Input() rotuloAcessivel?: string;

  @Input() motivoBloqueio?: string;

  @Output() acionar = new EventEmitter<MouseEvent>();

  get bloqueado(): boolean {
    return this.desabilitado || this.carregando;
  }

  aoClicar(evento: MouseEvent): void {

    if (this.bloqueado) {
      return;
    }

    this.acionar.emit(evento);

  }

}