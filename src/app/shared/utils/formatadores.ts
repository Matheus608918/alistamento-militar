function doisDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

export function hojeIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

export function agoraIso(): string {
  const d = new Date();
  return `${hojeIso()}T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}:${doisDigitos(d.getSeconds())}`;
}

export function formatarData(valor?: string | null): string {
  if (!valor) return '-';
  const [data] = valor.split('T');
  const partes = data.split('-');
  if (partes.length !== 3) return valor;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function formatarHora(valor?: string | null): string {
  if (!valor) return '-';
  return valor.substring(0, 5);
}

export function horaParaApi(valor: string): string {
  return valor.length === 5 ? `${valor}:00` : valor;
}

export function vazioParaNull(valor?: string | null): string | null {
  const texto = (valor ?? '').trim();
  return texto ? texto : null;
}