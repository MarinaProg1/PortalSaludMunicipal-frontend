import React, { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { BsArrowLeft, BsPersonBadge } from 'react-icons/bs';
import { toast } from 'sonner';
import clientesAxios from '../../config/axios';
import { medicoService } from '../../services/medico.service';
import { ObraSocialSelect } from '../obrasSociales/ObraSocialSelect';
import { PageHeader } from '../../constants/PageHeader';
import { getEspecialidadIds, type EspecialidadRef, type MedicoPayload } from './medico.schema';
import { MedicoFormSkeleton } from './MedicoFormSkeleton';

interface MedicoFormProps {
  medicoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormState {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  numeroMatricula: string;
  especialidades: string[];
  tipoTelefono: string;
  codigoArea: string;
  telefono: string;
  calle: string;
  numeroCalle: string;
  piso: string;
  departamento: string;
  barrio: string;
  obraSocial: string;
  activo: boolean;
}

const FORM_INICIAL: FormState = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  numeroMatricula: '',
  especialidades: [],
  tipoTelefono: 'celular',
  codigoArea: '',
  telefono: '',
  calle: '',
  numeroCalle: '',
  piso: '',
  departamento: '',
  barrio: '',
  obraSocial: '',
  activo: true,
};

const extraerArray = (responseData: unknown, clave: string): EspecialidadRef[] => {
  if (Array.isArray(responseData)) return responseData as EspecialidadRef[];
  if (responseData && typeof responseData === 'object') {
    const record = responseData as Record<string, unknown>;
    if (Array.isArray(record[clave])) return record[clave] as EspecialidadRef[];
    if (Array.isArray(record.data)) return record.data as EspecialidadRef[];
  }
  return [];
};

const mensajeError = (err: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string; data?: string }>(err)) {
    const payload = err.response?.data;
    if (payload?.message) return payload.message;
    if (typeof payload?.data === 'string') return payload.data;
  }
  return fallback;
};

export const MedicoForm: React.FC<MedicoFormProps> = ({ medicoId, onSuccess, onCancel }) => {
  const isEditing = Boolean(medicoId);

  const [especialidades, setEspecialidades] = useState<EspecialidadRef[]>([]);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const resEspecialidades = await clientesAxios.get('/especialidades');
        if (mounted) setEspecialidades(extraerArray(resEspecialidades.data, 'especialidades'));

        if (isEditing && medicoId) {
          const medico = await medicoService.obtener(medicoId);
          if (!mounted || !medico) return;

          const obraSocialId =
            typeof medico.obraSocial === 'string'
              ? medico.obraSocial
              : medico.obraSocial?.id || medico.obraSocial?._id || '';

          setForm({
            nombre: medico.nombre || '',
            apellido: medico.apellido || '',
            dni: medico.dni || '',
            email: medico.email || '',
            numeroMatricula: medico.numeroMatricula ? String(medico.numeroMatricula) : '',
            especialidades: getEspecialidadIds(medico),
            tipoTelefono: medico.telefono?.tipo || 'celular',
            codigoArea: medico.telefono?.codigoArea || '',
            telefono: medico.telefono?.numero || '',
            calle: medico.direccion?.calle || '',
            numeroCalle: medico.direccion?.numero ? String(medico.direccion.numero) : '',
            piso: medico.direccion?.piso || '',
            departamento: medico.direccion?.departamento || '',
            barrio: medico.direccion?.barrio || '',
            obraSocial: obraSocialId,
            activo: medico.activo !== false,
          });
        }
      } catch (err) {
        console.error('Error al cargar los datos del médico:', err);
        if (mounted) setError(mensajeError(err, 'No se pudieron cargar los datos necesarios.'));
      } finally {
        if (mounted) setLoadingData(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [medicoId, isEditing]);

  const setCampo = <K extends keyof FormState>(campo: K, valor: FormState[K]) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const toggleEspecialidad = (id: string) => {
    setForm((prev) => ({
      ...prev,
      especialidades: prev.especialidades.includes(id)
        ? prev.especialidades.filter((e) => e !== id)
        : [...prev.especialidades, id],
    }));
  };

  const validar = (): string | null => {
    if (form.nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    if (form.apellido.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres.';
    if (!/^[0-9]{7,8}$/.test(form.dni.trim())) return 'El DNI debe tener 7 u 8 dígitos.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'El email no es válido.';
    if (!form.numeroMatricula || Number(form.numeroMatricula) <= 0) return 'La matrícula debe ser un número positivo.';
    if (form.especialidades.length === 0) return 'Seleccione al menos una especialidad.';
    if (form.especialidades.length > 5) return 'Puede seleccionar hasta 5 especialidades.';
    if (form.calle.trim().length === 0) return 'La calle es obligatoria.';
    if (!form.numeroCalle || Number(form.numeroCalle) <= 0) return 'El número de la dirección debe ser positivo.';
    if (form.codigoArea.trim().length < 2) return 'El código de área no es válido.';
    if (form.telefono.trim().length < 6) return 'El número de teléfono no es válido.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    const payload: MedicoPayload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      dni: form.dni.trim(),
      email: form.email.trim(),
      numeroMatricula: Number(form.numeroMatricula),
      especialidades: form.especialidades,
      direccion: {
        calle: form.calle.trim(),
        numero: Number(form.numeroCalle),
        piso: form.piso.trim(),
        departamento: form.departamento.trim(),
        barrio: form.barrio.trim(),
      },
      telefono: {
        tipo: form.tipoTelefono,
        codigoArea: form.codigoArea.trim(),
        numero: form.telefono.trim(),
      },
      obraSocial: form.obraSocial || null,
      activo: form.activo,
    };

    try {
      setSubmitting(true);
      if (isEditing && medicoId) {
        await medicoService.actualizar(medicoId, payload);
        toast.success('Médico actualizado correctamente');
      } else {
        await medicoService.crear(payload);
        toast.success('Médico y usuario creados correctamente');
      }
      onSuccess?.();
    } catch (err) {
      console.error('Error al guardar el médico:', err);
      setError(mensajeError(err, 'No se pudo guardar el médico.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return <MedicoFormSkeleton />;
  }

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={isEditing ? 'Modificar Médico' : 'Asignar Nuevo Médico'}
        subtitulo={isEditing ? 'Actualice los datos del profesional.' : 'Complete los datos para registrar un profesional.'}
        icon={<BsPersonBadge className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={onCancel}
      />

      <div className="card border-0 shadow-sm bg-white p-4 mx-auto" style={{ maxWidth: '760px', borderRadius: '12px' }}>
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small" htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                className="form-control shadow-none"
                value={form.nombre}
                onChange={(e) => setCampo('nombre', e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small" htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                type="text"
                className="form-control shadow-none"
                value={form.apellido}
                onChange={(e) => setCampo('apellido', e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small" htmlFor="dni">DNI</label>
              <input
                id="dni"
                type="text"
                inputMode="numeric"
                className="form-control shadow-none"
                value={form.dni}
                onChange={(e) => setCampo('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-control shadow-none"
                value={form.email}
                onChange={(e) => setCampo('email', e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small" htmlFor="numeroMatricula">Matrícula</label>
              <input
                id="numeroMatricula"
                type="number"
                min={1}
                className="form-control shadow-none"
                value={form.numeroMatricula}
                onChange={(e) => setCampo('numeroMatricula', e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small" htmlFor="obraSocial">Obra social (opcional)</label>
              <ObraSocialSelect
                id="obraSocial"
                value={form.obraSocial}
                onChange={(valor) => setCampo('obraSocial', valor)}
                placeholder="Sin obra social"
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-secondary small d-block">
                Especialidades <span className="text-muted fw-normal">(1 a 5)</span>
              </label>
              <div className="border rounded-3 p-3 bg-light" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {especialidades.length === 0 ? (
                  <span className="text-muted small">No hay especialidades cargadas.</span>
                ) : (
                  <div className="row g-2">
                    {especialidades.map((esp) => {
                      const espId = esp.id || esp._id || '';
                      return (
                        <div className="col-12 col-sm-6" key={espId}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`esp-${espId}`}
                              checked={form.especialidades.includes(espId)}
                              onChange={() => toggleEspecialidad(espId)}
                            />
                            <label className="form-check-label small" htmlFor={`esp-${espId}`}>
                              {esp.nombre}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12">
              <h6 className="fw-bold text-dark border-bottom border-secondary-subtle pb-2 mt-2">Teléfono</h6>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold text-secondary small" htmlFor="tipoTelefono">Tipo</label>
              <select
                id="tipoTelefono"
                className="form-select shadow-none"
                value={form.tipoTelefono}
                onChange={(e) => setCampo('tipoTelefono', e.target.value)}
              >
                <option value="celular">Celular</option>
                <option value="fijo">Fijo</option>
                <option value="trabajo">Trabajo</option>
              </select>
            </div>

            <div className="col-4 col-md-3">
              <label className="form-label fw-semibold text-secondary small" htmlFor="codigoArea">Cód. área</label>
              <input
                id="codigoArea"
                type="text"
                inputMode="numeric"
                className="form-control shadow-none"
                placeholder="3794"
                value={form.codigoArea}
                onChange={(e) => setCampo('codigoArea', e.target.value.replace(/\D/g, '').slice(0, 5))}
                required
              />
            </div>

            <div className="col-8 col-md-5">
              <label className="form-label fw-semibold text-secondary small" htmlFor="telefono">Número</label>
              <input
                id="telefono"
                type="text"
                inputMode="numeric"
                className="form-control shadow-none"
                placeholder="123456"
                value={form.telefono}
                onChange={(e) => setCampo('telefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>

            <div className="col-12">
              <h6 className="fw-bold text-dark border-bottom border-secondary-subtle pb-2 mt-2">Dirección</h6>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small" htmlFor="calle">Calle</label>
              <input
                id="calle"
                type="text"
                className="form-control shadow-none"
                value={form.calle}
                onChange={(e) => setCampo('calle', e.target.value)}
                required
              />
            </div>

            <div className="col-4 col-md-2">
              <label className="form-label fw-semibold text-secondary small" htmlFor="numeroCalle">Número</label>
              <input
                id="numeroCalle"
                type="number"
                min={1}
                className="form-control shadow-none"
                value={form.numeroCalle}
                onChange={(e) => setCampo('numeroCalle', e.target.value)}
                required
              />
            </div>

            <div className="col-4 col-md-2">
              <label className="form-label fw-semibold text-secondary small" htmlFor="piso">Piso</label>
              <input
                id="piso"
                type="text"
                className="form-control shadow-none"
                value={form.piso}
                onChange={(e) => setCampo('piso', e.target.value)}
              />
            </div>

            <div className="col-4 col-md-2">
              <label className="form-label fw-semibold text-secondary small" htmlFor="departamento">Depto.</label>
              <input
                id="departamento"
                type="text"
                className="form-control shadow-none"
                value={form.departamento}
                onChange={(e) => setCampo('departamento', e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary small" htmlFor="barrio">Barrio</label>
              <input
                id="barrio"
                type="text"
                className="form-control shadow-none"
                value={form.barrio}
                onChange={(e) => setCampo('barrio', e.target.value)}
              />
            </div>

            {isEditing && (
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="activo"
                    checked={form.activo}
                    onChange={(e) => setCampo('activo', e.target.checked)}
                  />
                  <label className="form-check-label small fw-semibold text-secondary" htmlFor="activo">
                    Médico activo
                  </label>
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="col-12">
                <div className="alert alert-info py-2 small mb-0" role="alert">
                  Se creará además el usuario del médico con el email indicado y contraseña inicial igual al DNI.
                </div>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary-subtle">
            <button type="button" className="btn btn-light px-4 d-flex align-items-center gap-1" onClick={onCancel} disabled={submitting}>
              <BsArrowLeft /> Cancelar
            </button>
            <button
              type="submit"
              className="btn text-white fw-semibold px-4 shadow-sm"
              style={{ backgroundColor: '#00ACB2', borderRadius: '8px' }}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : isEditing ? 'Actualizar Médico' : 'Registrar Médico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
