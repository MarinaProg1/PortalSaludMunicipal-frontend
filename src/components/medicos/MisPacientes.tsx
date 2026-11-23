import { useEffect, useState } from "react";
import { atencionService } from "../../services/atencion.service";
import { getPacienteIdDeTurno, getTurnoId, nombrePaciente, dniPaciente, descripciones } from "../medico/atencion.schema";
import type { TurnoAtencion, HistorialClinico, ConsultaMedica } from "../medico/atencion.schema";

export default function MisPacientes() {
  const [turnos, setTurnos] = useState<TurnoAtencion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState<TurnoAtencion | null>(null);
  const [historial, setHistorial] = useState<HistorialClinico | null>(null);
  const [consultas, setConsultas] = useState<ConsultaMedica[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [soloHoy, setSoloHoy] = useState(false);
  const [atendiendo, setAtendiendo] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");
  const [receta, setReceta] = useState("");
  const [obs, setObs] = useState("");
  const [nuevoItem, setNuevoItem] = useState("");
  const [preguntaIA, setPreguntaIA] = useState("");
  const [respuestaIA, setRespuestaIA] = useState("");
  const [sugerenciaIA, setSugerenciaIA] = useState("");

  useEffect(() => {
    atencionService.bandeja("por-atender")
      .then((data) => setTurnos(data))
      .catch((err) => console.error(err))
      .finally(() => setCargando(false));
  }, []);

  const verHistorial = async (turno: TurnoAtencion) => {
    setSeleccionado(turno);
    const pacienteId = getPacienteIdDeTurno(turno);
    if (!pacienteId) return;
    const [h, c] = await Promise.all([
      atencionService.historial(pacienteId),
      atencionService.consultas({ paciente: pacienteId }),
    ]);
    setHistorial(h);
    setConsultas(c);
  };
    // FILTRO - turnos del día + buscar por DNI
const hoy = new Date().toISOString().slice(0, 10);
const turnosFiltrados = turnos.filter((t) => {
  const dni = dniPaciente(t) || "";
  const nombre = nombrePaciente(t).toLowerCase();
  const coincide = dni.includes(busqueda) || nombre.includes(busqueda.toLowerCase());
  const esHoy = soloHoy ? t.fecha === hoy : true;
  return coincide && esHoy;
});

// ATENDER - guardar consulta nueva
const guardarConsulta = () => {
  if (!diagnostico) return alert("Pone el diagnóstico");
  const nueva = {
    fecha: hoy,
    motivo: obs,
    diagnostico,
    receta,
  } as ConsultaMedica;
  setConsultas([...consultas, nueva]);
  setDiagnostico(""); setReceta(""); setObs(""); setAtendiendo(false);
  alert("Consulta guardada en pantalla!");
};

const borrarConsulta = (id: string | undefined) => {
  if (!confirm("¿Borrar esta consulta?")) return;
  setConsultas(consultas.filter((c) => (c.id ?? c._id) !== id));
};

// AGREGAR AL HISTORIAL
const agregarAlHistorial = (campo: "alergias" | "enfermedadesCronicas" | "medicacionActual") => {
  if (!historial || !nuevoItem.trim()) return;
  const listaActual = historial[campo] ?? [];
  const nuevo = {
    ...historial,
    [campo]: [...listaActual, { descripcion: nuevoItem.trim() }],
  };
  setHistorial(nuevo);
  setNuevoItem("");
};
  const generarResumenIA = () => {
  if (!historial) return "Sin historial";
  const alergias = descripciones(historial.alergias).join(", ") || "sin alergias";
  const enf = descripciones(historial.enfermedadesCronicas).join(", ") || "sin enfermedades crónicas";
  const med = descripciones(historial.medicacionActual).join(", ") || "sin medicación";
  return `Paciente ${historial.grupoSanguineo ? `grupo ${historial.grupoSanguineo}, ` : ""}con ${alergias}, ${enf}. Actualmente toma: ${med}. Tiene ${consultas.length} consultas previas.`;
};

const sugerirDiagnosticoIA = () => {
  const texto = obs.toLowerCase();
  if (!texto) return setSugerenciaIA("Escribí los síntomas en Observaciones / Motivo.");
  if (texto.includes("fiebre") && texto.includes("tos")) setSugerenciaIA("Posible: Gripe / Infección respiratoria. Reposo, paracetamol, control 48hs.");
  else if (texto.includes("dolor") && texto.includes("cabeza")) setSugerenciaIA("Posible: Cefalea / Migraña. Evaluar presión, descanso, analgésico.");
  else if (texto.includes("dolor") && texto.includes("garganta")) setSugerenciaIA("Posible: Faringitis. Revisar garganta, descartar angina.");
  else if (texto.includes("vómito") || texto.includes("diarrea")) setSugerenciaIA("Posible: Gastroenteritis. Hidratación, dieta blanda.");
  else if (texto.includes("presión") || texto.includes("mareo")) setSugerenciaIA("Posible: Hipertensión descompensada. Controlar presión, revisar medicación.");
  else setSugerenciaIA("No encontré un patrón claro. Revisá historial y signos vitales.");
};

const preguntarIA = () => {
  if (!preguntaIA.trim() || !historial) return;
  const p = preguntaIA.toLowerCase();
  if (p.includes("alerg")) setRespuestaIA(`OJO: Tiene alergia a: ${descripciones(historial.alergias).join(", ") || "ninguna registrada"}.`);
  else if (p.includes("dar") || p.includes("medic") || p.includes("recet")) setRespuestaIA(`Actualmente toma: ${descripciones(historial.medicacionActual).join(", ") || "sin datos"}. Fijate que no interactúe y que no sea alérgico.`);
  else setRespuestaIA(generarResumenIA());
};

  if (cargando) return <p>Cargando mis pacientes...</p>;
  if (turnos.length === 0) return <p>No tenés pacientes por atender.</p>;

  return (
    <div>
      <h2>Mis pacientes por atender</h2>

      <input placeholder="Buscar por DNI o nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ padding: 8, width: "100%", marginBottom: 10 }} />
      <button onClick={() => setSoloHoy(false)} style={{ marginRight: 8 }}>Ver todos</button>
      <button onClick={() => setSoloHoy(true)}>Ver solo hoy</button>

      {turnosFiltrados.map((t) => (
        <div key={getTurnoId(t)} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <p><b>{nombrePaciente(t)}</b></p>
          <p>DNI: {dniPaciente(t) || "-"}</p>
          <p>Turno: {t.fecha} - {t.hora} - {t.estado}</p>
          <button onClick={() => verHistorial(t)}>Ver historial</button>
        </div>
      ))}

      {seleccionado && (
        <div style={{ border: "2px solid black", padding: 12, marginTop: 20 }}>
          <h3>Historial de {nombrePaciente(seleccionado)}</h3>
          <p><b>Grupo sanguíneo:</b> {historial?.grupoSanguineo || "Sin dato"}</p>
          <p><b>Alergias:</b> {descripciones(historial?.alergias).join(", ") || "Sin alergias"}</p>
          <p><b>Enfermedades crónicas:</b> {descripciones(historial?.enfermedadesCronicas).join(", ") || "Sin datos"}</p>
          <p><b>Medicación actual:</b> {descripciones(historial?.medicacionActual).join(", ") || "Sin datos"}</p>
          <p><b>Antecedentes familiares:</b> {historial?.antecedentesFamiliares || "-"}</p>
          <p><b>Antecedentes quirúrgicos:</b> {historial?.antecedentesQuirurgicos || "-"}</p>
          <p><b>Observaciones:</b> {historial?.observacionesGenerales || "-"}</p>

         <input placeholder="Agregar alergia / enfermedad / medicamento..." value={nuevoItem} onChange={(e) => setNuevoItem(e.target.value)} />
         <button onClick={() => agregarAlHistorial("alergias")}>+ Alergia</button>
         <button onClick={() => agregarAlHistorial("enfermedadesCronicas")}>+ Enfermedad</button>
         <button onClick={() => agregarAlHistorial("medicacionActual")}>+ Medicamento</button>
         <div style={{ border: "2px solid #7b2ff7", padding: 12, marginTop: 15, background: "#f8f0ff" }}>
          <h4>🤖 Ayuda de IA</h4>
         <p><b>Resumen:</b> {generarResumenIA()}</p>
         <button onClick={sugerirDiagnosticoIA} style={{ background: "#7b2ff7", color: "white", padding: "8px 12px" }}>Sugerir diagnóstico según síntomas</button>
          {sugerenciaIA && <p style={{ background: "white", padding: 8 }}>{sugerenciaIA}</p>}
         <input placeholder="Preguntale a la IA ej: ¿A qué es alérgico?" value={preguntaIA} onChange={(e) => setPreguntaIA(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginTop: 10 }} />
         <button onClick={preguntarIA} style={{ marginTop: 5 }}>Preguntar</button>
          {respuestaIA && <p style={{ background: "white", padding: 8, marginTop: 8 }}><b>IA:</b> {respuestaIA}</p>}
         </div>

          <h4>Consultas anteriores</h4>
          {consultas.length === 0 && <p>Sin consultas previas.</p>}
          {consultas.map((c) => (
            <div key={c.id || c._id}>
              <p>{c.fecha} - Motivo: {c.motivo} - Diagnóstico: {c.diagnostico}</p>
              <button onClick={() => borrarConsulta((c.id ?? c._id))}>Borrar</button>
            </div>
          ))}
          {!atendiendo ? (
         <button onClick={() => setAtendiendo(true)} style={{ background: "#2196F3", color: "white", padding: "8px 16px", marginTop: 10 }}>Atender paciente</button>
          ) : (
         <div style={{ marginTop: 15 }}>
           <h4>Nueva consulta</h4>
           <input placeholder="Diagnóstico" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} />
           <input placeholder="Receta" value={receta} onChange={(e) => setReceta(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} />
           <input placeholder="Observaciones / Motivo" value={obs} onChange={(e) => setObs(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} />
           <button onClick={guardarConsulta} style={{ background: "#4CAF50", color: "white", padding: "8px 16px", marginRight: 8 }}>Guardar consulta</button>
           <button onClick={() => setAtendiendo(false)}>Cancelar</button>
         </div>
         )}
        </div>
      )}
    </div>
  );
}