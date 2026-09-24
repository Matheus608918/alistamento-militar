import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card {

  @Input() titulo?: string;

  @Input() subtitulo?: string;

  @Input() destaque?: 'primaria' | 'sucesso' | 'perigo' | 'alerta';

  @Input() clicavel = false;

}