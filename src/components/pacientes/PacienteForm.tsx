import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsHeartPulse, BsSave } from 'react-icons/bs';
import { PageHeader } from '../../constants/PageHeader';
import { ObraSocialSelect } from '../obrasSociales/ObraSocialSelect';
import { obraSocialSchema, getObraSocialId } from '../obrasSociales/obraSocial.schema';
import { obraSocialService } from '../../services/obraSocial.service';
import { pacienteService } from '../../services/paciente.service';
import {
  pacienteSchema,
  getObraSocialRefId,
  SEXOS,
  TIPOS_TELEFONO,
  type PacienteItem,
} from './paciente.schema';
import toast from 'react-hot-toast';

interface Props {
  pacienteId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormState {
  nombre: string;
  apellido: string;
  dni: string;
  sexo: string;
  email: string;
  direccion: {
    calle: string;
    numero: string;
    piso: string;
    departamento: string;
    barrio: string;
  };
  telefono: {
    tipo: string;
    codigoArea: string;
    numero: string;
  };
  obraSocial: string;
  numeroAfiliado: string;
  activo: boolean;
}

const EMPTY: FormState = {
  nombre: '',
  apellido: '',
  dni: '',
  sexo: 'MASCULINO',
  email: '',
  direccion: { calle: '', numero: '', piso: '', departamento: '', barrio: '' },
  telefono: { tipo: 'celular', codigoArea: '', numero: '' },
  obraSocial: '',
  numeroAfiliado: '',
  activo: true,
};

function pacienteToForm(p: PacienteItem): FormState {
  return {
    nombre: p.nombre || '',
    apellido: p.apellido || '',
    dni: p.dni || '',
    sexo: (p.sexo || 'MASCULINO').toUpperCase(),
    email: p.email || '',
    direccion: {
      calle: p.direccion?.calle || '',
      numero: p.direccion?.numero != null ? String(p.direccion.numero) : '',
      piso: p.direccion?.piso || '',
      departamento: p.direccion?.departamento || '',
      barrio: p.direccion?.barrio || '',
    },
    telefono: {
      tipo: p.telefono?.tipo || 'celular',
      codigoArea: p.telefono?.codigoArea || '',
      numero: p.telefono?.numero || '',
    },
    obraSocial: getObraSocialRefId(p.obraSocial),
    numeroAfiliado: p.numeroAfiliado || '',
    activo: p.activo !== false,
  };
}

export const PacienteForm: React.FC<Props> = ({ pacienteId, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const isEdit = !!pacienteId;
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Creación rápida de obra social desde el alta/edición del paciente
  const [refreshObras, setRefreshObras] = useState(0);
  const [showNuevaObra, setShowNuevaObra] = useState(false);
  const [nuevaObra, setNuevaObra] = useState({ nombre: '', email: '', telefono: '' });
  const [erroresObra, setErroresObra] = useState<Record<string, string>>({});
  const [creandoObra, setCreandoObra] = useState(false);

  useEffect(() => {
    if (!pacienteId) {
      setValues(EMPTY);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const data = await pacienteService.obtener(pacienteId);
        setValues(pacienteToForm(data));
      } catch (e) {
        console.error(e);
        toast.error('No se pudo cargar el paciente');
      } finally {
        setLoading(false);
      }
    })();
  }, [pacienteId]);

  const setField = (field: keyof FormState, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const setDireccion = (field: keyof FormState['direccion'], value: string) => {
    setValues((prev) => ({ ...prev, direccion: { ...prev.direccion, [field]: value } }));
  };

  const setTelefono = (field: keyof FormState['telefono'], value: string) => {
    setValues((prev) => ({ ...prev, telefono: { ...prev.telefono, [field]: value } }));
  };

  const setNuevaObraField = (field: keyof typeof nuevaObra, value: string) => {
    setNuevaObra((prev) => ({ ...prev, [field]: value }));
  };

  const cancelarNuevaObra = () => {
    setShowNuevaObra(false);
    setNuevaObra({ nombre: '', email: '', telefono: '' });
    setErroresObra({});
  };

  const crearObraSocialRapida = async () => {
    setErroresObra({});

    const parsed = obraSocialSchema.safeParse(nuevaObra);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path.join('.');
        if (key) fieldErrors[key] = issue.message;
      });
      setErroresObra(fieldErrors);
      return;
    }

    try {
      setCreandoObra(true);
      const obra = await obraSocialService.crear(parsed.data);
      const nuevoId = getObraSocialId(obra);

      if (!nuevoId) {
        toast.error('La obra social se creó pero no se pudo seleccionar');
        setRefreshObras((n) => n + 1);
      } else {
        setRefreshObras((n) => n + 1);
        setField('obraSocial', nuevoId);
        toast.success('Obra social creada');
      }

      cancelarNuevaObra();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Error al crear la obra social');
    } finally {
      setCreandoObra(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = pacienteSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path.join('.');
        if (key) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error('Revisa los campos marcados');
      return;
    }

    const data = parsed.data;
    const payload = {
      ...data,
      obraSocial: data.obraSocial || null,
      numeroAfiliado: data.obraSocial ? data.numeroAfiliado || null : null,
      activo: isEdit ? values.activo : true,
    };

    try {
      setSaving(true);
      if (isEdit && pacienteId) {
        await pacienteService.actualizar(pacienteId, payload);
        toast.success('Paciente actualizado');
      } else {
        await pacienteService.crear(payload);
        toast.success('Paciente creado');
      }
      if (onSuccess) onSuccess();
      else navigate('/pacientes');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Error al guardar el paciente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container-fluid py-4 text-muted">Cargando...</div>;

  return (
    <div className="container-fluid px-2 px-md-4 py-4">
      <PageHeader
        titulo={isEdit ? 'Editar Paciente' : 'Nuevo Paciente'}
        subtitulo={isEdit ? 'Modificar datos del paciente.' : 'Registrar un nuevo paciente en el sistema.'}
        icon={<BsHeartPulse className="me-2" style={{ color: '#00ACB2' }} />}
        onBack={onCancel || (() => navigate(-1))}
      />

      <form onSubmit={onSubmit}>
        <div className="card border-0 shadow-sm bg-white mb-3" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            <h6 className="fw-bold text-dark mb-3">Datos personales</h6>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Nombre *</label>
                <input
                  name="nombre"
                  value={values.nombre}
                  onChange={(e) => setField('nombre', e.target.value)}
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Apellido *</label>
                <input
                  name="apellido"
                  value={values.apellido}
                  onChange={(e) => setField('apellido', e.target.value)}
                  className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
                />
                {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">DNI *</label>
                <input
                  name="dni"
                  value={values.dni}
                  onChange={(e) => setField('dni', e.target.value)}
                  className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
                  placeholder="7 u 8 digitos"
                />
                {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Sexo *</label>
                <select
                  name="sexo"
                  value={values.sexo}
                  onChange={(e) => setField('sexo', e.target.value)}
                  className={`form-select ${errors.sexo ? 'is-invalid' : ''}`}
                >
                  {SEXOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.sexo && <div className="invalid-feedback">{errors.sexo}</div>}
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm bg-white mb-3" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            <h6 className="fw-bold text-dark mb-3">Direccion</h6>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Calle *</label>
                <input
                  value={values.direccion.calle}
                  onChange={(e) => setDireccion('calle', e.target.value)}
                  className={`form-control ${errors['direccion.calle'] ? 'is-invalid' : ''}`}
                />
                {errors['direccion.calle'] && (
                  <div className="invalid-feedback">{errors['direccion.calle']}</div>
                )}
              </div>

              <div className="col-6 col-md-2">
                <label className="form-label fw-semibold">Numero *</label>
                <input
                  value={values.direccion.numero}
                  onChange={(e) => setDireccion('numero', e.target.value)}
                  className={`form-control ${errors['direccion.numero'] ? 'is-invalid' : ''}`}
                />
                {errors['direccion.numero'] && (
                  <div className="invalid-feedback">{errors['direccion.numero']}</div>
                )}
              </div>

              <div className="col-6 col-md-2">
                <label className="form-label fw-semibold">Piso</label>
                <input
                  value={values.direccion.piso}
                  onChange={(e) => setDireccion('piso', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="col-6 col-md-2">
                <label className="form-label fw-semibold">Depto</label>
                <input
                  value={values.direccion.departamento}
                  onChange={(e) => setDireccion('departamento', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Barrio</label>
                <input
                  value={values.direccion.barrio}
                  onChange={(e) => setDireccion('barrio', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm bg-white mb-3" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            <h6 className="fw-bold text-dark mb-3">Telefono</h6>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Tipo *</label>
                <select
                  value={values.telefono.tipo}
                  onChange={(e) => setTelefono('tipo', e.target.value)}
                  className={`form-select ${errors['telefono.tipo'] ? 'is-invalid' : ''}`}
                >
                  {TIPOS_TELEFONO.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
                {errors['telefono.tipo'] && (
                  <div className="invalid-feedback">{errors['telefono.tipo']}</div>
                )}
              </div>

              <div className="col-6 col-md-3">
                <label className="form-label fw-semibold">Codigo de area *</label>
                <input
                  value={values.telefono.codigoArea}
                  onChange={(e) => setTelefono('codigoArea', e.target.value)}
                  className={`form-control ${errors['telefono.codigoArea'] ? 'is-invalid' : ''}`}
                  placeholder="Ej: 348"
                />
                {errors['telefono.codigoArea'] && (
                  <div className="invalid-feedback">{errors['telefono.codigoArea']}</div>
                )}
              </div>

              <div className="col-6 col-md-5">
                <label className="form-label fw-semibold">Numero *</label>
                <input
                  value={values.telefono.numero}
                  onChange={(e) => setTelefono('numero', e.target.value)}
                  className={`form-control ${errors['telefono.numero'] ? 'is-invalid' : ''}`}
                />
                {errors['telefono.numero'] && (
                  <div className="invalid-feedback">{errors['telefono.numero']}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm bg-white mb-3" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            <h6 className="fw-bold text-dark mb-3">Obra social</h6>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Obra social</label>
                <ObraSocialSelect
                  value={values.obraSocial}
                  onChange={(value) => {
                    setField('obraSocial', value);
                    if (!value) setField('numeroAfiliado', '');
                  }}
                  placeholder="Sin obra social"
                  className={`form-select ${errors.obraSocial ? 'is-invalid' : ''}`}
                  refreshKey={refreshObras}
                />
                {errors.obraSocial && <div className="invalid-feedback">{errors.obraSocial}</div>}

                {!showNuevaObra ? (
                  <button
                    type="button"
                    className="btn btn-link btn-sm px-0 mt-1 text-decoration-none"
                    style={{ color: '#00ACB2' }}
                    onClick={() => setShowNuevaObra(true)}
                  >
                    + Crear obra social nueva
                  </button>
                ) : (
                  <div className="border rounded-3 p-3 mt-2 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold small">Nueva obra social</span>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Cerrar"
                        onClick={cancelarNuevaObra}
                      />
                    </div>

                    <div className="row g-2">
                      <div className="col-12">
                        <label className="form-label small mb-1 fw-semibold">Nombre *</label>
                        <input
                          value={nuevaObra.nombre}
                          onChange={(e) => setNuevaObraField('nombre', e.target.value)}
                          className={`form-control form-control-sm ${erroresObra.nombre ? 'is-invalid' : ''}`}
                          placeholder="Ej: OSDE"
                        />
                        {erroresObra.nombre && (
                          <div className="invalid-feedback">{erroresObra.nombre}</div>
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small mb-1">Email</label>
                        <input
                          type="email"
                          value={nuevaObra.email}
                          onChange={(e) => setNuevaObraField('email', e.target.value)}
                          className={`form-control form-control-sm ${erroresObra.email ? 'is-invalid' : ''}`}
                          placeholder="opcional"
                        />
                        {erroresObra.email && (
                          <div className="invalid-feedback">{erroresObra.email}</div>
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label small mb-1">Teléfono</label>
                        <input
                          value={nuevaObra.telefono}
                          onChange={(e) => setNuevaObraField('telefono', e.target.value)}
                          className={`form-control form-control-sm ${erroresObra.telefono ? 'is-invalid' : ''}`}
                          placeholder="opcional"
                        />
                        {erroresObra.telefono && (
                          <div className="invalid-feedback">{erroresObra.telefono}</div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={cancelarNuevaObra}
                        disabled={creandoObra}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: '#00ACB2' }}
                        onClick={crearObraSocialRapida}
                        disabled={creandoObra}
                      >
                        {creandoObra ? 'Creando...' : 'Crear y seleccionar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Numero de afiliado</label>
                <input
                  value={values.numeroAfiliado}
                  onChange={(e) => setField('numeroAfiliado', e.target.value)}
                  className="form-control"
                  disabled={!values.obraSocial}
                />
              </div>
            </div>

            {!isEdit && (
              <div className="alert alert-info mt-3 mb-0 py-2 small">
                Se creara un usuario para el paciente con su email. La contrasena inicial sera su DNI.
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel || (() => navigate(-1))}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn text-white fw-semibold d-flex align-items-center gap-2"
            style={{ backgroundColor: '#00ACB2' }}
            disabled={saving}
          >
            <BsSave /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};
