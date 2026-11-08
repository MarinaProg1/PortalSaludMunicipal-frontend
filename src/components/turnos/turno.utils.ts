export const formatearFechaTurno = (fecha: string): string => {
  if (!fecha) return '';
  return fecha.split('T')[0];
};

export const esFechaDeHoy = (fecha: string): boolean => {
  if (!fecha) return false;

  const hoy = new Date();
  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('-');

  return formatearFechaTurno(fecha) === fechaHoy;
};
