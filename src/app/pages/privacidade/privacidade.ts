import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/*
 Política de Privacidade (LGPD - Lei nº 13.709/2018).
 Página pública: pode ser lida antes do cadastro.
 */
@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './privacidade.html',
  styleUrl: './privacidade.css'
})
export class Privacidade {

  readonly atualizadaEm = 'outubro de 2026';

}