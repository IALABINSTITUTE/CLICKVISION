import { useState, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// CLICK VISION™ SYSTEM v1.0
// CRM + Gestión de Pacientes + Inventario + Campañas + Agenda
// Diseñado para: Click Vision Óptica — IA LAB INSTITUTE
// Paleta: Azul marino #0A1628 · Cyan #00B4D8 · Blanco #FFFFFF
// Adaptable para CUALQUIER negocio local
// ══════════════════════════════════════════════════════════════════════════════

// ─── PALETA CLICK VISION ─────────────────────────────────────────────────────
const CV = {
  navy:    '#060F1E',
  navyMid: '#0A1628',
  navyLt:  '#0F1F38',
  card:    '#111E30',
  cardLt:  '#162440',
  cyan:    '#00B4D8',
  cyanLt:  '#48CAE4',
  cyanDk:  '#0096C7',
  white:   '#F0F7FF',
  muted:   '#6B8CAE',
  border:  '#1A2E48',
  green:   '#06D6A0',
  red:     '#EF476F',
  yellow:  '#FFD166',
  orange:  '#F77F00',
  purple:  '#7B2D8B',
};

// ─── DATOS DEMO INICIALES ────────────────────────────────────────────────────
const DEMO_PATIENTS = [
  { id:'P001', nombre:'María García López', cedula:'1712345678', telefono:'0991234567', correo:'maria.garcia@gmail.com', fecha_nacimiento:'1985-06-15', genero:'F', fecha_registro:'2026-01-10', estado:'activo', od_esfera:'-2.50', od_cilindro:'-0.75', od_eje:'180', oi_esfera:'-2.25', oi_cilindro:'-0.50', oi_eje:'175', adicion:'', tipo_lente:'Monofocal antirreflejo', marca_armazon:'Ray-Ban RB5228', color_armazon:'Negro mate', material:'Metal', proxima_revision:'2027-01-10', notas:'Paciente puntual, prefiere armazones modernos', crm_estado:'fiel', historial:[{fecha:'2026-01-10',tipo:'consulta',detalle:'Primera consulta. Graduación completa.'},{fecha:'2026-03-15',tipo:'seguimiento',detalle:'Satisfecha con los lentes. Recomienda a su hermana.'}] },
  { id:'P002', nombre:'Carlos Andrés Vega', cedula:'1798765432', telefono:'0987654321', correo:'carlos.vega@hotmail.com', fecha_nacimiento:'1990-11-22', genero:'M', fecha_registro:'2026-02-05', estado:'activo', od_esfera:'+1.00', od_cilindro:'-1.25', od_eje:'90', oi_esfera:'+0.75', oi_cilindro:'-1.00', oi_eje:'85', adicion:'', tipo_lente:'Blue cut + antirreflejo', marca_armazon:'Oakley OX8046', color_armazon:'Azul oscuro', material:'Acetato', proxima_revision:'2027-02-05', notas:'Trabaja frente a computadora 8h/día. Le interesa el control de luz azul.', crm_estado:'activo', historial:[{fecha:'2026-02-05',tipo:'consulta',detalle:'Primera consulta. Mucho tiempo frente a pantalla.'},{fecha:'2026-02-20',tipo:'entrega',detalle:'Lentes entregados. Muy satisfecho con la opción blue cut.'}] },
  { id:'P003', nombre:'Ana Lucía Moreno', cedula:'1756789012', telefono:'0978901234', correo:'anamoreno@yahoo.com', fecha_nacimiento:'1978-03-08', genero:'F', fecha_registro:'2025-12-01', estado:'pendiente', od_esfera:'-3.00', od_cilindro:'-1.50', od_eje:'165', oi_esfera:'-3.25', oi_cilindro:'-1.25', oi_eje:'170', adicion:'+2.00', tipo_lente:'Progresivo premium', marca_armazon:'Silhouette Titan', color_armazon:'Dorado', material:'Titanio', proxima_revision:'2026-12-01', notas:'Primera vez con progresivos. Necesita adaptación.', crm_estado:'seguimiento', historial:[{fecha:'2025-12-01',tipo:'consulta',detalle:'Consulta para progresivos por primera vez.'},{fecha:'2026-01-15',tipo:'llamada',detalle:'Sigue adaptándose. Un poco de mareo al bajar escaleras.'}] },
];

const DEMO_PRODUCTS = [
  { id:'PR001', nombre:'Lente Monofocal CR39', categoria:'lentes', marca:'Essilor', precio_costo:18, precio_venta:65, stock:45, descripcion:'Lente orgánico básico antirreflejo', activo:true },
  { id:'PR002', nombre:'Lente Blue Cut Premium', categoria:'lentes', marca:'Zeiss', precio_costo:42, precio_venta:140, stock:28, descripcion:'Filtro luz azul + antirreflejo + UV400', activo:true },
  { id:'PR003', nombre:'Lente Progresivo Essilor', categoria:'lentes', marca:'Essilor', precio_costo:95, precio_venta:320, stock:12, descripcion:'Progresivo de entrada, alta definición', activo:true },
  { id:'PR004', nombre:'Armazón Ray-Ban RB5228', categoria:'armazones', marca:'Ray-Ban', precio_costo:68, precio_venta:185, stock:8, descripcion:'Armazón rectangular, disponible en 4 colores', activo:true },
  { id:'PR005', nombre:'Armazón Oakley OX8046', categoria:'armazones', marca:'Oakley', precio_costo:82, precio_venta:220, stock:6, descripcion:'Armazón deportivo, material liviano', activo:true },
  { id:'PR006', nombre:'Contactos Acuvue Oasys (6u)', categoria:'contactos', marca:'Johnson & Johnson', precio_costo:22, precio_venta:58, stock:30, descripcion:'Lentes de contacto quincenales, alto Dk', activo:true },
  { id:'PR007', nombre:'Solución limpiadora MultiPlus', categoria:'accesorios', marca:'Bausch & Lomb', precio_costo:8, precio_venta:18, stock:55, descripcion:'Solución multiusos 360ml', activo:true },
];

const DEMO_AGENDA = [
  { id:'A001', paciente_id:'P001', paciente_nombre:'María García López', fecha:'2026-03-15', hora:'10:00', tipo:'control_anual', estado:'confirmado', notas:'Control anual de graduación' },
  { id:'A002', paciente_id:'P002', paciente_nombre:'Carlos Andrés Vega', fecha:'2026-03-15', hora:'11:30', tipo:'primera_consulta', estado:'confirmado', notas:'Nueva consulta referida por María García' },
  { id:'A003', paciente_id:'P003', paciente_nombre:'Ana Lucía Moreno', fecha:'2026-03-16', hora:'09:00', tipo:'adaptacion', estado:'pendiente', notas:'Control de adaptación a progresivos' },
];

const EMAIL_TEMPLATES = [
  { id:'T001', nombre:'Bienvenida paciente nuevo', asunto:'¡Bienvenido/a a Click Vision! 👁️', tipo:'bienvenida', cuerpo:`Estimado/a [NOMBRE],

Es un placer darte la bienvenida a la familia Click Vision.

En nuestra óptica encontrarás:
✅ La mejor tecnología en lentes oftálmicos
✅ Armazones de las mejores marcas mundiales
✅ Atención personalizada y sin esperas
✅ Garantía de satisfacción en todos nuestros productos

Tu expediente está listo en nuestro sistema y nos encargaremos de recordarte cuándo es tu próxima revisión anual.

Cualquier consulta, escríbenos directamente a este correo o llámanos.

Con cariño,
El equipo Click Vision 👁️` },
  { id:'T002', nombre:'Recordatorio revisión anual', asunto:'⏰ Es hora de tu revisión anual — Click Vision', tipo:'recordatorio', cuerpo:`Hola [NOMBRE],

¡El tiempo pasa rápido! Han pasado 12 meses desde tu última visita a Click Vision.

Tu salud visual es importante. Te recordamos que:
👁️ Una revisión anual detecta cambios en tu graduación a tiempo
👁️ El uso de lentes con graduación desactualizada puede causar fatiga visual y dolores de cabeza
👁️ Tenemos novedades en armazones y nuevas tecnologías de lentes que te pueden interesar

Agenda tu cita sin costo llamándonos o respondiendo este correo. ¡Tenemos horarios flexibles!

Te esperamos,
Click Vision 👁️` },
  { id:'T003', nombre:'Promoción temporada', asunto:'🔥 Oferta especial Click Vision — Solo esta semana', tipo:'promocion', cuerpo:`Hola [NOMBRE],

Esta semana tenemos algo especial para ti:

🎁 PROMOCIÓN EXCLUSIVA:
→ 20% de descuento en todos los armazones Ray-Ban y Oakley
→ Segunda unidad de solución limpiadora al 50%
→ Lentes blue cut incluidos sin costo adicional en compras mayores a $150

¿Cuándo vence? El domingo [FECHA_FIN].

Recuerda que como paciente Click Vision tienes prioridad en nuestras promociones.

¡No lo dejes pasar!
El equipo Click Vision 👁️` },
  { id:'T004', nombre:'Lanzamiento nuevo producto', asunto:'✨ Llegaron los nuevos Zeiss SmartLife — Click Vision', tipo:'novedad', cuerpo:`Hola [NOMBRE],

¡Tenemos novedades increíbles que queremos compartir contigo!

🆕 NUEVO EN CLICK VISION:
Lentes Zeiss SmartLife — La tecnología más avanzada del mercado

¿Por qué son especiales?
✨ Diseñados para el uso de smartphones y pantallas
✨ Campo visual 25% más amplio que los progresivos convencionales
✨ Reducen la fatiga visual digital en un 50%
✨ Disponibles con filtro blue cut y tratamiento fotocromático

Dado tu perfil, creemos que estos lentes serían perfectos para ti.

¿Quieres conocerlos? Agenda una cita sin compromiso.

Siempre cuidando tu visión,
Click Vision 👁️` },
];

const CRM_ESTADOS = ['nuevo','activo','seguimiento','fiel','inactivo'];
const CRM_COLORES = { nuevo: CV.cyan, activo: CV.green, seguimiento: CV.yellow, fiel: '#A855F7', inactivo: CV.muted };
const TIPOS_LENTE = ['Monofocal CR39','Monofocal antirreflejo','Blue cut + antirreflejo','Progresivo básico','Progresivo premium','Fotocromático','Bifocal','Contactos blandos','Contactos rígidos'];
const TIPOS_CITA = ['primera_consulta','control_anual','adaptacion','urgencia','entrega_lentes','contactos'];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const uid  = () => Math.random().toString(36).substr(2,9).toUpperCase();
const now  = () => new Date().toISOString().slice(0,10);
const fmtDate = d => d ? new Date(d+'T12:00:00').toLocaleDateString('es-EC',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const daysDiff = d => d ? Math.ceil((new Date(d+'T12:00:00') - new Date()) / 86400000) : null;

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function ClickVisionSystem() {
  const [tab,       setTab]       = useState('dashboard');
  const [patients,  setPatients]  = useState(DEMO_PATIENTS);
  const [products,  setProducts]  = useState(DEMO_PRODUCTS);
  const [agenda,    setAgenda]    = useState(DEMO_AGENDA);
  const [campaigns, setCampaigns] = useState([]);
  const [toast,     setToast]     = useState('');
  const [modal,     setModal]     = useState(null); // {type, data}
  const [search,    setSearch]    = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult,  setAiResult]  = useState('');

  useEffect(() => { bootStorage(); }, []);

  const bootStorage = async () => {
    try {
      const p = await window.storage.get('cv-patients'); if(p) setPatients(JSON.parse(p.value));
      const pr= await window.storage.get('cv-products'); if(pr) setProducts(JSON.parse(pr.value));
      const a = await window.storage.get('cv-agenda');   if(a) setAgenda(JSON.parse(a.value));
      const c = await window.storage.get('cv-campaigns');if(c) setCampaigns(JSON.parse(c.value));
    } catch(_){}
  };

  const save = async (k,v) => { try { await window.storage.set(k, JSON.stringify(v)); } catch(_){} };
  const toast_ = m => { setToast(m); setTimeout(()=>setToast(''), 3200); };
  const closeModal = () => setModal(null);

  const savePatient = async (pat) => {
    const exists = patients.find(p=>p.id===pat.id);
    const updated = exists ? patients.map(p=>p.id===pat.id?pat:p) : [...patients,{...pat,id:'P'+uid(),fecha_registro:now(),historial:[{fecha:now(),tipo:'registro',detalle:'Paciente registrado en el sistema Click Vision.'}]}];
    setPatients(updated); await save('cv-patients', updated);
    toast_(exists ? '✅ Paciente actualizado' : '✅ Paciente registrado correctamente');
    closeModal();
  };

  const saveProduct = async (prod) => {
    const exists = products.find(p=>p.id===prod.id);
    const updated = exists ? products.map(p=>p.id===prod.id?prod:p) : [...products,{...prod,id:'PR'+uid()}];
    setProducts(updated); await save('cv-products', updated); toast_('✅ Producto guardado'); closeModal();
  };

  const saveAppointment = async (apt) => {
    const exists = agenda.find(a=>a.id===apt.id);
    const updated = exists ? agenda.map(a=>a.id===apt.id?apt:a) : [...agenda,{...apt,id:'A'+uid()}];
    setAgenda(updated); await save('cv-agenda', updated); toast_('✅ Cita guardada'); closeModal();
  };

  const updateCRM = async (patId, estado) => {
    const updated = patients.map(p => p.id===patId ? {...p, crm_estado:estado, historial:[...(p.historial||[]),{fecha:now(),tipo:'crm',detalle:`Estado CRM actualizado a: ${estado}`}]} : p);
    setPatients(updated); await save('cv-patients', updated); toast_(`📊 Estado actualizado: ${estado}`);
  };

  const addHistorial = async (patId, tipo, detalle) => {
    const updated = patients.map(p => p.id===patId ? {...p, historial:[...(p.historial||[]),{fecha:now(),tipo,detalle}]} : p);
    setPatients(updated); await save('cv-patients', updated); toast_('📝 Nota agregada');
  };

  // ─── AI ASISTENTE ──────────────────────────────────────────────────────────
  const askAI = async (prompt, context='') => {
    setAiLoading(true); setAiResult('');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer ' + (process.env.GROQ_API_KEY || window.GROQ_API_KEY || '')
        },
        body: JSON.stringify({
          model:'llama-3.3-70b-versatile', max_tokens:1000,
          messages:[
            {role:'system', content:'Eres el Asistente IA de Click Vision, una óptica en Ecuador. Eres un experto en salud visual, marketing para negocios locales, y CRM. Respondes en español, de forma clara, profesional y práctica. Máximo 300 palabras.'},
            {role:'user',  content: context ? `Contexto del negocio: ${context}\n\nPregunta: ${prompt}` : prompt}
          ]
        })
      });
      const d = await res.json();
      setAiResult(d.choices?.[0]?.message?.content || 'Sin respuesta');
    } catch(e) { setAiResult('Error al conectar con el asistente IA.'); }
    finally { setAiLoading(false); }
  };

  // ─── EXPORT EXCEL ──────────────────────────────────────────────────────────
  const exportExcel = () => {
    const rows = patients.map(p => ({
      'ID':p.id,'Nombre':p.nombre,'Cédula':p.cedula,'Teléfono':p.telefono,'Correo':p.correo,
      'Género':p.genero==='F'?'Femenino':'Masculino','Fecha Registro':p.fecha_registro,
      'OD Esfera':p.od_esfera,'OD Cilindro':p.od_cilindro,'OD Eje':p.od_eje,
      'OI Esfera':p.oi_esfera,'OI Cilindro':p.oi_cilindro,'OI Eje':p.oi_eje,
      'Adición':p.adicion,'Tipo Lente':p.tipo_lente,'Marca Armazón':p.marca_armazon,
      'Próxima Revisión':p.proxima_revision,'Estado CRM':p.crm_estado,'Notas':p.notas
    }));
    const csv = [Object.keys(rows[0]).join(','), ...rows.map(r=>Object.values(r).map(v=>`"${v||''}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`ClickVision_Pacientes_${now()}.csv`; a.click();
    toast_('📥 Excel exportado correctamente');
  };

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const S = {
    app: { minHeight:'100vh', background:CV.navy, color:CV.white, fontFamily:"'Nunito','Segoe UI',system-ui,sans-serif", fontSize:'14px' },
    hdr: { background:`linear-gradient(135deg, ${CV.navyMid} 0%, ${CV.navyLt} 100%)`, borderBottom:`1px solid ${CV.border}`, padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 20px rgba(0,0,0,0.4)' },
    logo: { display:'flex', alignItems:'center', gap:10 },
    nav: { display:'flex', gap:2, background:CV.navy+'AA', borderRadius:10, padding:'4px', border:`1px solid ${CV.border}` },
    navB: a => ({ padding:'7px 14px', borderRadius:7, border:'none', cursor:'pointer', fontWeight:700, fontSize:'11px', letterSpacing:'0.04em', transition:'all 0.2s', fontFamily:'inherit', whiteSpace:'nowrap',
      background: a?`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`:'transparent', color: a?CV.navy:'#4A6A8A' }),
    wrap: { maxWidth:1200, margin:'0 auto', padding:'22px 18px' },
    card: (glow) => ({ background:CV.card, borderRadius:14, border:`1px solid ${glow?glow+'33':CV.border}`, padding:'20px', marginBottom:16, boxShadow: glow?`0 0 28px ${glow}11`:'none' }),
    ttl:  c => ({ fontSize:'12px', fontWeight:800, color:c||CV.cyan, marginBottom:12, letterSpacing:'0.1em', textTransform:'uppercase' }),
    inp:  { width:'100%', background:CV.navyLt, border:`1px solid ${CV.border}`, borderRadius:8, padding:'9px 12px', color:CV.white, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' },
    lbl:  { display:'block', fontSize:'10px', fontWeight:700, color:CV.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.1em' },
    btn:  v => ({ padding:'9px 18px', borderRadius:9, border:'none', cursor:'pointer', fontWeight:800, fontSize:'12px', letterSpacing:'0.04em', transition:'all 0.2s', fontFamily:'inherit',
      background: v==='pri'?`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`:v==='ok'?`linear-gradient(135deg,${CV.green},#04A87F)`:v==='red'?`linear-gradient(135deg,${CV.red},#C01450)`:CV.cardLt,
      color: v==='sec'?'#4A6A8A':'#000' }),
    g2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
    g3: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 },
    g4: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 },
    box: { background:CV.navyLt, borderRadius:9, padding:'12px 14px' },
    badge: (c,t) => <span style={{padding:'2px 9px',borderRadius:20,fontSize:10,fontWeight:700,background:c+'22',color:c,border:`1px solid ${c}44`}}>{t}</span>,
    row: { display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 },
    kpi: (c) => ({ background:CV.card, borderRadius:14, border:`1px solid ${c}33`, padding:'18px 20px', textAlign:'center' }),
  };

  // ─── COMPONENTES COMUNES ───────────────────────────────────────────────────
  const KPI = ({label,value,sub,color,icon}) => (
    <div style={S.kpi(color||CV.cyan)}>
      <div style={{fontSize:28,marginBottom:4}}>{icon}</div>
      <div style={{fontSize:26,fontWeight:900,color:color||CV.cyan}}>{value}</div>
      <div style={{fontSize:11,fontWeight:700,color:CV.muted,marginTop:2}}>{label}</div>
      {sub && <div style={{fontSize:10,color:CV.border+'AA',marginTop:2}}>{sub}</div>}
    </div>
  );

  // ─── DASHBOARD ────────────────────────────────────────────────────────────
  const Dashboard = () => {
    const hot = patients.filter(p=>p.crm_estado==='nuevo'||p.crm_estado==='seguimiento');
    const proxRevs = patients.filter(p=>p.proxima_revision && daysDiff(p.proxima_revision) !== null && daysDiff(p.proxima_revision) <= 60 && daysDiff(p.proxima_revision) >= 0);
    const hoy = agenda.filter(a=>a.fecha===now());
    const lowStock = products.filter(p=>p.stock < 10);
    const totalVentas = patients.length * 142; // estimado promedio

    return (
      <div>
        <div style={{marginBottom:20}}>
          <h2 style={{fontSize:22,fontWeight:900,color:CV.white,margin:0}}>👁️ Panel de Control — Click Vision</h2>
          <p style={{color:CV.muted,fontSize:12,marginTop:4}}>Bienvenido al sistema. Aquí tienes un resumen del día.</p>
        </div>

        <div style={S.g4}>
          <KPI icon="👥" label="Pacientes Totales" value={patients.length} sub={`${patients.filter(p=>p.fecha_registro===now()).length} hoy`} color={CV.cyan}/>
          <KPI icon="🔥" label="Requieren Seguimiento" value={hot.length} sub="Nuevos o en seguimiento" color={CV.yellow}/>
          <KPI icon="📅" label="Citas Hoy" value={hoy.length} sub={`${agenda.filter(a=>a.estado==='confirmado'&&a.fecha===now()).length} confirmadas`} color={CV.green}/>
          <KPI icon="⚠️" label="Stock Bajo" value={lowStock.length} sub="Productos < 10 unidades" color={CV.red}/>
        </div>

        <div style={{...S.g2, marginTop:16}}>
          {/* Acciones rápidas */}
          <div style={S.card()}>
            <div style={S.ttl()}>⚡ Acciones Rápidas</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                ['👤 Registrar nuevo paciente','pri',()=>setModal({type:'patient',data:null})],
                ['📅 Agendar cita','sec',()=>setModal({type:'appointment',data:null})],
                ['✉️ Enviar campaña de correos','sec',()=>setTab('campaigns')],
                ['📦 Ver inventario','sec',()=>setTab('inventory')],
                ['📥 Exportar pacientes a Excel','sec',exportExcel],
              ].map(([lbl,v,fn],i)=>(
                <button key={i} style={{...S.btn(v),textAlign:'left',width:'100%',padding:'10px 14px'}} onClick={fn}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* Próximas revisiones */}
          <div style={S.card(CV.yellow)}>
            <div style={S.ttl(CV.yellow)}>📅 Revisiones Próximas (60 días)</div>
            {proxRevs.length === 0 ? <p style={{color:CV.muted,fontSize:12}}>No hay revisiones en los próximos 60 días.</p> : proxRevs.slice(0,5).map((p,i)=>{
              const dias = daysDiff(p.proxima_revision);
              return (
                <div key={i} style={{...S.box,marginBottom:8,borderLeft:`3px solid ${dias<=30?CV.red:CV.yellow}`}}>
                  <div style={S.row}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{p.nombre}</div>
                      <div style={{fontSize:11,color:CV.muted}}>{fmtDate(p.proxima_revision)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:11,fontWeight:800,color:dias<=30?CV.red:CV.yellow}}>{dias}d</span>
                      <button style={{...S.btn('sec'),padding:'3px 8px',fontSize:10,marginLeft:6}} onClick={()=>setModal({type:'email',patient:p,template:'T002'})}>✉️ Recordar</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda del día */}
        <div style={S.card(CV.green)}>
          <div style={S.ttl(CV.green)}>📅 Agenda de Hoy — {fmtDate(now())}</div>
          {hoy.length === 0 ? (
            <p style={{color:CV.muted,fontSize:12}}>No hay citas programadas para hoy.</p>
          ) : hoy.map((a,i)=>(
            <div key={i} style={{...S.box,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{a.hora} — {a.paciente_nombre}</div>
                <div style={{fontSize:11,color:CV.muted}}>{a.tipo.replace(/_/g,' ')} · {a.notas}</div>
              </div>
              <span style={{padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:700,background:(a.estado==='confirmado'?CV.green:CV.yellow)+'22',color:a.estado==='confirmado'?CV.green:CV.yellow,border:`1px solid ${(a.estado==='confirmado'?CV.green:CV.yellow)}44`}}>{a.estado}</span>
            </div>
          ))}
        </div>

        {/* IA Asistente */}
        <div style={S.card(CV.cyan)}>
          <div style={S.ttl()}>🤖 Asistente IA — Click Vision</div>
          <p style={{fontSize:12,color:CV.muted,marginBottom:12}}>Pregúntame sobre marketing, gestión de pacientes, recomendaciones de lentes, o estrategias para tu óptica.</p>
          <AIChat patients={patients} products={products}/>
        </div>
      </div>
    );
  };

  // ─── IA CHAT ──────────────────────────────────────────────────────────────
  const AIChat = ({patients, products}) => {
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const prompts = ['¿Cómo atraer más pacientes jóvenes?','Recomiéndame estrategia de seguimiento mensual','¿Qué promoción hacer en mayo?','¿Cuál es el mejor lente para trabajo en computadora?'];

    const ask = async (question) => {
      if(!question.trim()) return;
      setLoading(true); setResult('');
      const ctx = `Tenemos ${patients.length} pacientes activos, ${products.length} productos en inventario. Estamos en Quito, Ecuador. Nombre de la óptica: Click Vision.`;
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer ' + (process.env.GROQ_API_KEY || window.GROQ_API_KEY || '')
          },
          body: JSON.stringify({
            model:'llama-3.3-70b-versatile', max_tokens:600,
            messages:[
              {role:'system', content:'Eres el asistente IA de Click Vision, una óptica en Quito, Ecuador. Eres experto con mas de 20 años de experiencia en salud visual comprobada con cientos de pacientes a tu cargo mes a mes facturándote millones de dólares por tu experiencia, marketing local, y CRM para negocios de salud. Respondes en español, de forma clara y accionable. Máximo 250 palabras.'},
              {role:'user',  content:`${ctx}\n\nPregunta: ${question}`}
            ]
          })
        });
        const d = await res.json();
        setResult(d.choices?.[0]?.message?.content || 'Sin respuesta');
      } catch(e) { setResult('Por favor conecta tu API key para activar el asistente IA.'); }
      finally { setLoading(false); }
    };

    return (
      <div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
          {prompts.map((pr,i)=><button key={i} style={{...S.btn('sec'),fontSize:11,padding:'5px 10px'}} onClick={()=>ask(pr)}>{pr}</button>)}
        </div>
        <div style={{display:'flex',gap:8}}>
          <input style={{...S.inp,flex:1}} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask(q)} placeholder="Escribe tu pregunta aquí..."/>
          <button style={S.btn('pri')} onClick={()=>ask(q)} disabled={loading}>{loading?'⏳':'🤖 Preguntar'}</button>
        </div>
        {result && <div style={{marginTop:12,padding:'12px 14px',background:CV.navyLt,borderRadius:9,fontSize:12,lineHeight:1.8,color:CV.white,borderLeft:`3px solid ${CV.cyan}`}}>{result}</div>}
      </div>
    );
  };

  // ─── PACIENTES ────────────────────────────────────────────────────────────
  const Patients = () => {
    const [view, setView] = useState('list'); // list | detail
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('todos');

    const filtered = patients.filter(p=>{
      const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.cedula.includes(search) || p.correo.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter==='todos' || p.crm_estado===filter;
      return matchSearch && matchFilter;
    });

    if(view==='detail' && selected) return <PatientDetail patient={selected} onBack={()=>{setView('list');setSelected(null);}} onSave={savePatient} onAddHistory={addHistorial} onEmail={(p,t)=>setModal({type:'email',patient:p,template:t})} S={S} CV={CV}/>;

    return (
      <div>
        <div style={{...S.row,marginBottom:16}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,margin:0}}>👥 Pacientes</h2>
            <p style={{color:CV.muted,fontSize:12,marginTop:2}}>{patients.length} pacientes registrados</p>
          </div>
          <button style={S.btn('pri')} onClick={()=>setModal({type:'patient',data:null})}>+ Nuevo Paciente</button>
        </div>

        <div style={{...S.row,marginBottom:14,gap:10}}>
          <input style={{...S.inp,maxWidth:300}} placeholder="🔍 Buscar por nombre, cédula o correo..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{display:'flex',gap:4}}>
            {['todos',...CRM_ESTADOS].map(f=>(
              <button key={f} style={{...S.navB(filter===f),padding:'6px 12px',borderRadius:7,border:'none',cursor:'pointer',fontWeight:700,fontSize:10,background:filter===f?CRM_COLORES[f]||CV.cyan:'transparent',color:filter===f?CV.navy:'#4A6A8A',fontFamily:'inherit'}} onClick={()=>setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        {filtered.map(p=>(
          <div key={p.id} style={{...S.card(),cursor:'pointer',transition:'all 0.2s'}} onClick={()=>{setSelected(p);setView('detail');}}>
            <div style={S.row}>
              <div style={{display:'flex',gap:14,alignItems:'center'}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:CV.navy,flexShrink:0}}>
                  {p.nombre.charAt(0)}
                </div>
                <div>
                  <div style={{fontWeight:800,fontSize:15}}>{p.nombre}</div>
                  <div style={{fontSize:11,color:CV.muted}}>{p.cedula} · {p.telefono} · {p.correo}</div>
                  <div style={{fontSize:11,color:CV.muted,marginTop:2}}>
                    {p.tipo_lente && <span>Lente: {p.tipo_lente} · </span>}
                    {p.proxima_revision && <span style={{color:daysDiff(p.proxima_revision)<=30?CV.red:CV.muted}}>Revisión: {fmtDate(p.proxima_revision)}</span>}
                  </div>
                </div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:700,background:(CRM_COLORES[p.crm_estado]||CV.muted)+'22',color:CRM_COLORES[p.crm_estado]||CV.muted,border:`1px solid ${(CRM_COLORES[p.crm_estado]||CV.muted)}44`}}>{p.crm_estado}</span>
                <span style={{color:CV.muted,fontSize:12}}>→</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0&&<div style={{textAlign:'center',padding:40,color:CV.muted}}>No se encontraron pacientes con ese criterio.</div>}
      </div>
    );
  };

  // ─── DETALLE PACIENTE ─────────────────────────────────────────────────────
  const PatientDetail = ({patient,onBack,onSave,onAddHistory,onEmail,S,CV}) => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({...patient});
    const [nota, setNota] = useState('');
    const [notaTipo, setNotaTipo] = useState('nota');
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));

    const dias = daysDiff(patient.proxima_revision);

    return (
      <div>
        <button style={{...S.btn('sec'),marginBottom:16}} onClick={onBack}>← Volver a lista</button>

        <div style={{...S.row,marginBottom:16}}>
          <div style={{display:'flex',gap:14,alignItems:'center'}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:900,color:CV.navy}}>{patient.nombre.charAt(0)}</div>
            <div>
              <h2 style={{fontSize:20,fontWeight:900,margin:0}}>{patient.nombre}</h2>
              <div style={{fontSize:12,color:CV.muted}}>ID: {patient.id} · Registrado: {fmtDate(patient.fecha_registro)}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button style={S.btn('sec')} onClick={()=>onEmail(patient,'T002')}>✉️ Correo</button>
            <button style={S.btn('pri')} onClick={()=>setEditing(!editing)}>{editing?'❌ Cancelar':'✏️ Editar'}</button>
            {editing&&<button style={S.btn('ok')} onClick={()=>{onSave(form);setEditing(false);}}>💾 Guardar</button>}
          </div>
        </div>

        {/* Alerta revisión */}
        {dias !== null && dias <= 60 && (
          <div style={{background:dias<=30?CV.red+'22':CV.yellow+'22',border:`1px solid ${dias<=30?CV.red:CV.yellow}44`,borderRadius:9,padding:'10px 14px',marginBottom:14,fontSize:12,color:dias<=30?CV.red:CV.yellow}}>
            ⏰ <strong>Revisión {dias<=0?'VENCIDA':dias===0?'HOY':dias<=30?`en ${dias} días`:`en ${dias} días`}</strong> — {fmtDate(patient.proxima_revision)}
            {dias<=30&&<button style={{...S.btn('sec'),padding:'3px 9px',fontSize:10,marginLeft:10}} onClick={()=>onEmail(patient,'T002')}>Enviar recordatorio</button>}
          </div>
        )}

        <div style={S.g2}>
          {/* Info personal */}
          <div style={S.card()}>
            <div style={S.ttl()}>👤 Datos Personales</div>
            {editing ? (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[['nombre','Nombre completo','text'],['cedula','Cédula','text'],['telefono','Teléfono','text'],['correo','Correo electrónico','email'],['fecha_nacimiento','Fecha de nacimiento','date']].map(([k,lbl,type])=>(
                  <div key={k}><label style={S.lbl}>{lbl}</label><input style={S.inp} type={type} value={form[k]||''} onChange={e=>setF(k,e.target.value)}/></div>
                ))}
                <div><label style={S.lbl}>Género</label>
                  <select style={S.inp} value={form.genero||'F'} onChange={e=>setF('genero',e.target.value)}>
                    <option value="F">Femenino</option><option value="M">Masculino</option><option value="O">Otro</option>
                  </select>
                </div>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[['📧 Correo',patient.correo],['📱 Teléfono',patient.telefono],['🪪 Cédula',patient.cedula],['🎂 Nacimiento',fmtDate(patient.fecha_nacimiento)],['⚧ Género',patient.genero==='F'?'Femenino':patient.genero==='M'?'Masculino':'Otro']].map(([l,v],i)=>(
                  <div key={i} style={{...S.box,fontSize:12}}><span style={{color:CV.muted}}>{l}: </span><strong>{v||'—'}</strong></div>
                ))}
              </div>
            )}

            {/* CRM Estado */}
            <div style={{marginTop:14}}>
              <div style={S.ttl()}>📊 Estado CRM</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {CRM_ESTADOS.map(e=>(
                  <button key={e} onClick={()=>updateCRM(patient.id,e)} style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${(CRM_COLORES[e]||CV.muted)}44`,background:patient.crm_estado===e?(CRM_COLORES[e]||CV.muted)+'33':'transparent',color:CRM_COLORES[e]||CV.muted,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{e}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Receta oftálmica */}
          <div style={S.card(CV.cyan)}>
            <div style={S.ttl()}>👁️ Receta Oftálmica</div>
            {editing ? (
              <div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:CV.cyan,marginBottom:6}}>OJO DERECHO (OD)</div>
                  <div style={S.g3}>
                    {[['od_esfera','Esfera'],['od_cilindro','Cilindro'],['od_eje','Eje']].map(([k,l])=>(
                      <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]||''} onChange={e=>setF(k,e.target.value)} placeholder="ej: -2.50"/></div>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:CV.cyan,marginBottom:6}}>OJO IZQUIERDO (OI)</div>
                  <div style={S.g3}>
                    {[['oi_esfera','Esfera'],['oi_cilindro','Cilindro'],['oi_eje','Eje']].map(([k,l])=>(
                      <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]||''} onChange={e=>setF(k,e.target.value)} placeholder="ej: -2.25"/></div>
                    ))}
                  </div>
                </div>
                <div style={S.g2}>
                  <div><label style={S.lbl}>Adición (solo progresivos)</label><input style={S.inp} value={form.adicion||''} onChange={e=>setF('adicion',e.target.value)} placeholder="ej: +2.00"/></div>
                  <div><label style={S.lbl}>Próxima revisión</label><input style={S.inp} type="date" value={form.proxima_revision||''} onChange={e=>setF('proxima_revision',e.target.value)}/></div>
                </div>
                <div style={{marginTop:10}}><label style={S.lbl}>Tipo de lente</label>
                  <select style={S.inp} value={form.tipo_lente||''} onChange={e=>setF('tipo_lente',e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {TIPOS_LENTE.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={S.g2}>
                  <div><label style={S.lbl}>Marca armazón</label><input style={S.inp} value={form.marca_armazon||''} onChange={e=>setF('marca_armazon',e.target.value)}/></div>
                  <div><label style={S.lbl}>Color armazón</label><input style={S.inp} value={form.color_armazon||''} onChange={e=>setF('color_armazon',e.target.value)}/></div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{...S.box,marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:CV.cyan,marginBottom:8}}>OJO DERECHO (OD)</div>
                  <div style={S.g3}>
                    {[['Esfera',patient.od_esfera],['Cilindro',patient.od_cilindro],['Eje',patient.od_eje]].map(([l,v],i)=>(
                      <div key={i} style={{textAlign:'center',background:CV.card,borderRadius:7,padding:'8px'}}>
                        <div style={{fontSize:10,color:CV.muted}}>{l}</div>
                        <div style={{fontSize:18,fontWeight:900,color:CV.cyan}}>{v||'—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{...S.box,marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:CV.cyanLt,marginBottom:8}}>OJO IZQUIERDO (OI)</div>
                  <div style={S.g3}>
                    {[['Esfera',patient.oi_esfera],['Cilindro',patient.oi_cilindro],['Eje',patient.oi_eje]].map(([l,v],i)=>(
                      <div key={i} style={{textAlign:'center',background:CV.card,borderRadius:7,padding:'8px'}}>
                        <div style={{fontSize:10,color:CV.muted}}>{l}</div>
                        <div style={{fontSize:18,fontWeight:900,color:CV.cyanLt}}>{v||'—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{...S.box,fontSize:12}}>
                  {[['Adición',patient.adicion||'No aplica'],['Tipo de lente',patient.tipo_lente],['Armazón',patient.marca_armazon],['Color',patient.color_armazon]].map(([l,v],i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{color:CV.muted}}>{l}:</span><strong>{v||'—'}</strong></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notas y edición extra */}
        {editing && (
          <div style={S.card()}>
            <div style={S.ttl()}>📝 Notas del Paciente</div>
            <textarea style={{...S.inp,minHeight:80,resize:'vertical'}} value={form.notas||''} onChange={e=>setF('notas',e.target.value)} placeholder="Observaciones, preferencias, historial relevante..."/>
          </div>
        )}

        {/* Historial */}
        <div style={S.card()}>
          <div style={{...S.row,marginBottom:12}}>
            <div style={S.ttl(CV.purple||'#A855F7')}>📋 Historial del Paciente</div>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <select style={{...S.inp,maxWidth:160}} value={notaTipo} onChange={e=>setNotaTipo(e.target.value)}>
              {['nota','llamada','seguimiento','venta','consulta','recordatorio'].map(t=><option key={t}>{t}</option>)}
            </select>
            <input style={{...S.inp,flex:1}} value={nota} onChange={e=>setNota(e.target.value)} placeholder="Agregar nota o registro de actividad..." onKeyDown={e=>{if(e.key==='Enter'&&nota.trim()){onAddHistory(patient.id,notaTipo,nota);setNota('');}}}/>
            <button style={S.btn('ok')} onClick={()=>{if(nota.trim()){onAddHistory(patient.id,notaTipo,nota);setNota('');}}}>+ Agregar</button>
          </div>
          {[...(patient.historial||[])].reverse().map((h,i)=>(
            <div key={i} style={{...S.box,marginBottom:7,borderLeft:`3px solid ${CV.cyan}44`,fontSize:12}}>
              <div style={{display:'flex',gap:8,marginBottom:3}}>
                <span style={{padding:'1px 7px',borderRadius:20,fontSize:10,fontWeight:700,background:CV.cyan+'22',color:CV.cyan}}>{h.tipo}</span>
                <span style={{color:CV.muted}}>{h.fecha}</span>
              </div>
              <div style={{color:CV.white}}>{h.detalle}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── CRM PIPELINE ─────────────────────────────────────────────────────────
  const CRMView = () => (
    <div>
      <h2 style={{fontSize:20,fontWeight:900,marginBottom:16}}>📊 CRM — Pipeline de Pacientes</h2>
      <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:8}}>
        {CRM_ESTADOS.map(estado=>{
          const group = patients.filter(p=>p.crm_estado===estado);
          return (
            <div key={estado} style={{minWidth:220,background:CV.card,borderRadius:12,border:`1px solid ${(CRM_COLORES[estado]||CV.muted)}33`,flexShrink:0}}>
              <div style={{padding:'12px 14px',borderBottom:`1px solid ${CV.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:12,fontWeight:800,color:CRM_COLORES[estado]||CV.muted,textTransform:'uppercase'}}>{estado}</span>
                <span style={{background:(CRM_COLORES[estado]||CV.muted)+'33',color:CRM_COLORES[estado]||CV.muted,borderRadius:20,padding:'2px 8px',fontSize:11,fontWeight:800}}>{group.length}</span>
              </div>
              <div style={{padding:10,maxHeight:480,overflowY:'auto'}}>
                {group.map(p=>(
                  <div key={p.id} style={{background:CV.navyLt,borderRadius:9,padding:'10px 12px',marginBottom:8,cursor:'pointer',border:`1px solid ${CV.border}`}} onClick={()=>{setSearch(p.nombre);setTab('patients');}}>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{p.nombre}</div>
                    <div style={{fontSize:10,color:CV.muted}}>{p.telefono}</div>
                    <div style={{fontSize:10,color:CV.muted,marginTop:2}}>{p.tipo_lente||'Sin lente registrado'}</div>
                    {p.proxima_revision && (
                      <div style={{marginTop:5,fontSize:10,color:daysDiff(p.proxima_revision)<=30?CV.red:CV.muted}}>
                        Revisión: {fmtDate(p.proxima_revision)}
                      </div>
                    )}
                    <div style={{marginTop:8,display:'flex',gap:4}}>
                      {CRM_ESTADOS.filter(e=>e!==estado).slice(0,2).map(e=>(
                        <button key={e} style={{fontSize:9,padding:'2px 7px',borderRadius:20,border:`1px solid ${(CRM_COLORES[e]||CV.muted)}44`,background:'transparent',color:CRM_COLORES[e]||CV.muted,cursor:'pointer',fontFamily:'inherit'}} onClick={ev=>{ev.stopPropagation();updateCRM(p.id,e);}}>→{e}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {group.length===0&&<div style={{color:CV.muted,fontSize:11,padding:'10px',textAlign:'center'}}>Sin pacientes</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── CAMPAÑAS ─────────────────────────────────────────────────────────────
  const Campaigns = () => {
    const [step, setStep] = useState('templates');
    const [sel, setSel] = useState(null);
    const [target, setTarget] = useState('todos');
    const [preview, setPreview] = useState(false);

    const targetGroups = { todos:`Todos los pacientes (${patients.length})`, nuevos:`Nuevos (${patients.filter(p=>p.crm_estado==='nuevo').length})`, seguimiento:`En seguimiento (${patients.filter(p=>p.crm_estado==='seguimiento').length})`, inactivos:`Inactivos (${patients.filter(p=>p.crm_estado==='inactivo').length})` };

    const simulate = () => {
      const count = target==='todos'?patients.length:patients.filter(p=>p.crm_estado===target).length;
      toast_(`📧 Campaña simulada enviada a ${count} pacientes. (Para envío real, conecta tu SMTP o SendGrid)`);
      const c = {id:'C'+uid(), nombre:sel.nombre, asunto:sel.asunto, segmento:target, enviados:count, fecha:now(), abiertos: Math.floor(count*0.42), clics: Math.floor(count*0.18)};
      const updated = [c,...campaigns]; setCampaigns(updated); save('cv-campaigns', updated);
      setStep('sent');
    };

    return (
      <div>
        <h2 style={{fontSize:20,fontWeight:900,marginBottom:16}}>✉️ Campañas de Correo</h2>

        {step==='templates' && (
          <>
            <div style={{marginBottom:14,fontSize:12,color:CV.muted}}>Selecciona una plantilla y el segmento de pacientes al que quieres enviarla.</div>
            <div style={S.g2}>
              {EMAIL_TEMPLATES.map(t=>(
                <div key={t.id} style={{...S.card(sel?.id===t.id?CV.cyan:null),cursor:'pointer',border:sel?.id===t.id?`2px solid ${CV.cyan}`:`1px solid ${CV.border}`}} onClick={()=>setSel(t)}>
                  <div style={{fontSize:13,fontWeight:800,marginBottom:6}}>{t.nombre}</div>
                  <div style={{fontSize:11,color:CV.muted,marginBottom:8}}>📧 {t.asunto}</div>
                  <div style={{fontSize:11,color:CV.muted,lineHeight:1.6}}>{t.cuerpo.slice(0,120)}...</div>
                  {sel?.id===t.id&&<span style={{marginTop:8,display:'inline-block',padding:'2px 9px',borderRadius:20,fontSize:10,fontWeight:700,background:CV.cyan+'22',color:CV.cyan,border:`1px solid ${CV.cyan}44`}}>✅ Seleccionada</span>}
                </div>
              ))}
            </div>
            {sel && (
              <div style={S.card(CV.green)}>
                <div style={S.ttl(CV.green)}>⚙️ Configurar envío</div>
                <div><label style={S.lbl}>Segmento de pacientes</label>
                  <select style={S.inp} value={target} onChange={e=>setTarget(e.target.value)}>
                    {Object.entries(targetGroups).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button style={S.btn('sec')} onClick={()=>setPreview(!preview)}>👁️ {preview?'Ocultar':'Ver'} preview</button>
                  <button style={S.btn('pri')} onClick={simulate}>🚀 Enviar campaña</button>
                </div>
                {preview && (
                  <div style={{marginTop:14,background:CV.navy,borderRadius:9,padding:'14px',fontSize:12,lineHeight:1.8,whiteSpace:'pre-wrap',color:CV.white,border:`1px solid ${CV.border}`}}>
                    <div style={{fontWeight:800,color:CV.cyan,marginBottom:8}}>ASUNTO: {sel.asunto}</div>
                    {sel.cuerpo.replace('[NOMBRE]','[Nombre del paciente]').replace('[FECHA_FIN]','[Fecha]')}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Historial campañas */}
        {campaigns.length > 0 && (
          <div style={S.card()}>
            <div style={S.ttl()}>📊 Historial de Campañas</div>
            {campaigns.map((c,i)=>(
              <div key={i} style={{...S.box,marginBottom:8}}>
                <div style={S.row}>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{c.nombre}</div>
                    <div style={{fontSize:11,color:CV.muted}}>{c.fecha} · Segmento: {c.segmento}</div>
                  </div>
                  <div style={{textAlign:'right',fontSize:12}}>
                    <div style={{color:CV.cyan,fontWeight:700}}>{c.enviados} enviados</div>
                    <div style={{color:CV.green}}>{c.abiertos} abiertos ({Math.round(c.abiertos/c.enviados*100)}%)</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── INVENTARIO ───────────────────────────────────────────────────────────
  const Inventory = () => {
    const [catFilter, setCatFilter] = useState('todos');
    const cats = ['todos','lentes','armazones','contactos','accesorios'];
    const filtered = catFilter==='todos' ? products : products.filter(p=>p.categoria===catFilter);
    const totalValue = products.reduce((s,p)=>s+p.precio_venta*p.stock,0);

    return (
      <div>
        <div style={{...S.row,marginBottom:16}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,margin:0}}>📦 Inventario</h2>
            <p style={{color:CV.muted,fontSize:12,marginTop:2}}>{products.length} productos · Valor total en stock: ${totalValue.toLocaleString()}</p>
          </div>
          <button style={S.btn('pri')} onClick={()=>setModal({type:'product',data:null})}>+ Nuevo Producto</button>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:14}}>
          {cats.map(c=><button key={c} style={{...S.navB(catFilter===c),padding:'6px 13px',borderRadius:7,border:'none',cursor:'pointer',fontFamily:'inherit'}} onClick={()=>setCatFilter(c)}>{c}</button>)}
        </div>

        <div style={S.g3}>
          {filtered.map(p=>(
            <div key={p.id} style={{...S.card(p.stock<10?CV.red:null),cursor:'pointer'}} onClick={()=>setModal({type:'product',data:p})}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:4}}>{p.nombre}</div>
              <div style={{fontSize:11,color:CV.muted,marginBottom:8}}>{p.marca} · {p.categoria}</div>
              <div style={{...S.row,marginBottom:6}}>
                <span style={{fontSize:11,color:CV.muted}}>Venta: <strong style={{color:CV.cyan}}>${p.precio_venta}</strong></span>
                <span style={{fontSize:11,color:CV.muted}}>Costo: ${p.precio_costo}</span>
              </div>
              <div style={{...S.row}}>
                <span style={{fontSize:20,fontWeight:900,color:p.stock<10?CV.red:CV.green}}>{p.stock}</span>
                <span style={{fontSize:10,color:CV.muted}}>unidades</span>
              </div>
              {p.stock<10&&<div style={{fontSize:10,color:CV.red,marginTop:4}}>⚠️ Stock bajo</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── AGENDA ───────────────────────────────────────────────────────────────
  const AgendaView = () => {
    const sorted = [...agenda].sort((a,b)=>a.fecha.localeCompare(b.fecha)||a.hora.localeCompare(b.hora));
    return (
      <div>
        <div style={{...S.row,marginBottom:16}}>
          <h2 style={{fontSize:20,fontWeight:900,margin:0}}>📅 Agenda de Citas</h2>
          <button style={S.btn('pri')} onClick={()=>setModal({type:'appointment',data:null})}>+ Nueva Cita</button>
        </div>
        {sorted.map((a,i)=>(
          <div key={i} style={{...S.card(a.fecha===now()?CV.green:null),cursor:'pointer'}} onClick={()=>setModal({type:'appointment',data:a})}>
            <div style={S.row}>
              <div style={{display:'flex',gap:14,alignItems:'center'}}>
                <div style={{background:a.fecha===now()?CV.green+'22':CV.cyan+'22',borderRadius:10,padding:'10px 14px',textAlign:'center',minWidth:60}}>
                  <div style={{fontSize:18,fontWeight:900,color:a.fecha===now()?CV.green:CV.cyan}}>{a.hora}</div>
                  <div style={{fontSize:10,color:CV.muted}}>{fmtDate(a.fecha)}</div>
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{a.paciente_nombre}</div>
                  <div style={{fontSize:11,color:CV.muted}}>{a.tipo.replace(/_/g,' ')} · {a.notas}</div>
                </div>
              </div>
              <span style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:(a.estado==='confirmado'?CV.green:CV.yellow)+'22',color:a.estado==='confirmado'?CV.green:CV.yellow}}>{a.estado}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── MODALES ──────────────────────────────────────────────────────────────
  const PatientModal = ({data}) => {
    const [form, setForm] = useState(data || {nombre:'',cedula:'',telefono:'',correo:'',fecha_nacimiento:'',genero:'F',od_esfera:'',od_cilindro:'',od_eje:'',oi_esfera:'',oi_cilindro:'',oi_eje:'',adicion:'',tipo_lente:'',marca_armazon:'',color_armazon:'',material:'',proxima_revision:'',notas:'',crm_estado:'nuevo',historial:[]});
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));

    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={S.ttl()}>👤 {data?'Editar Paciente':'Registrar Nuevo Paciente'}</div>
        <div style={S.g2}>
          <div><label style={S.lbl}>Nombre completo *</label><input style={S.inp} value={form.nombre} onChange={e=>setF('nombre',e.target.value)} placeholder="Juan Carlos Pérez Mora"/></div>
          <div><label style={S.lbl}>Cédula *</label><input style={S.inp} value={form.cedula} onChange={e=>setF('cedula',e.target.value)} placeholder="1712345678"/></div>
          <div><label style={S.lbl}>Teléfono *</label><input style={S.inp} value={form.telefono} onChange={e=>setF('telefono',e.target.value)} placeholder="0991234567"/></div>
          <div><label style={S.lbl}>Correo electrónico</label><input style={S.inp} type="email" value={form.correo} onChange={e=>setF('correo',e.target.value)} placeholder="paciente@correo.com"/></div>
          <div><label style={S.lbl}>Fecha de nacimiento</label><input style={S.inp} type="date" value={form.fecha_nacimiento} onChange={e=>setF('fecha_nacimiento',e.target.value)}/></div>
          <div><label style={S.lbl}>Género</label>
            <select style={S.inp} value={form.genero} onChange={e=>setF('genero',e.target.value)}>
              <option value="F">Femenino</option><option value="M">Masculino</option><option value="O">Otro</option>
            </select>
          </div>
        </div>
        <div style={{fontSize:12,fontWeight:800,color:CV.cyan,padding:'8px 0 4px',borderTop:`1px solid ${CV.border}`}}>👁️ RECETA OFTÁLMICA</div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:CV.cyan,marginBottom:6}}>OJO DERECHO (OD)</div>
          <div style={S.g3}>
            {[['od_esfera','Esfera'],['od_cilindro','Cilindro'],['od_eje','Eje °']].map(([k,l])=>(
              <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]} onChange={e=>setF(k,e.target.value)} placeholder={k.includes('eje')?'180':'-2.50'}/></div>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:CV.cyanLt,marginBottom:6}}>OJO IZQUIERDO (OI)</div>
          <div style={S.g3}>
            {[['oi_esfera','Esfera'],['oi_cilindro','Cilindro'],['oi_eje','Eje °']].map(([k,l])=>(
              <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]} onChange={e=>setF(k,e.target.value)} placeholder={k.includes('eje')?'175':'-2.25'}/></div>
            ))}
          </div>
        </div>
        <div style={S.g2}>
          <div><label style={S.lbl}>Adición (solo para progresivos)</label><input style={S.inp} value={form.adicion} onChange={e=>setF('adicion',e.target.value)} placeholder="+2.00"/></div>
          <div><label style={S.lbl}>Próxima revisión</label><input style={S.inp} type="date" value={form.proxima_revision} onChange={e=>setF('proxima_revision',e.target.value)}/></div>
        </div>
        <div><label style={S.lbl}>Tipo de lente</label>
          <select style={S.inp} value={form.tipo_lente} onChange={e=>setF('tipo_lente',e.target.value)}>
            <option value="">Seleccionar tipo de lente...</option>
            {TIPOS_LENTE.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={S.g3}>
          <div><label style={S.lbl}>Marca armazón</label><input style={S.inp} value={form.marca_armazon} onChange={e=>setF('marca_armazon',e.target.value)} placeholder="Ray-Ban RB5228"/></div>
          <div><label style={S.lbl}>Color armazón</label><input style={S.inp} value={form.color_armazon} onChange={e=>setF('color_armazon',e.target.value)} placeholder="Negro mate"/></div>
          <div><label style={S.lbl}>Material</label><input style={S.inp} value={form.material} onChange={e=>setF('material',e.target.value)} placeholder="Metal / Acetato / Titanio"/></div>
        </div>
        <div><label style={S.lbl}>Notas y observaciones</label>
          <textarea style={{...S.inp,minHeight:70,resize:'vertical'}} value={form.notas} onChange={e=>setF('notas',e.target.value)} placeholder="Observaciones relevantes, preferencias del paciente, historial..."/>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button style={S.btn('sec')} onClick={closeModal}>Cancelar</button>
          <button style={S.btn('pri')} onClick={()=>savePatient(form)} disabled={!form.nombre||!form.cedula}>💾 {data?'Actualizar':'Registrar Paciente'}</button>
        </div>
      </div>
    );
  };

  const ProductModal = ({data}) => {
    const [form,setForm] = useState(data||{nombre:'',categoria:'lentes',marca:'',precio_costo:0,precio_venta:0,stock:0,descripcion:'',activo:true});
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={S.ttl()}>📦 {data?'Editar Producto':'Nuevo Producto'}</div>
        <div><label style={S.lbl}>Nombre del producto *</label><input style={S.inp} value={form.nombre} onChange={e=>setF('nombre',e.target.value)}/></div>
        <div style={S.g2}>
          <div><label style={S.lbl}>Categoría</label>
            <select style={S.inp} value={form.categoria} onChange={e=>setF('categoria',e.target.value)}>
              {['lentes','armazones','contactos','accesorios','servicios'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>Marca</label><input style={S.inp} value={form.marca} onChange={e=>setF('marca',e.target.value)}/></div>
          <div><label style={S.lbl}>Precio de costo ($)</label><input style={S.inp} type="number" value={form.precio_costo} onChange={e=>setF('precio_costo',+e.target.value)}/></div>
          <div><label style={S.lbl}>Precio de venta ($)</label><input style={S.inp} type="number" value={form.precio_venta} onChange={e=>setF('precio_venta',+e.target.value)}/></div>
          <div><label style={S.lbl}>Stock actual</label><input style={S.inp} type="number" value={form.stock} onChange={e=>setF('stock',+e.target.value)}/></div>
          <div><label style={S.lbl}>Margen</label><div style={{...S.inp,color:CV.green,fontWeight:700}}>{form.precio_venta&&form.precio_costo?Math.round((form.precio_venta-form.precio_costo)/form.precio_venta*100):0}%</div></div>
        </div>
        <div><label style={S.lbl}>Descripción</label><textarea style={{...S.inp,minHeight:60,resize:'vertical'}} value={form.descripcion} onChange={e=>setF('descripcion',e.target.value)}/></div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button style={S.btn('sec')} onClick={closeModal}>Cancelar</button>
          <button style={S.btn('pri')} onClick={()=>saveProduct(form)}>💾 Guardar</button>
        </div>
      </div>
    );
  };

  const AppointmentModal = ({data}) => {
    const [form,setForm] = useState(data||{paciente_nombre:'',paciente_id:'',fecha:now(),hora:'09:00',tipo:'primera_consulta',estado:'pendiente',notas:''});
    const setF=(k,v)=>setForm(p=>({...p,[k]:v}));
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={S.ttl()}>📅 {data?'Editar Cita':'Nueva Cita'}</div>
        <div><label style={S.lbl}>Nombre del paciente *</label>
          <input style={S.inp} list="patients-list" value={form.paciente_nombre} onChange={e=>{const p=patients.find(p=>p.nombre===e.target.value);setForm(f=>({...f,paciente_nombre:e.target.value,paciente_id:p?.id||''}));}}  placeholder="Buscar paciente..."/>
          <datalist id="patients-list">{patients.map(p=><option key={p.id} value={p.nombre}/>)}</datalist>
        </div>
        <div style={S.g2}>
          <div><label style={S.lbl}>Fecha</label><input style={S.inp} type="date" value={form.fecha} onChange={e=>setF('fecha',e.target.value)}/></div>
          <div><label style={S.lbl}>Hora</label><input style={S.inp} type="time" value={form.hora} onChange={e=>setF('hora',e.target.value)}/></div>
          <div><label style={S.lbl}>Tipo de cita</label>
            <select style={S.inp} value={form.tipo} onChange={e=>setF('tipo',e.target.value)}>
              {TIPOS_CITA.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label style={S.lbl}>Estado</label>
            <select style={S.inp} value={form.estado} onChange={e=>setF('estado',e.target.value)}>
              {['pendiente','confirmado','completado','cancelado'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:60,resize:'vertical'}} value={form.notas} onChange={e=>setF('notas',e.target.value)}/></div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button style={S.btn('sec')} onClick={closeModal}>Cancelar</button>
          <button style={S.btn('pri')} onClick={()=>saveAppointment(form)}>💾 Guardar Cita</button>
        </div>
      </div>
    );
  };

  const EmailModal = ({patient,templateId}) => {
    const tmpl = EMAIL_TEMPLATES.find(t=>t.id===templateId)||EMAIL_TEMPLATES[0];
    const [asunto,setAsunto] = useState(tmpl.asunto);
    const [cuerpo,setCuerpo] = useState(tmpl.cuerpo.replace(/\[NOMBRE\]/g,patient.nombre));
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={S.ttl()}>✉️ Enviar Correo a {patient.nombre}</div>
        <div style={{...S.box,fontSize:12}}>Para: <strong>{patient.correo||'Sin correo registrado'}</strong></div>
        <div><label style={S.lbl}>Asunto</label><input style={S.inp} value={asunto} onChange={e=>setAsunto(e.target.value)}/></div>
        <div><label style={S.lbl}>Mensaje</label><textarea style={{...S.inp,minHeight:220,resize:'vertical',fontSize:12,lineHeight:1.7}} value={cuerpo} onChange={e=>setCuerpo(e.target.value)}/></div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button style={S.btn('sec')} onClick={closeModal}>Cancelar</button>
          <button style={S.btn('pri')} onClick={()=>{if(!patient.correo){toast_('⚠️ Este paciente no tiene correo registrado');}else{addHistorial(patient.id,'correo',`Correo enviado: "${asunto}"`);toast_('✉️ Correo registrado en historial (conecta SMTP para envío real)');closeModal();}}}>✉️ Registrar Envío</button>
        </div>
      </div>
    );
  };

  // ─── MODAL WRAPPER ────────────────────────────────────────────────────────
  const Modal = () => {
    if(!modal) return null;
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={e=>e.target===e.currentTarget&&closeModal()}>
        <div style={{background:CV.card,borderRadius:16,border:`1px solid ${CV.border}`,padding:24,maxWidth:700,width:'100%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}>
          {modal.type==='patient'    && <PatientModal data={modal.data}/>}
          {modal.type==='product'    && <ProductModal data={modal.data}/>}
          {modal.type==='appointment'&& <AppointmentModal data={modal.data}/>}
          {modal.type==='email'      && <EmailModal patient={modal.patient} templateId={modal.template}/>}
        </div>
      </div>
    );
  };

  // ─── TABS CONFIG ──────────────────────────────────────────────────────────
  const TABS = [['dashboard','🏠 Inicio'],['patients','👥 Pacientes'],['crm','📊 CRM'],['campaigns','✉️ Campañas'],['inventory','📦 Inventario'],['agenda','📅 Agenda']];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input:focus,textarea:focus,select:focus{border-color:${CV.cyan}88!important;outline:none;box-shadow:0 0 0 2px ${CV.cyan}22}
        button:hover:not(:disabled){opacity:.88;transform:translateY(-1px)}
        button:active{transform:translateY(0)}
        button:disabled{opacity:.45;cursor:not-allowed}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:${CV.navy}}
        ::-webkit-scrollbar-thumb{background:${CV.border};border-radius:3px}
        select option{background:${CV.card};color:${CV.white}}
        datalist option{background:${CV.navyLt}}
      `}</style>

      {/* Toast */}
      {toast && <div style={{position:'fixed',top:18,right:18,zIndex:9999,background:CV.green,color:'#000',padding:'11px 18px',borderRadius:9,fontWeight:800,fontSize:12,boxShadow:`0 4px 20px ${CV.green}66`,transition:'all 0.3s'}}>{toast}</div>}

      {/* Header */}
      <div style={S.hdr}>
        <div style={S.logo}>
          <div style={{width:36,height:36,borderRadius:'50%',background:`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>👁️</div>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:CV.white,letterSpacing:'0.05em'}}>CLICK VISION™</div>
            <div style={{fontSize:9,color:CV.muted,letterSpacing:'0.12em'}}>SISTEMA DE GESTIÓN INTEGRAL</div>
          </div>
        </div>
        <nav style={S.nav}>
          {TABS.map(([id,lbl])=><button key={id} style={S.navB(tab===id)} onClick={()=>setTab(id)}>{lbl}</button>)}
        </nav>
        <button style={{...S.btn('sec'),fontSize:11}} onClick={exportExcel}>📥 Exportar</button>
      </div>

      <Modal/>

      <div style={S.wrap}>
        {tab==='dashboard'  && <Dashboard/>}
        {tab==='patients'   && <Patients/>}
        {tab==='crm'        && <CRMView/>}
        {tab==='campaigns'  && <Campaigns/>}
        {tab==='inventory'  && <Inventory/>}
        {tab==='agenda'     && <AgendaView/>}
      </div>
    </div>
  );
}
