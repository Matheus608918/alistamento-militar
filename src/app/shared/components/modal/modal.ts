import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {

  @Input() aberto = false;

  @Input() titulo = '';

  @Input() largura: 'pequena' | 'media' | 'grande' = 'media';

  @Output() fechar = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {

    if (this.aberto) {
      this.fechar.emit();
    }

  }

  aoClicarFora(): void {
    this.fechar.emit();
  }

}