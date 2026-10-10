import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface EnderecoCep {
  logradouro: string;
  bairro: string;
  municipio: string;
  uf: string;
}

interface RespostaViaCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

@Injectable({ providedIn: 'root' })
export class CepService {

  private http = inject(HttpClient);

  async buscar(cep: string): Promise<EnderecoCep | null> {

    const numeros = (cep || '').replace(/\D/g, '');

    if (numeros.length !== 8) {
      return null;
    }

    const resposta = await firstValueFrom(
      this.http.get<RespostaViaCep>(`https://viacep.com.br/ws/${numeros}/json/`)
    );

    if (!resposta || resposta.erro) {
      return null;
    }

    return {
      logradouro: resposta.logradouro ?? '',
      bairro: resposta.bairro ?? '',
      municipio: resposta.localidade ?? '',
      uf: resposta.uf ?? ''
    };

  }

}