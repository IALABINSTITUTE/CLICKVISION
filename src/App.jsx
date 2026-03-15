import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════
// CLICK VISION™ SYSTEM v2.0 — EDICIÓN COMPLETA
// 30+ Módulos · IA Groq · DHL Psychology · Print · Pagos · Tienda
// IA LAB INSTITUTE — Christian — Quito, Ecuador — 2026
// ══════════════════════════════════════════════════════════════

const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY || window.GROQ_API_KEY || "";
const SHEET_URL = process.env.REACT_APP_SHEET_URL || window.SHEET_URL || "";
const MC_KEY    = process.env.REACT_APP_MC_KEY || window.MC_KEY || "";
const MC_DC     = process.env.REACT_APP_MC_DC || "us1";
const MC_LIST   = process.env.REACT_APP_MC_LIST || "";

// ─── SISTEMA DE DEMO (7 días) ─────────────────────────────────
const DEMO_DURATION_DAYS = 7;
const getDemoStatus = () => {
  const start = localStorage.getItem("cv_demo_start");
  if (!start) return { active: false, expired: false, daysLeft: 0 };
  const elapsed = (Date.now() - parseInt(start)) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.max(0, DEMO_DURATION_DAYS - Math.floor(elapsed));
  return { active: true, expired: daysLeft === 0, daysLeft };
};
const startDemo = () => {
  if (!localStorage.getItem("cv_demo_start")) {
    localStorage.setItem("cv_demo_start", Date.now().toString());
  }
};

// ─── PALETA ───────────────────────────────────────────────────
const CV = {
  navy:"#060F1E", navyMid:"#0A1628", navyLt:"#0F1F38",
  card:"#111E30", cardLt:"#162440",
  cyan:"#00B4D8", cyanLt:"#48CAE4", cyanDk:"#0096C7",
  white:"#F0F7FF", muted:"#6B8CAE", border:"#1A2E48",
  green:"#06D6A0", red:"#EF476F", yellow:"#FFD166",
  orange:"#F77F00", purple:"#A855F7",
};

// ─── USUARIOS (cambiar antes de deploy) ───────────────────────
const USERS = {
  admin:    { pass: "click2026", rol: "admin",    nombre: "Administrador" },
  empleado: { pass: "emp123",    rol: "empleado", nombre: "Empleado" },
};

// ─── CONFIGURACIÓN DEL NEGOCIO (editable en el sistema) ───────
const CFG_DEFAULT = {
  nombre: "Click Vision™", ruc: "1790000001001",
  direccion: "Av. Principal 123, Quito, Ecuador",
  telefono: "02-123-4567", correo: "info@clickvision.ec",
  logo: "", color_primario: CV.cyan, plan_demo: false,
  whatsapp: "593912345678",
  cuenta_banco: "Banco del Pichincha · Cta Ahorro · 2100012345",
  deuna_codigo: "clickvision",
};

// ─── ARQUETIPOS DHL (psicología para correos) ─────────────────
const ARQUETIPOS = [
  "Víctima", "Soñador Frustrado", "Emprendedor Quemado",
  "Escéptico Analítico", "Seguidor de Gurús", "Perfeccionista Paralizado",
  "Buscador de Atajos", "Emprendedor Exitoso Estancado",
  "Novato Optimista", "Experto Frustrado",
];

// ─── PLANTILLAS DE CORREO CON PSICOLOGÍA DHL ─────────────────
const EMAIL_TEMPLATES = [
  {
    id:"T001", nombre:"Bienvenida paciente nuevo", tipo:"bienvenida",
    asunto:"Tu visión merece lo mejor 👁 — Click Vision",
    cuerpo:`Hola [NOMBRE],

Sé que no es fácil encontrar una óptica que realmente se preocupe por ti. La mayoría te atienden rápido, te venden, y nunca más te llaman.

Aquí no. En Click Vision tu expediente está listo, tu historial guardado, y cuando se acerque tu revisión anual nosotros te avisamos.

¿Por qué importa eso? Porque el 73% de las personas que usan lentes desactualizados sufren dolores de cabeza sin saber que el problema está en sus ojos.

No queremos que eso te pase.

Cualquier consulta, escríbenos. Estamos aquí.

Click Vision — Cuidando tu visión, no solo vendiéndote lentes. 👁`,
    arquetipo: "Víctima",
  },
  {
    id:"T002", nombre:"Recordatorio revisión anual", tipo:"recordatorio",
    asunto:"Llevas 12 meses con los mismos lentes ⏰ — Click Vision",
    cuerpo:`Hola [NOMBRE],

Un año pasa rápido. Y en ese tiempo tu visión puede cambiar más de lo que crees.

Sé que piensas "si veo bien, para qué ir". Yo pensaba lo mismo. Hasta que un cliente llegó con dolores de cabeza 3 veces por semana y resultó que su graduación había cambiado en -0.75 en solo 10 meses.

No es miedo. Es prevención real.

Tu revisión no tiene costo. Solo necesitas 30 minutos.

Agéndala aquí → responde este correo o llámanos.

Te esperamos.

Click Vision 👁`,
    arquetipo: "Soñador Frustrado",
  },
  {
    id:"T003", nombre:"Promoción especial", tipo:"promocion",
    asunto:"Solo hasta el domingo: 20% en Ray-Ban 🔥",
    cuerpo:`Hola [NOMBRE],

Seré directo contigo porque sé que el tiempo vale.

Esta semana tenemos algo especial y quiero que seas de los primeros en saberlo:

→ 20% de descuento en armazones Ray-Ban y Oakley
→ Lentes con filtro de luz azul SIN costo adicional en compras sobre $150
→ Limpiador de regalo para los primeros 10 clientes

¿Cuándo vence? El domingo a las 18h00.

No es presión. Si no te sirve ahora, guarda este correo para cuando sí.

Pero si ya estabas pensando renovar tus armazones, este es el momento.

Click Vision 👁 — Solo esta semana.`,
    arquetipo: "Buscador de Atajos",
  },
  {
    id:"T004", nombre:"Lanzamiento nuevo producto", tipo:"novedad",
    asunto:"Llegaron los Zeiss SmartLife — no son lentes, son tecnología ✨",
    cuerpo:`Hola [NOMBRE],

¿Cuántas horas al día pasas frente a una pantalla?

Si la respuesta es más de 4 horas, sigue leyendo.

Los nuevos lentes Zeiss SmartLife llegaron a Click Vision y son diferentes a cualquier cosa que hayas probado antes:

✨ 25% más campo visual que los progresivos normales
✨ Reducen la fatiga digital en 50% — comprobado clínicamente
✨ Diseñados específicamente para personas que usan celular y computador todo el día

¿Son para ti? Probablemente sí.

Agenda una prueba sin compromiso. Si no los sientes diferentes, no los compras.

Click Vision 👁`,
    arquetipo: "Emprendedor Quemado",
  },
  {
    id:"T005", nombre:"Recuperar cliente inactivo", tipo:"reactivacion",
    asunto:"¿Sigues bien? Han pasado más de 18 meses 👁",
    cuerpo:`Hola [NOMBRE],

No quería ser invasivo, pero me alegra que hayas abierto este correo.

Hace más de 18 meses que no te vemos por acá. Y la verdad es que me preocupa un poco.

No porque necesitemos la venta. Sino porque con ese tiempo sin revisión, la graduación de la mayoría de personas cambia.

Un estudio reciente mostró que el 68% de personas que no se hacen revisión anual terminan con lentes que ya no les sirven bien — y siguen usándolos porque "más o menos ven bien".

"Más o menos" no debería ser suficiente para tus ojos.

Si quieres, agenda 30 minutos. Sin presión. Solo para revisar que todo está bien.

Click Vision — seguimos aquí cuando nos necesites 👁`,
    arquetipo: "Escéptico Analítico",
  },
];

// ─── TIPOS ─────────────────────────────────────────────────────
const TIPOS_LENTE = ["Monofocal CR39","Monofocal antirreflejo","Blue cut + antirreflejo","Progresivo básico","Progresivo premium","Fotocromático","Bifocal","Contactos blandos","Contactos rígidos"];
const TIPOS_CITA  = ["primera_consulta","control_anual","adaptacion","urgencia","entrega_lentes","contactos"];
const CRM_ESTADOS = ["nuevo","activo","seguimiento","fiel","inactivo"];
const CRM_COLORES = { nuevo:CV.cyan, activo:CV.green, seguimiento:CV.yellow, fiel:CV.purple, inactivo:CV.muted };

// ─── HELPERS ───────────────────────────────────────────────────
const uid  = () => Math.random().toString(36).substr(2,9).toUpperCase();
const now  = () => new Date().toISOString().slice(0,10);
const fmtD = d => d ? new Date(d+"T12:00:00").toLocaleDateString("es-EC",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const dd   = d => d ? Math.ceil((new Date(d+"T12:00:00") - new Date()) / 86400000) : null;

// ─── GROQ CALL ─────────────────────────────────────────────────
const callGroq = async (system, user, tokens=600) => {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+GROQ_KEY},
    body: JSON.stringify({
      model:"llama-3.3-70b-versatile", max_tokens: tokens,
      messages:[{role:"system",content:system},{role:"user",content:user}]
    })
  });
  const d = await r.json();
  return d.choices?.[0]?.message?.content || "Sin respuesta.";
};

// ─── MAILCHIMP ─────────────────────────────────────────────────
const addToMailchimp = async (email, name) => {
  if(!MC_KEY || !MC_LIST) return;
  try {
    await fetch(`https://cors-anywhere.herokuapp.com/https://${MC_DC}.api.mailchimp.com/3.0/lists/${MC_LIST}/members`, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"apikey "+MC_KEY},
      body:JSON.stringify({email_address:email, status:"subscribed", merge_fields:{FNAME:name}})
    });
  } catch(e) { console.log("MC:", e.message); }
};

// ─── DEMO DATA ─────────────────────────────────────────────────
const DEMO_PATIENTS = [
  {id:"P001",nombre:"María García López",cedula:"1712345678",telefono:"0991234567",correo:"maria@gmail.com",fecha_nacimiento:"1985-06-15",genero:"F",fecha_registro:"2026-01-10",od_esfera:"-2.50",od_cilindro:"-0.75",od_eje:"180",oi_esfera:"-2.25",oi_cilindro:"-0.50",oi_eje:"175",adicion:"",tipo_lente:"Monofocal antirreflejo",marca_armazon:"Ray-Ban RB5228",color_armazon:"Negro mate",material:"Metal",proxima_revision:"2026-06-10",notas:"Prefiere armazones modernos.",crm_estado:"fiel",puntos:150,historial:[{fecha:"2026-01-10",tipo:"consulta",detalle:"Primera consulta. Graduación completa."},{fecha:"2026-03-15",tipo:"venta",detalle:"Lentes monofocal + armazón Ray-Ban. Total: $250"}]},
  {id:"P002",nombre:"Carlos Andrés Vega",cedula:"1798765432",telefono:"0987654321",correo:"carlos@hotmail.com",fecha_nacimiento:"1990-11-22",genero:"M",fecha_registro:"2026-02-05",od_esfera:"+1.00",od_cilindro:"-1.25",od_eje:"90",oi_esfera:"+0.75",oi_cilindro:"-1.00",oi_eje:"85",adicion:"",tipo_lente:"Blue cut + antirreflejo",marca_armazon:"Oakley OX8046",color_armazon:"Azul oscuro",material:"Acetato",proxima_revision:"2026-05-05",notas:"8h/día frente a pantalla.",crm_estado:"activo",puntos:80,historial:[{fecha:"2026-02-05",tipo:"consulta",detalle:"Primera consulta."},{fecha:"2026-02-20",tipo:"entrega",detalle:"Lentes entregados. Satisfecho."}]},
  {id:"P003",nombre:"Ana Lucía Moreno",cedula:"1756789012",telefono:"0978901234",correo:"ana@yahoo.com",fecha_nacimiento:"1978-03-08",genero:"F",fecha_registro:"2025-12-01",od_esfera:"-3.00",od_cilindro:"-1.50",od_eje:"165",oi_esfera:"-3.25",oi_cilindro:"-1.25",oi_eje:"170",adicion:"+2.00",tipo_lente:"Progresivo premium",marca_armazon:"Silhouette Titan",color_armazon:"Dorado",material:"Titanio",proxima_revision:"2026-04-01",notas:"Primera vez con progresivos.",crm_estado:"seguimiento",puntos:200,historial:[{fecha:"2025-12-01",tipo:"consulta",detalle:"Primera consulta progresivos."},{fecha:"2026-01-15",tipo:"llamada",detalle:"Sigue adaptándose."}]},
];
const DEMO_PRODUCTS = [
  {id:"PR001",nombre:"Lente Monofocal CR39",categoria:"lentes",marca:"Essilor",precio_costo:18,precio_venta:65,stock:45,descripcion:"Antirreflejo básico",codigo:"8001"},
  {id:"PR002",nombre:"Lente Blue Cut Premium",categoria:"lentes",marca:"Zeiss",precio_costo:42,precio_venta:140,stock:28,descripcion:"Filtro luz azul + UV400",codigo:"8002"},
  {id:"PR003",nombre:"Lente Progresivo Essilor",categoria:"lentes",marca:"Essilor",precio_costo:95,precio_venta:320,stock:12,descripcion:"Alta definición",codigo:"8003"},
  {id:"PR004",nombre:"Armazón Ray-Ban RB5228",categoria:"armazones",marca:"Ray-Ban",precio_costo:68,precio_venta:185,stock:8,descripcion:"Rectangular, 4 colores",codigo:"8004"},
  {id:"PR005",nombre:"Armazón Oakley OX8046",categoria:"armazones",marca:"Oakley",precio_costo:82,precio_venta:220,stock:5,descripcion:"Deportivo liviano",codigo:"8005"},
  {id:"PR006",nombre:"Contactos Acuvue Oasys (6u)",categoria:"contactos",marca:"J&J",precio_costo:22,precio_venta:58,stock:30,descripcion:"Quincenales alto Dk",codigo:"8006"},
  {id:"PR007",nombre:"Solución MultiPlus 360ml",categoria:"accesorios",marca:"Bausch & Lomb",precio_costo:8,precio_venta:18,stock:55,descripcion:"Multiusos",codigo:"8007"},
];
const DEMO_AGENDA = [
  {id:"A001",pnombre:"María García López",fecha:now(),hora:"10:00",tipo:"control_anual",estado:"confirmado",notas:"Control anual"},
  {id:"A002",pnombre:"Carlos Andrés Vega",fecha:now(),hora:"11:30",tipo:"primera_consulta",estado:"confirmado",notas:"Referido por María"},
  {id:"A003",pnombre:"Ana Lucía Moreno",fecha:"2026-03-25",hora:"09:00",tipo:"adaptacion",estado:"pendiente",notas:"Control progresivos"},
];

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function ClickVisionV2() {
  const [logged,     setLogged]     = useState(false);
  const [currentUser,setCurrentUser]= useState(null);
  const [tab,        setTab]        = useState("dashboard");
  const [patients,   setPatients]   = useState(DEMO_PATIENTS);
  const [products,   setProducts]   = useState(DEMO_PRODUCTS);
  const [agenda,     setAgenda]     = useState(DEMO_AGENDA);
  const [campaigns,  setCampaigns]  = useState([]);
  const [config,     setConfig]     = useState(CFG_DEFAULT);
  const [comprobantes,setComprobantes] = useState([]);
  const [toast,      setToast]      = useState("");
  const [modal,      setModal]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [demoStatus, setDemoStatus] = useState(getDemoStatus());

  useEffect(() => { bootStorage(); }, []);

  const bootStorage = async () => {
    try {
      const keys = ["cv-patients","cv-products","cv-agenda","cv-campaigns","cv-config","cv-comprobantes"];
      const setters = [setPatients,setProducts,setAgenda,setCampaigns,setConfig,setComprobantes];
      for(let i=0;i<keys.length;i++){
        try{const r = await window.storage?.get(keys[i]); if(r) setters[i](JSON.parse(r.value));}catch(_){}
      }
    } catch(_) {}
  };

  const save = async (k,v) => { try { await window.storage?.set(k, JSON.stringify(v)); } catch(_) {} };
  const toast_ = m => { setToast(m); setTimeout(()=>setToast(""), 3200); };
  const closeModal = () => setModal(null);

  // ─── GUARDAR EN GOOGLE SHEETS (backup automático) ─────────────
  const backupToSheet = (pat) => {
    if(!SHEET_URL) return;
    fetch(SHEET_URL, {
      method:"POST", mode:"no-cors",
      body: JSON.stringify({
        negocio: config.nombre,
        nombre: pat.nombre, cedula: pat.cedula,
        telefono: pat.telefono, correo: pat.correo,
        crm: pat.crm_estado, fecha: now(),
        od_esfera: pat.od_esfera, oi_esfera: pat.oi_esfera,
        tipo_lente: pat.tipo_lente,
      })
    }).catch(()=>{});
  };

  // ─── GUARDAR PACIENTE ─────────────────────────────────────────
  const savePatient = async (pat) => {
    const exists = patients.find(p=>p.id===pat.id);
    let updated;
    if(exists){
      updated = patients.map(p=>p.id===pat.id?pat:p);
    } else {
      const newP = {...pat, id:"P"+uid(), fecha_registro:now(), puntos:0,
        historial:[{fecha:now(),tipo:"registro",detalle:"Paciente registrado en Click Vision."}]};
      updated = [...patients, newP];
      backupToSheet(newP);
      await addToMailchimp(newP.correo, newP.nombre);
    }
    setPatients(updated); await save("cv-patients", updated);
    toast_(exists ? "✅ Paciente actualizado" : "✅ Paciente registrado");
    closeModal();
  };

  // ─── GUARDAR PRODUCTO ─────────────────────────────────────────
  const saveProduct = async (prod) => {
    const exists = products.find(p=>p.id===prod.id);
    const updated = exists ? products.map(p=>p.id===prod.id?prod:p) : [...products,{...prod,id:"PR"+uid()}];
    setProducts(updated); await save("cv-products", updated);
    toast_("✅ Producto guardado"); closeModal();
  };

  // ─── GUARDAR CITA ─────────────────────────────────────────────
  const saveAppointment = async (apt) => {
    const exists = agenda.find(a=>a.id===apt.id);
    const updated = exists ? agenda.map(a=>a.id===apt.id?apt:a) : [...agenda,{...apt,id:"A"+uid()}];
    setAgenda(updated); await save("cv-agenda", updated);
    toast_("✅ Cita guardada"); closeModal();
  };

  // ─── CRM UPDATE ───────────────────────────────────────────────
  const updateCRM = async (patId, estado) => {
    const updated = patients.map(p=>p.id===patId?{...p,crm_estado:estado,historial:[...(p.historial||[]),{fecha:now(),tipo:"crm",detalle:"Estado CRM: "+estado}]}:p);
    setPatients(updated); await save("cv-patients", updated);
    toast_("📊 Estado: "+estado);
  };

  // ─── HISTORIAL ────────────────────────────────────────────────
  const addHistorial = async (patId, tipo, detalle) => {
    const updated = patients.map(p=>p.id===patId?{...p,historial:[...(p.historial||[]),{fecha:now(),tipo,detalle}]}:p);
    setPatients(updated); await save("cv-patients", updated); toast_("📝 Nota agregada");
  };

  // ─── PUNTOS FIDELIDAD ─────────────────────────────────────────
  const addPuntos = async (patId, puntos) => {
    const updated = patients.map(p=>p.id===patId?{...p,puntos:(p.puntos||0)+puntos,historial:[...(p.historial||[]),{fecha:now(),tipo:"puntos",detalle:`+${puntos} puntos de fidelidad agregados`}]}:p);
    setPatients(updated); await save("cv-patients", updated); toast_(`⭐ +${puntos} puntos agregados`);
  };

  // ─── GENERAR COMPROBANTE ──────────────────────────────────────
  const generarComprobante = (paciente, items, total, tipo="nota_venta") => {
    const comp = {
      id: "COMP-"+uid(), fecha: now(), tipo,
      paciente: paciente.nombre, cedula: paciente.cedula,
      items, total, negocio: config.nombre,
      ruc: config.ruc, direccion: config.direccion,
    };
    const newComps = [comp, ...comprobantes];
    setComprobantes(newComps); save("cv-comprobantes", newComps);
    printComprobante(comp);
    toast_("🖨️ Comprobante generado");
    return comp;
  };

  const printComprobante = (comp) => {
    const win = window.open("","_blank","width=400,height=600");
    win.document.write(`
      <html><head><title>Comprobante</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;max-width:350px;margin:0 auto}
        h2{text-align:center;color:#00B4D8;margin:0}
        .logo{text-align:center;margin-bottom:10px}
        hr{border:1px dashed #ccc}
        .item{display:flex;justify-content:space-between;margin:4px 0;font-size:13px}
        .total{font-weight:bold;font-size:16px;text-align:right;margin-top:8px}
        .footer{text-align:center;font-size:11px;color:#666;margin-top:12px}
        @media print{button{display:none}}
      </style></head><body>
      <div class="logo">
        ${config.logo ? `<img src="${config.logo}" height="50"/>` : `<h2>${comp.negocio}</h2>`}
      </div>
      <p style="text-align:center;font-size:12px;margin:0">${config.direccion}<br/>${config.telefono}</p>
      <p style="text-align:center;font-size:11px;color:#666">RUC: ${comp.ruc}</p>
      <hr/>
      <p><b>Tipo:</b> ${comp.tipo.replace("_"," ").toUpperCase()}</p>
      <p><b>N°:</b> ${comp.id}</p>
      <p><b>Fecha:</b> ${fmtD(comp.fecha)}</p>
      <p><b>Cliente:</b> ${comp.paciente}</p>
      <p><b>Cédula:</b> ${comp.cedula}</p>
      <hr/>
      ${comp.items.map(i=>`<div class="item"><span>${i.nombre}</span><span>$${i.precio}</span></div>`).join("")}
      <hr/>
      <div class="total">TOTAL: $${comp.total}</div>
      <div class="footer">
        <p>Gracias por su visita.</p>
        <p>${comp.negocio} — ${config.correo}</p>
        <p style="color:#00B4D8">Sistema by IA LAB Institute</p>
      </div>
      <br/><button onclick="window.print()">🖨️ Imprimir</button>
      </body></html>
    `);
    win.document.close();
  };

  // ─── IMPRIMIR RECETA VISUAL ───────────────────────────────────
  const printReceta = (paciente) => {
    const win = window.open("","_blank","width=600,height=700");
    win.document.write(`
      <html><head><title>Receta Visual</title>
      <style>
        body{font-family:Arial,sans-serif;padding:30px;max-width:550px;margin:0 auto;color:#111}
        h1{color:#00B4D8;text-align:center;font-size:20px;margin-bottom:4px}
        .header{text-align:center;border-bottom:2px solid #00B4D8;padding-bottom:12px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;margin:12px 0}
        th{background:#00B4D8;color:white;padding:8px;font-size:13px}
        td{border:1px solid #ddd;padding:8px;text-align:center;font-size:14px}
        .firma{margin-top:60px;display:flex;justify-content:space-between}
        .firma-box{text-align:center;width:40%}
        .firma-line{border-top:1px solid #333;padding-top:6px;font-size:12px}
        @media print{button{display:none}}
      </style></head><body>
      <div class="header">
        ${config.logo ? `<img src="${config.logo}" height="50"/><br/>` : ""}
        <h1>${config.nombre}</h1>
        <p style="margin:2px;font-size:12px">${config.direccion} · ${config.telefono}</p>
        <p style="margin:2px;font-size:12px">RUC: ${config.ruc}</p>
      </div>

      <h3 style="text-align:center;color:#0A1628">RECETA / EXAMEN DE SALUD VISUAL</h3>
      <p><b>Paciente:</b> ${paciente.nombre} &nbsp;&nbsp; <b>Cédula:</b> ${paciente.cedula}</p>
      <p><b>Fecha:</b> ${fmtD(now())} &nbsp;&nbsp; <b>Nacimiento:</b> ${fmtD(paciente.fecha_nacimiento)}</p>

      <table>
        <tr>
          <th>OJO</th><th>Esfera</th><th>Cilindro</th><th>Eje °</th>
          <th>Adición</th><th>AV SC</th><th>AV CC</th>
        </tr>
        <tr>
          <td><b>OD</b></td>
          <td>${paciente.od_esfera || "—"}</td>
          <td>${paciente.od_cilindro || "—"}</td>
          <td>${paciente.od_eje || "—"}</td>
          <td rowspan="2" style="vertical-align:middle">${paciente.adicion || "N/A"}</td>
          <td></td><td></td>
        </tr>
        <tr>
          <td><b>OI</b></td>
          <td>${paciente.oi_esfera || "—"}</td>
          <td>${paciente.oi_cilindro || "—"}</td>
          <td>${paciente.oi_eje || "—"}</td>
          <td></td><td></td>
        </tr>
      </table>

      <p><b>Tipo de lente recomendado:</b> ${paciente.tipo_lente || "—"}</p>
      <p><b>Armazón:</b> ${paciente.marca_armazon || "—"} — ${paciente.color_armazon || "—"}</p>
      <p><b>Próxima revisión:</b> ${fmtD(paciente.proxima_revision)}</p>
      ${paciente.notas ? `<p><b>Observaciones:</b> ${paciente.notas}</p>` : ""}

      <div class="firma">
        <div class="firma-box">
          <div class="firma-line">Firma del Optometrista</div>
          <p style="font-size:11px;color:#666">Reg. Profesional: _____________</p>
        </div>
        <div class="firma-box">
          <div class="firma-line">Sello del Establecimiento</div>
        </div>
      </div>

      <p style="text-align:center;font-size:11px;color:#999;margin-top:20px">
        Esta receta es válida por 12 meses desde la fecha de emisión.
      </p>
      <br/><button onclick="window.print()">🖨️ Imprimir Receta</button>
      </body></html>
    `);
    win.document.close();
  };

  // ─── BACKUP JSON ──────────────────────────────────────────────
  const exportBackup = () => {
    const data = { fecha: now(), negocio: config.nombre, patients, products, agenda, campaigns };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `clickvision-backup-${now()}.json`; a.click();
    toast_("💾 Backup exportado");
  };

  const importBackup = (file) => {
    const r = new FileReader();
    r.onload = async (e) => {
      try {
        const d = JSON.parse(e.target.result);
        if(d.patients) { setPatients(d.patients); await save("cv-patients", d.patients); }
        if(d.products) { setProducts(d.products); await save("cv-products", d.products); }
        if(d.agenda)   { setAgenda(d.agenda);    await save("cv-agenda", d.agenda); }
        toast_("✅ Backup restaurado correctamente");
      } catch(_) { toast_("❌ Archivo inválido"); }
    };
    r.readAsText(file);
  };

  // ─── EXPORT CSV ───────────────────────────────────────────────
  const exportCSV = () => {
    const rows = patients.map(p=>[p.id,p.nombre,p.cedula,p.telefono,p.correo,p.fecha_registro,p.od_esfera,p.od_cilindro,p.od_eje,p.oi_esfera,p.oi_cilindro,p.oi_eje,p.adicion,p.tipo_lente,p.marca_armazon,p.proxima_revision,p.crm_estado,p.puntos||0].map(v=>`"${v||""}"`).join(","));
    const hdr = "ID,Nombre,Cedula,Tel,Correo,Registro,OD_Esf,OD_Cil,OD_Eje,OI_Esf,OI_Cil,OI_Eje,Adicion,Lente,Armazon,Revision,CRM,Puntos";
    const csv = "\uFEFF"+[hdr,...rows].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    a.download = `ClickVision_Pacientes_${now()}.csv`; a.click();
    toast_("📥 CSV exportado");
  };

  // ─── ESTILOS ──────────────────────────────────────────────────
  const S = {
    app: { minHeight:"100vh", background:CV.navy, color:CV.white, fontFamily:"'Nunito','Segoe UI',sans-serif", fontSize:"14px" },
    hdr: { background:`linear-gradient(135deg,${CV.navyMid},${CV.navyLt})`, borderBottom:`1px solid ${CV.border}`, padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", height:58, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,.4)", gap:8, flexWrap:"wrap" },
    nav: { display:"flex", gap:2, background:CV.navy+"AA", borderRadius:10, padding:"3px", border:`1px solid ${CV.border}`, overflowX:"auto" },
    nb:  a => ({ padding:"5px 10px", borderRadius:7, border:"none", cursor:"pointer", fontWeight:700, fontSize:"10px", letterSpacing:".03em", transition:"all .2s", fontFamily:"inherit", whiteSpace:"nowrap", background:a?`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`:"transparent", color:a?CV.navy:"#4A6A8A" }),
    wrap: { maxWidth:1280, margin:"0 auto", padding:"18px 14px" },
    card: (glow) => ({ background:CV.card, borderRadius:12, border:`1px solid ${glow?glow+"33":CV.border}`, padding:"16px", marginBottom:12, boxShadow:glow?`0 0 22px ${glow}11`:"none" }),
    ttl:  c => ({ fontSize:"10px", fontWeight:800, color:c||CV.cyan, marginBottom:10, letterSpacing:".1em", textTransform:"uppercase" }),
    inp:  { width:"100%", background:CV.navyLt, border:`1px solid ${CV.border}`, borderRadius:7, padding:"8px 10px", color:CV.white, fontSize:12, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
    lbl:  { display:"block", fontSize:"9px", fontWeight:700, color:CV.muted, marginBottom:3, textTransform:"uppercase", letterSpacing:".1em" },
    btn:  v => ({ padding:"8px 15px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:800, fontSize:"11px", letterSpacing:".03em", transition:"all .2s", fontFamily:"inherit",
      background:v==="pri"?`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`:v==="ok"?`linear-gradient(135deg,${CV.green},#04A87F)`:v==="red"?`linear-gradient(135deg,${CV.red},#C01450)`:CV.cardLt,
      color:v==="sec"?CV.muted:v==="orange"?CV.orange:"#000" }),
    g2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
    g3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 },
    g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 },
    box: { background:CV.navyLt, borderRadius:8, padding:"10px 12px" },
    row: { display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 },
    badge: (c,t) => <span style={{padding:"2px 8px",borderRadius:20,fontSize:"9px",fontWeight:700,background:c+"22",color:c,border:`1px solid ${c}44`}}>{t}</span>,
    kpi:  c => ({ background:CV.card, borderRadius:12, border:`1px solid ${c||CV.cyan}33`, padding:"16px", textAlign:"center" }),
  };

  // ─── LOGIN ────────────────────────────────────────────────────
  const [loginU, setLoginU] = useState("");
  const [loginP, setLoginP] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const doLogin = () => {
    if(USERS[loginU] && USERS[loginU].pass === loginP) {
      setCurrentUser({...USERS[loginU], username: loginU});
      setLogged(true);
      startDemo();
      setDemoStatus(getDemoStatus());
    } else {
      setLoginErr("Usuario o contraseña incorrectos.");
    }
  };

  if(!logged) return (
    <div style={{...S.app, display:"flex", alignItems:"center", justifyContent:"center"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap')`}</style>
      <div style={{background:CV.card,borderRadius:16,border:`1px solid ${CV.border}`,padding:32,width:320,textAlign:"center",boxShadow:`0 0 40px ${CV.cyan}22`}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px"}}>👁</div>
        <h2 style={{color:CV.white,fontWeight:900,margin:"0 0 4px"}}>CLICK VISION™</h2>
        <p style={{color:CV.muted,fontSize:11,margin:"0 0 20px"}}>Sistema de Gestión Integral</p>
        {loginErr && <div style={{background:CV.red+"22",border:`1px solid ${CV.red}44`,borderRadius:7,padding:"8px 10px",fontSize:11,color:CV.red,marginBottom:12}}>{loginErr}</div>}
        <div style={{marginBottom:10}}>
          <label style={S.lbl}>Usuario</label>
          <input style={S.inp} value={loginU} onChange={e=>setLoginU(e.target.value)} placeholder="admin" onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={S.lbl}>Contraseña</label>
          <input style={S.inp} type="password" value={loginP} onChange={e=>setLoginP(e.target.value)} placeholder="••••••" onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
        </div>
        <button style={{...S.btn("pri"),width:"100%",padding:10}} onClick={doLogin}>Ingresar al Sistema</button>
        <p style={{color:CV.muted,fontSize:10,marginTop:12}}>Demo: admin / click2026</p>
        {demoStatus.active && !demoStatus.expired && (
          <div style={{background:CV.yellow+"22",border:`1px solid ${CV.yellow}44`,borderRadius:7,padding:"6px",fontSize:10,color:CV.yellow,marginTop:10}}>
            🕐 Demo activo — {demoStatus.daysLeft} días restantes
          </div>
        )}
        {demoStatus.expired && (
          <div style={{background:CV.red+"22",border:`1px solid ${CV.red}44`,borderRadius:7,padding:"6px",fontSize:10,color:CV.red,marginTop:10}}>
            ⛔ Demo expirado. Contacta a IA LAB Institute para activar tu licencia.
          </div>
        )}
      </div>
    </div>
  );

  // ─── TABS ─────────────────────────────────────────────────────
  const TABS = [
    ["dashboard","🏠"],["patients","👥"],["crm","📊"],["campaigns","✉️"],
    ["inventory","📦"],["agenda","📅"],["comprobantes","🧾"],
    ["proveedores","🔍"],["pagos","💳"],["tienda","🛒"],
    ["web","🌐"],["config","⚙️"],
  ];
  const TAB_LABELS = {
    dashboard:"Inicio",patients:"Pacientes",crm:"CRM",campaigns:"Campañas",
    inventory:"Inventario",agenda:"Agenda",comprobantes:"Comprobantes",
    proveedores:"Proveedores IA",pagos:"Pagos",tienda:"Mi Tienda",
    web:"Sitio Web",config:"Configurar",
  };

  // ─── COMPONENTES ─────────────────────────────────────────────
  const KPI = ({icon,label,value,sub,color}) => (
    <div style={S.kpi(color)}>
      <div style={{fontSize:24,marginBottom:2}}>{icon}</div>
      <div style={{fontSize:24,fontWeight:900,color:color||CV.cyan}}>{value}</div>
      <div style={{fontSize:10,fontWeight:700,color:CV.muted,marginTop:2}}>{label}</div>
      {sub && <div style={{fontSize:9,color:CV.border+"AA",marginTop:1}}>{sub}</div>}
    </div>
  );

  // ─── DASHBOARD ────────────────────────────────────────────────
  const Dashboard = () => {
    const hot    = patients.filter(p=>p.crm_estado==="nuevo"||p.crm_estado==="seguimiento");
    const revs   = patients.filter(p=>p.proxima_revision&&dd(p.proxima_revision)!==null&&dd(p.proxima_revision)<=60&&dd(p.proxima_revision)>=0).sort((a,b)=>dd(a.proxima_revision)-dd(b.proxima_revision));
    const hoy    = agenda.filter(a=>a.fecha===now());
    const lowSt  = products.filter(p=>p.stock<10);
    const totalV = products.reduce((s,p)=>s+p.precio_venta*p.stock,0);
    const [aiQ, setAiQ]   = useState("");
    const [aiR, setAiR]   = useState("");
    const [aiL, setAiL]   = useState(false);

    const askAI = async (q) => {
      if(!q?.trim()) return;
      setAiL(true); setAiR("");
      const ctx = `Óptica "${config.nombre}" en Quito, Ecuador. ${patients.length} pacientes, ${products.length} productos, ${hoy.length} citas hoy, ${hot.length} leads calientes.`;
      try {
        const txt = await callGroq(
          "Eres el asistente IA de una óptica en Ecuador. Experto en salud visual, marketing local y CRM. Responde en español, máximo 200 palabras, sé práctico.",
          `${ctx}\n\n${q}`
        );
        setAiR(txt);
      } catch(e){ setAiR("Error IA: "+e.message); }
      setAiL(false);
    };

    return (
      <div>
        <div style={{marginBottom:14}}>
          <h2 style={{fontSize:20,fontWeight:900,color:CV.white}}>👁 Panel de Control — {config.nombre}</h2>
          <p style={{color:CV.muted,fontSize:11,marginTop:3}}>Buen día, {currentUser?.nombre}. Resumen del día {fmtD(now())}.</p>
        </div>
        {demoStatus.active && !demoStatus.expired && (
          <div style={{background:CV.yellow+"22",border:`1px solid ${CV.yellow}44`,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:11,color:CV.yellow}}>
            🕐 <b>Modo Demo</b> — {demoStatus.daysLeft} días restantes. Para activar licencia permanente: contacta IA LAB Institute.
          </div>
        )}
        <div style={{...S.g4,marginBottom:12}}>
          <KPI icon="👥" label="Pacientes" value={patients.length} color={CV.cyan}/>
          <KPI icon="🔥" label="Seguimiento" value={hot.length} sub="requieren contacto" color={CV.yellow}/>
          <KPI icon="📅" label="Citas hoy" value={hoy.length} color={CV.green}/>
          <KPI icon="⚠️" label="Stock bajo" value={lowSt.length} color={CV.red}/>
        </div>
        <div style={S.g2}>
          <div style={S.card()}>
            <div style={S.ttl()}>⚡ Acciones Rápidas</div>
            {[
              ["👤 Nuevo paciente","pri",()=>setModal({type:"patient",data:null})],
              ["📅 Agendar cita","sec",()=>setModal({type:"appt",data:null})],
              ["🧾 Nuevo comprobante","sec",()=>setTab("comprobantes")],
              ["📥 Exportar pacientes CSV","sec",exportCSV],
              ["💾 Backup completo","sec",exportBackup],
            ].map(([l,v,fn],i)=>(
              <button key={i} style={{...S.btn(v),textAlign:"left",width:"100%",padding:"9px 12px",marginBottom:6}} onClick={fn}>{l}</button>
            ))}
          </div>
          <div style={S.card(CV.yellow)}>
            <div style={{...S.ttl(CV.yellow)}}>📅 Revisiones Próximas (60 días)</div>
            {revs.length===0 ? <p style={{color:CV.muted,fontSize:11}}>Sin revisiones próximas.</p> :
              revs.slice(0,5).map((p,i)=>{const d=dd(p.proxima_revision); return (
                <div key={i} style={{...S.box,marginBottom:7,borderLeft:`3px solid ${d<=30?CV.red:CV.yellow}`}}>
                  <div style={S.row}>
                    <div><div style={{fontWeight:700,fontSize:12}}>{p.nombre}</div><div style={{fontSize:10,color:CV.muted}}>{fmtD(p.proxima_revision)}</div></div>
                    <span style={{fontSize:12,fontWeight:900,color:d<=30?CV.red:CV.yellow}}>{d}d</span>
                  </div>
                </div>
              );})}
          </div>
        </div>
        <div style={S.card(CV.green)}>
          <div style={{...S.ttl(CV.green)}}>📅 Agenda de Hoy</div>
          {hoy.length===0 ? <p style={{color:CV.muted,fontSize:11}}>Sin citas hoy.</p> :
            hoy.map((a,i)=>(
              <div key={i} style={{...S.box,marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:700,fontSize:12}}>{a.hora} — {a.pnombre}</div><div style={{fontSize:10,color:CV.muted}}>{a.tipo.replace(/_/g," ")} · {a.notas}</div></div>
                {S.badge(a.estado==="confirmado"?CV.green:CV.yellow,a.estado)}
              </div>
            ))}
        </div>
        <div style={S.card(CV.cyan)}>
          <div style={S.ttl()}>🤖 Asistente IA — Groq Llama 3.3</div>
          <p style={{fontSize:11,color:CV.muted,marginBottom:10}}>Pregunta sobre marketing, pacientes, estrategias o lentes.</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {["¿Cómo atraer más pacientes jóvenes?","¿Qué promoción hacer este mes?","¿Cómo mejorar mis ventas?","Dame estrategia de seguimiento"].map((q,i)=>(
              <button key={i} style={{...S.btn("sec"),fontSize:10,padding:"4px 9px"}} onClick={()=>askAI(q)}>{q}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input style={{...S.inp,flex:1}} value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI(aiQ)} placeholder="Escribe tu pregunta..."/>
            <button style={S.btn("pri")} onClick={()=>askAI(aiQ)} disabled={aiL}>{aiL?"⏳":"🤖 Preguntar"}</button>
          </div>
          {aiR && <div style={{marginTop:10,padding:"12px 14px",background:CV.navyLt,borderRadius:8,fontSize:12,lineHeight:1.8,color:CV.white,borderLeft:`3px solid ${CV.cyan}`}}>{aiR}</div>}
        </div>
      </div>
    );
  };

  // ─── PACIENTES ────────────────────────────────────────────────
  const Patients = () => {
    const [view, setView]     = useState("list");
    const [selected, setSel]  = useState(null);
    const [filter, setFilter] = useState("todos");

    const filtered = patients.filter(p => {
      const sm = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.cedula.includes(search) || p.correo.toLowerCase().includes(search.toLowerCase());
      const fm = filter==="todos" || p.crm_estado===filter;
      return sm && fm;
    });

    if(view==="detail" && selected) return (
      <PatientDetail
        patient={selected}
        onBack={()=>{setView("list");setSel(null);}}
        onSave={async(p)=>{ await savePatient(p); setSel(patients.find(x=>x.id===p.id)||p); }}
        onCRM={updateCRM} onHistory={addHistorial} onPoints={addPuntos}
        onPrint={(p)=>printReceta(p)}
        onComprobante={(p,items,total)=>generarComprobante(p,items,total)}
        S={S} CV={CV}
      />
    );

    return (
      <div>
        <div style={{...S.row,marginBottom:12}}>
          <div><h2 style={{fontSize:18,fontWeight:900}}>👥 Pacientes</h2><p style={{color:CV.muted,fontSize:11}}>{patients.length} registrados</p></div>
          <button style={S.btn("pri")} onClick={()=>setModal({type:"patient",data:null})}>+ Nuevo Paciente</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <input style={{...S.inp,maxWidth:240}} placeholder="🔍 Nombre, cédula, correo..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {["todos",...CRM_ESTADOS].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${(CRM_COLORES[f]||CV.cyan)}44`,background:filter===f?(CRM_COLORES[f]||CV.cyan)+"33":"transparent",color:CRM_COLORES[f]||CV.cyan,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>
            ))}
          </div>
        </div>
        {filtered.map(p=>(
          <div key={p.id} style={{...S.card(),cursor:"pointer"}} onClick={()=>{setSel(p);setView("detail");}}>
            <div style={S.row}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:CV.navy,flexShrink:0}}>{p.nombre.charAt(0)}</div>
                <div>
                  <div style={{fontWeight:800,fontSize:13}}>{p.nombre}</div>
                  <div style={{fontSize:10,color:CV.muted}}>{p.cedula} · {p.telefono} · {p.correo}</div>
                  <div style={{fontSize:10,color:CV.muted,marginTop:1}}>{p.tipo_lente} {p.proxima_revision?`· Rev: ${fmtD(p.proxima_revision)}`:""} {p.puntos?`· ⭐${p.puntos}pts`:""}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {S.badge(CRM_COLORES[p.crm_estado]||CV.muted,p.crm_estado)}
                <span style={{color:CV.muted}}>›</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div style={{textAlign:"center",padding:30,color:CV.muted}}>Sin resultados.</div>}
      </div>
    );
  };

  // ─── DETALLE PACIENTE ─────────────────────────────────────────
  const PatientDetail = ({patient,onBack,onSave,onCRM,onHistory,onPoints,onPrint,onComprobante,S,CV}) => {
    const [editing, setEditing] = useState(false);
    const [form,    setForm]    = useState({...patient});
    const [nota,    setNota]    = useState("");
    const [notaTipo,setNT]      = useState("nota");
    const [aiL,     setAiL]     = useState(false);
    const [aiR,     setAiR]     = useState("");
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));
    const dias = dd(patient.proxima_revision);

    const analizarPaciente = async () => {
      setAiL(true); setAiR("");
      const sys = "Eres optometrista y asesor de ventas con 20 años de experiencia en ópticas Ecuador. Analizas pacientes y das recomendaciones concretas. Responde en español, máximo 200 palabras.";
      const msg = `Analiza este paciente y dame: 1) Producto adicional para ofrecerle, 2) Mensaje de WhatsApp para enviarle hoy, 3) Cuándo hacer seguimiento.\n\nPaciente: ${patient.nombre}\nOD: ${patient.od_esfera}/${patient.od_cilindro}/${patient.od_eje} OI: ${patient.oi_esfera}/${patient.oi_cilindro}/${patient.oi_eje}\nAdición: ${patient.adicion||"ninguna"}\nLente: ${patient.tipo_lente}\nCRM: ${patient.crm_estado}\nNotas: ${patient.notas}\nRevisión: ${fmtD(patient.proxima_revision)}`;
      try { setAiR(await callGroq(sys, msg)); } catch(e){ setAiR("Error: "+e.message); }
      setAiL(false);
    };

    return (
      <div>
        <button style={{...S.btn("sec"),marginBottom:12}} onClick={onBack}>← Volver</button>
        <div style={{...S.row,marginBottom:12}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:CV.navy}}>{patient.nombre.charAt(0)}</div>
            <div>
              <h2 style={{fontSize:17,fontWeight:900,margin:0}}>{patient.nombre}</h2>
              <div style={{fontSize:10,color:CV.muted}}>ID: {patient.id} · Desde: {fmtD(patient.fecha_registro)} · ⭐ {patient.puntos||0} puntos</div>
            </div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button style={{...S.btn("sec"),fontSize:10}} onClick={()=>onPrint(patient)}>🖨️ Receta</button>
            <button style={{...S.btn("sec"),fontSize:10}} onClick={analizarPaciente}>🤖 Análisis IA</button>
            <button style={{...S.btn("pri"),fontSize:10}} onClick={()=>setEditing(!editing)}>{editing?"❌ Cancelar":"✏️ Editar"}</button>
            {editing && <button style={{...S.btn("ok"),fontSize:10}} onClick={()=>{onSave(form);setEditing(false);}}>💾 Guardar</button>}
          </div>
        </div>

        {dias!==null && dias<=60 && (
          <div style={{background:dias<=30?CV.red+"22":CV.yellow+"22",border:`1px solid ${dias<=30?CV.red:CV.yellow}44`,borderRadius:7,padding:"8px 12px",marginBottom:10,fontSize:11,color:dias<=30?CV.red:CV.yellow}}>
            ⏰ Revisión {dias<=0?"VENCIDA":dias===0?"HOY":`en ${dias} días`} — {fmtD(patient.proxima_revision)}
          </div>
        )}

        {aiR && (
          <div style={S.card(CV.green)}>
            <div style={{...S.ttl(CV.green)}}>🤖 Análisis IA del Paciente</div>
            <div style={{fontSize:12,lineHeight:1.8,color:CV.white,whiteSpace:"pre-wrap"}}>{aiR}</div>
          </div>
        )}
        {aiL && <div style={{...S.card(),fontSize:12,color:CV.muted}}>⏳ Analizando con Groq...</div>}

        <div style={S.g2}>
          <div style={S.card()}>
            <div style={S.ttl()}>👤 Datos Personales</div>
            {editing ? (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[["nombre","Nombre"],["cedula","Cédula"],["telefono","Teléfono"],["correo","Correo"],["fecha_nacimiento","Nacimiento","date"]].map(([k,l,t="text"])=>(
                  <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} type={t} value={form[k]||""} onChange={e=>setF(k,e.target.value)}/></div>
                ))}
                <div><label style={S.lbl}>Género</label>
                  <select style={S.inp} value={form.genero||"F"} onChange={e=>setF("genero",e.target.value)}>
                    <option value="F">Femenino</option><option value="M">Masculino</option><option value="O">Otro</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                {[["📧",patient.correo],["📱",patient.telefono],["🪪",patient.cedula],["🎂",fmtD(patient.fecha_nacimiento)]].map(([i,v],idx)=>(
                  <div key={idx} style={{...S.box,marginBottom:5,fontSize:11}}><span style={{color:CV.muted}}>{i} </span><strong>{v||"—"}</strong></div>
                ))}
              </div>
            )}
            <div style={{marginTop:12}}>
              <div style={S.ttl()}>📊 Estado CRM</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {CRM_ESTADOS.map(e=>(
                  <button key={e} onClick={()=>onCRM(patient.id,e)} style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${CRM_COLORES[e]}44`,background:patient.crm_estado===e?CRM_COLORES[e]+"33":"transparent",color:CRM_COLORES[e],fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{marginTop:10,display:"flex",gap:6}}>
              <button style={{...S.btn("sec"),fontSize:10}} onClick={()=>onPoints(patient.id,10)}>⭐ +10 pts</button>
              <button style={{...S.btn("sec"),fontSize:10}} onClick={()=>onPoints(patient.id,25)}>⭐ +25 pts</button>
            </div>
          </div>

          <div style={S.card(CV.cyan)}>
            <div style={S.ttl()}>👁 Receta Oftálmica</div>
            {editing ? (
              <div>
                <div style={{fontSize:11,fontWeight:700,color:CV.cyan,marginBottom:6}}>OJO DERECHO (OD)</div>
                <div style={S.g3}>
                  {[["od_esfera","Esfera"],["od_cilindro","Cilindro"],["od_eje","Eje °"]].map(([k,l])=>(
                    <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]||""} onChange={e=>setF(k,e.target.value)} placeholder="-2.50"/></div>
                  ))}
                </div>
                <div style={{fontSize:11,fontWeight:700,color:CV.cyanLt,marginBottom:6,marginTop:8}}>OJO IZQUIERDO (OI)</div>
                <div style={S.g3}>
                  {[["oi_esfera","Esfera"],["oi_cilindro","Cilindro"],["oi_eje","Eje °"]].map(([k,l])=>(
                    <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]||""} onChange={e=>setF(k,e.target.value)} placeholder="-2.25"/></div>
                  ))}
                </div>
                <div style={{...S.g2,marginTop:8}}>
                  <div><label style={S.lbl}>Adición</label><input style={S.inp} value={form.adicion||""} onChange={e=>setF("adicion",e.target.value)} placeholder="+2.00"/></div>
                  <div><label style={S.lbl}>Próxima revisión</label><input style={S.inp} type="date" value={form.proxima_revision||""} onChange={e=>setF("proxima_revision",e.target.value)}/></div>
                </div>
                <div style={{marginTop:8}}><label style={S.lbl}>Tipo de lente</label>
                  <select style={S.inp} value={form.tipo_lente||""} onChange={e=>setF("tipo_lente",e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {TIPOS_LENTE.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={S.g2}>
                  <div><label style={S.lbl}>Marca armazón</label><input style={S.inp} value={form.marca_armazon||""} onChange={e=>setF("marca_armazon",e.target.value)}/></div>
                  <div><label style={S.lbl}>Color armazón</label><input style={S.inp} value={form.color_armazon||""} onChange={e=>setF("color_armazon",e.target.value)}/></div>
                </div>
                <div style={{marginTop:8}}><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:60,resize:"vertical"}} value={form.notas||""} onChange={e=>setF("notas",e.target.value)}/></div>
              </div>
            ) : (
              <div>
                <div style={{...S.box,marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:CV.cyan,marginBottom:6}}>OJO DERECHO (OD)</div>
                  <div style={S.g3}>
                    {[["Esfera",patient.od_esfera],["Cilindro",patient.od_cilindro],["Eje",patient.od_eje]].map(([l,v],i)=>(
                      <div key={i} style={{textAlign:"center",background:CV.card,borderRadius:6,padding:6}}>
                        <div style={{fontSize:9,color:CV.muted}}>{l}</div>
                        <div style={{fontSize:16,fontWeight:900,color:CV.cyan}}>{v||"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{...S.box,marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:CV.cyanLt,marginBottom:6}}>OJO IZQUIERDO (OI)</div>
                  <div style={S.g3}>
                    {[["Esfera",patient.oi_esfera],["Cilindro",patient.oi_cilindro],["Eje",patient.oi_eje]].map(([l,v],i)=>(
                      <div key={i} style={{textAlign:"center",background:CV.card,borderRadius:6,padding:6}}>
                        <div style={{fontSize:9,color:CV.muted}}>{l}</div>
                        <div style={{fontSize:16,fontWeight:900,color:CV.cyanLt}}>{v||"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{...S.box,fontSize:11}}>
                  {[["Adición",patient.adicion||"N/A"],["Lente",patient.tipo_lente],["Armazón",patient.marca_armazon],["Color",patient.color_armazon],["Próx. Revisión",fmtD(patient.proxima_revision)]].map(([l,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:CV.muted}}>{l}:</span><strong>{v||"—"}</strong></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={S.card()}>
          <div style={{...S.row,marginBottom:10}}>
            <div style={{...S.ttl(CV.purple)}}>📋 Historial</div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            <select style={{...S.inp,maxWidth:130}} value={notaTipo} onChange={e=>setNT(e.target.value)}>
              {["nota","llamada","seguimiento","venta","consulta","correo","whatsapp"].map(t=><option key={t}>{t}</option>)}
            </select>
            <input style={{...S.inp,flex:1}} value={nota} onChange={e=>setNota(e.target.value)} placeholder="Agregar nota..." onKeyDown={e=>{if(e.key==="Enter"&&nota.trim()){onHistory(patient.id,notaTipo,nota);setNota("");}}}/>
            <button style={S.btn("ok")} onClick={()=>{if(nota.trim()){onHistory(patient.id,notaTipo,nota);setNota("");}}}>+ Agregar</button>
          </div>
          {[...(patient.historial||[])].reverse().map((h,i)=>(
            <div key={i} style={{...S.box,marginBottom:6,fontSize:11,borderLeft:`3px solid ${CV.cyan}44`}}>
              <div style={{display:"flex",gap:6,marginBottom:3}}>
                {S.badge(CV.cyan,h.tipo)}
                <span style={{color:CV.muted}}>{h.fecha}</span>
              </div>
              <div>{h.detalle}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── CRM ──────────────────────────────────────────────────────
  const CRMView = () => (
    <div>
      <h2 style={{fontSize:18,fontWeight:900,marginBottom:14}}>📊 Pipeline CRM</h2>
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
        {CRM_ESTADOS.map(estado=>{
          const group = patients.filter(p=>p.crm_estado===estado);
          return (
            <div key={estado} style={{minWidth:210,background:CV.card,borderRadius:11,border:`1px solid ${CRM_COLORES[estado]}33`,flexShrink:0}}>
              <div style={{padding:"10px 12px",borderBottom:`1px solid ${CV.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:800,color:CRM_COLORES[estado],textTransform:"uppercase"}}>{estado}</span>
                <span style={{background:CRM_COLORES[estado]+"33",color:CRM_COLORES[estado],borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}}>{group.length}</span>
              </div>
              <div style={{padding:8,maxHeight:460,overflowY:"auto"}}>
                {group.map(p=>(
                  <div key={p.id} style={{background:CV.navyLt,borderRadius:8,padding:"9px 11px",marginBottom:7,cursor:"pointer",border:`1px solid ${CV.border}`}} onClick={()=>{setSearch(p.nombre);setTab("patients");}}>
                    <div style={{fontWeight:700,fontSize:12,marginBottom:2}}>{p.nombre}</div>
                    <div style={{fontSize:10,color:CV.muted}}>{p.telefono}</div>
                    <div style={{fontSize:10,color:CV.muted,marginTop:1}}>{p.tipo_lente||"Sin lente"}</div>
                    {p.proxima_revision && <div style={{marginTop:4,fontSize:10,color:dd(p.proxima_revision)<=30?CV.red:CV.muted}}>Rev: {fmtD(p.proxima_revision)}</div>}
                    <div style={{marginTop:6,display:"flex",gap:3}}>
                      {CRM_ESTADOS.filter(e=>e!==estado).slice(0,2).map(e=>(
                        <button key={e} style={{fontSize:9,padding:"1px 6px",borderRadius:20,border:`1px solid ${CRM_COLORES[e]}44`,background:"transparent",color:CRM_COLORES[e],cursor:"pointer",fontFamily:"inherit"}} onClick={ev=>{ev.stopPropagation();updateCRM(p.id,e);}}>→{e}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {group.length===0 && <div style={{color:CV.muted,fontSize:10,padding:10,textAlign:"center"}}>Sin pacientes</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── CAMPAÑAS (con psicología DHL) ───────────────────────────
  const Campaigns = () => {
    const [sel, setSel]     = useState(null);
    const [target, setTgt]  = useState("todos");
    const [prev, setPrev]   = useState(false);
    const [aiGen, setAiGen] = useState(false);
    const [genResult, setGR]= useState("");

    const tgCounts = {
      todos: patients.length,
      nuevos: patients.filter(p=>p.crm_estado==="nuevo").length,
      seguimiento: patients.filter(p=>p.crm_estado==="seguimiento").length,
      inactivos: patients.filter(p=>p.crm_estado==="inactivo").length,
      fieles: patients.filter(p=>p.crm_estado==="fiel").length,
    };

    const generarCorreoIA = async () => {
      if(!sel) return;
      setAiGen(true); setGR("");
      const arquetipo = sel.arquetipo || ARQUETIPOS[0];
      const sys = `Eres un experto en copywriting con psicología de ventas profunda. Usas el framework DHL con 5 capas de dolor (explícito, oculto, frustración acumulada, bloqueo mental, deseo reprimido), los 10 arquetipos de clientes, y los principios de Cialdini. Escribes correos que venden. Responde SOLO con el cuerpo del correo, en español, máximo 200 palabras, tono humano y cercano.`;
      const msg = `Escribe un correo de tipo "${sel.tipo}" para el arquetipo "${arquetipo}" para una óptica en Ecuador. El correo tiene que activar el deseo de volver a la óptica. Asunto: "${sel.asunto}". Capa de dolor principal a atacar: ${sel.tipo==="recordatorio"?"miedo a perder visión":"deseo de verse mejor y sentirse moderno"}. Usa la psicología del Big Dominó: cambia la creencia limitante "no necesito ir al optometrista si veo bien" por "esperar es lo más caro que puedo hacer".`;
      try { setGR(await callGroq(sys, msg, 400)); } catch(e){ setGR("Error: "+e.message); }
      setAiGen(false);
    };

    const simulate = () => {
      const count = tgCounts[target] || patients.length;
      toast_(`📧 Campaña enviada a ${count} pacientes`);
      const c = {id:"C"+uid(), nombre:sel.nombre, asunto:sel.asunto, segmento:target, enviados:count, fecha:now(), abiertos:Math.floor(count*.42), clics:Math.floor(count*.18)};
      const updated = [c,...campaigns]; setCampaigns(updated); save("cv-campaigns", updated);
    };

    return (
      <div>
        <h2 style={{fontSize:18,fontWeight:900,marginBottom:14}}>✉️ Campañas — Psicología DHL Integrada</h2>
        <p style={{fontSize:11,color:CV.muted,marginBottom:12}}>Cada plantilla usa los arquetipos DHL y las 5 capas de dolor para máxima conversión.</p>
        <div style={S.g2}>
          {EMAIL_TEMPLATES.map(t=>(
            <div key={t.id} style={{...S.card(sel?.id===t.id?CV.cyan:null),cursor:"pointer",border:sel?.id===t.id?`2px solid ${CV.cyan}`:`1px solid ${CV.border}`}} onClick={()=>setSel(t)}>
              <div style={{fontWeight:800,fontSize:12,marginBottom:4}}>{t.nombre}</div>
              <div style={{fontSize:10,color:CV.muted,marginBottom:4}}>📧 {t.asunto}</div>
              <div style={{display:"flex",gap:4,marginBottom:6}}>
                {S.badge(CV.purple,"Arquetipo: "+t.arquetipo)}
                {S.badge(CV.cyan,t.tipo)}
              </div>
              <div style={{fontSize:10,color:CV.muted,lineHeight:1.5}}>{t.cuerpo.slice(0,100)}...</div>
              {sel?.id===t.id && <div style={{marginTop:8}}>{S.badge(CV.cyan,"✅ Seleccionada")}</div>}
            </div>
          ))}
        </div>
        {sel && (
          <div style={S.card(CV.green)}>
            <div style={{...S.ttl(CV.green)}}>⚙️ Configurar envío</div>
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>Segmento de pacientes</label>
              <select style={S.inp} value={target} onChange={e=>setTgt(e.target.value)}>
                {Object.entries(tgCounts).map(([k,v])=><option key={k} value={k}>{k} ({v} pacientes)</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <button style={S.btn("sec")} onClick={()=>setPrev(!prev)}>👁 {prev?"Ocultar":"Ver"} Preview</button>
              <button style={S.btn("sec")} onClick={generarCorreoIA} disabled={aiGen}>{aiGen?"⏳ Generando...":"🤖 Regenerar con IA DHL"}</button>
              <button style={S.btn("pri")} onClick={simulate}>🚀 Enviar</button>
            </div>
            {genResult && (
              <div style={{marginBottom:10,padding:"12px 14px",background:CV.navyLt,borderRadius:8,fontSize:11,lineHeight:1.8,color:CV.white,borderLeft:`3px solid ${CV.cyan}`,whiteSpace:"pre-wrap"}}>{genResult}</div>
            )}
            {prev && (
              <div style={{marginTop:10,background:CV.navy,borderRadius:8,padding:14,fontSize:11,lineHeight:1.8,whiteSpace:"pre-wrap",color:CV.white,border:`1px solid ${CV.border}`}}>
                <div style={{fontWeight:800,color:CV.cyan,marginBottom:8}}>ASUNTO: {sel.asunto}</div>
                {(genResult||sel.cuerpo).replace("[NOMBRE]","[Nombre]")}
              </div>
            )}
          </div>
        )}
        {campaigns.length>0 && (
          <div style={S.card()}>
            <div style={S.ttl()}>📊 Historial</div>
            {campaigns.map((c,i)=>(
              <div key={i} style={{...S.box,marginBottom:7}}>
                <div style={S.row}>
                  <div><div style={{fontWeight:700,fontSize:12}}>{c.nombre}</div><div style={{fontSize:10,color:CV.muted}}>{c.fecha} · {c.segmento}</div></div>
                  <div style={{textAlign:"right",fontSize:11}}><div style={{color:CV.cyan,fontWeight:700}}>{c.enviados} enviados</div><div style={{color:CV.green}}>{c.abiertos} abiertos ({Math.round(c.abiertos/c.enviados*100)}%)</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── INVENTARIO + CÓDIGO DE BARRAS ───────────────────────────
  const Inventory = () => {
    const [catFilter, setCat] = useState("todos");
    const [barcodeMode, setBC] = useState(false);
    const [barcodeVal, setBV]  = useState("");
    const cats = ["todos","lentes","armazones","contactos","accesorios"];
    const filtered = catFilter==="todos" ? products : products.filter(p=>p.categoria===catFilter);
    const totalValue = products.reduce((s,p)=>s+p.precio_venta*p.stock, 0);

    const buscarPorCodigo = (codigo) => {
      const prod = products.find(p=>p.codigo===codigo);
      if(prod) { toast_(`✅ Encontrado: ${prod.nombre}`); setModal({type:"product",data:prod}); }
      else toast_("⚠️ Código no encontrado en inventario");
      setBV("");
    };

    return (
      <div>
        <div style={{...S.row,marginBottom:12}}>
          <div><h2 style={{fontSize:18,fontWeight:900}}>📦 Inventario</h2><p style={{color:CV.muted,fontSize:11}}>{products.length} productos · Valor: ${totalValue.toLocaleString()}</p></div>
          <div style={{display:"flex",gap:6}}>
            <button style={{...S.btn("sec"),fontSize:10}} onClick={()=>setBC(!barcodeMode)}>📱 {barcodeMode?"Ocultar":"Lector"} Código</button>
            <button style={S.btn("pri")} onClick={()=>setModal({type:"product",data:null})}>+ Producto</button>
          </div>
        </div>

        {barcodeMode && (
          <div style={{...S.card(CV.cyan),marginBottom:12}}>
            <div style={S.ttl()}>📱 Lector de Código de Barras</div>
            <p style={{fontSize:11,color:CV.muted,marginBottom:8}}>Escribe o escanea el código del producto. Si tienes lector físico conectado al PC, simplemente enfoca el campo y escanea.</p>
            <div style={{display:"flex",gap:8}}>
              <input style={{...S.inp,flex:1}} value={barcodeVal} onChange={e=>setBV(e.target.value)} onKeyDown={e=>e.key==="Enter"&&buscarPorCodigo(barcodeVal)} placeholder="Escanea o escribe el código aquí..." autoFocus/>
              <button style={S.btn("pri")} onClick={()=>buscarPorCodigo(barcodeVal)}>🔍 Buscar</button>
            </div>
            <p style={{fontSize:10,color:CV.muted,marginTop:6}}>💡 El lector de código de barras físico (USB o Bluetooth) escribe el código automáticamente cuando escaneas — funciona igual que un teclado.</p>
          </div>
        )}

        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          {cats.map(c=><button key={c} style={{padding:"4px 10px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:700,fontSize:10,background:catFilter===c?CV.cyan:"transparent",color:catFilter===c?CV.navy:"#4A6A8A",fontFamily:"inherit"}} onClick={()=>setCat(c)}>{c}</button>)}
        </div>
        <div style={S.g3}>
          {filtered.map(p=>(
            <div key={p.id} style={{...S.card(p.stock<10?CV.red:null),cursor:"pointer"}} onClick={()=>setModal({type:"product",data:p})}>
              <div style={{fontWeight:800,fontSize:12,marginBottom:3}}>{p.nombre}</div>
              <div style={{fontSize:10,color:CV.muted,marginBottom:6}}>{p.marca} · {p.categoria}</div>
              {p.codigo && <div style={{fontSize:9,color:CV.muted,marginBottom:4}}>Código: {p.codigo}</div>}
              <div style={{...S.row,marginBottom:4}}><span style={{fontSize:11}}>Venta: <strong style={{color:CV.cyan}}>${p.precio_venta}</strong></span><span style={{fontSize:10,color:CV.muted}}>Costo: ${p.precio_costo}</span></div>
              <div style={S.row}><span style={{fontSize:20,fontWeight:900,color:p.stock<10?CV.red:CV.green}}>{p.stock}</span><span style={{fontSize:10,color:CV.muted}}>uds · {Math.round((p.precio_venta-p.precio_costo)/p.precio_venta*100)}%</span></div>
              {p.stock<10 && <div style={{fontSize:9,color:CV.red,marginTop:4,fontWeight:700}}>⚠️ Stock bajo</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── AGENDA ───────────────────────────────────────────────────
  const AgendaView = () => {
    const sorted = [...agenda].sort((a,b)=>a.fecha.localeCompare(b.fecha)||a.hora.localeCompare(b.hora));
    return (
      <div>
        <div style={{...S.row,marginBottom:14}}>
          <h2 style={{fontSize:18,fontWeight:900}}>📅 Agenda</h2>
          <button style={S.btn("pri")} onClick={()=>setModal({type:"appt",data:null})}>+ Nueva Cita</button>
        </div>
        {sorted.map((a,i)=>(
          <div key={i} style={{...S.card(a.fecha===now()?CV.green:null),cursor:"pointer"}} onClick={()=>setModal({type:"appt",data:a})}>
            <div style={S.row}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{background:a.fecha===now()?CV.green+"22":CV.cyan+"22",borderRadius:8,padding:"8px 12px",textAlign:"center",minWidth:52}}>
                  <div style={{fontSize:16,fontWeight:900,color:a.fecha===now()?CV.green:CV.cyan}}>{a.hora}</div>
                  <div style={{fontSize:9,color:CV.muted}}>{fmtD(a.fecha)}</div>
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{a.pnombre}</div>
                  <div style={{fontSize:10,color:CV.muted}}>{a.tipo.replace(/_/g," ")} · {a.notas}</div>
                </div>
              </div>
              {S.badge(a.estado==="confirmado"?CV.green:CV.yellow,a.estado)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── COMPROBANTES ─────────────────────────────────────────────
  const ComprobantesView = () => {
    const [selPat, setSelPat]   = useState("");
    const [items, setItems]     = useState([{nombre:"",precio:0}]);
    const addItem = () => setItems([...items,{nombre:"",precio:0}]);
    const setItem = (i,k,v) => { const ni=[...items]; ni[i]={...ni[i],[k]:v}; setItems(ni); };
    const total = items.reduce((s,i)=>s+(+i.precio||0),0);
    const patOpts = patients.map(p=>({value:p.id, label:`${p.nombre} — ${p.cedula}`}));

    const emitir = () => {
      const pat = patients.find(p=>p.id===selPat);
      if(!pat) { toast_("⚠️ Selecciona un paciente"); return; }
      if(!items[0].nombre) { toast_("⚠️ Agrega al menos un producto"); return; }
      generarComprobante(pat, items, total);
    };

    return (
      <div>
        <h2 style={{fontSize:18,fontWeight:900,marginBottom:14}}>🧾 Comprobantes y Notas de Venta</h2>
        <div style={S.card(CV.cyan)}>
          <div style={S.ttl()}>📋 Emitir Comprobante</div>
          <div style={{marginBottom:10}}>
            <label style={S.lbl}>Paciente / Cliente</label>
            <select style={S.inp} value={selPat} onChange={e=>setSelPat(e.target.value)}>
              <option value="">Seleccionar paciente...</option>
              {patOpts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{...S.ttl(),marginBottom:8}}>Productos / Servicios</div>
          {items.map((item,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:7}}>
              <input style={{...S.inp,flex:2}} placeholder={`Producto ${i+1} (ej: Lente Progresivo)`} value={item.nombre} onChange={e=>setItem(i,"nombre",e.target.value)}/>
              <input style={{...S.inp,flex:1,maxWidth:100}} type="number" placeholder="Precio" value={item.precio||""} onChange={e=>setItem(i,"precio",e.target.value)}/>
              {items.length>1 && <button style={{...S.btn("red"),padding:"6px 10px"}} onClick={()=>setItems(items.filter((_,j)=>j!==i))}>✕</button>}
            </div>
          ))}
          <div style={{...S.row,marginTop:10}}>
            <button style={{...S.btn("sec"),fontSize:10}} onClick={addItem}>+ Agregar ítem</button>
            <div style={{fontSize:16,fontWeight:900,color:CV.cyan}}>Total: ${total.toFixed(2)}</div>
          </div>
          <button style={{...S.btn("pri"),width:"100%",marginTop:12,padding:10}} onClick={emitir}>🖨️ Generar e Imprimir Comprobante</button>
        </div>

        {comprobantes.length>0 && (
          <div style={S.card()}>
            <div style={S.ttl()}>📜 Historial de Comprobantes</div>
            {comprobantes.slice(0,10).map((c,i)=>(
              <div key={i} style={{...S.box,marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:12}}>{c.id} — {c.paciente}</div>
                  <div style={{fontSize:10,color:CV.muted}}>{c.fecha} · {c.items.length} ítem(s)</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:14,fontWeight:900,color:CV.green}}>${c.total}</span>
                  <button style={{...S.btn("sec"),fontSize:9,padding:"2px 8px"}} onClick={()=>printComprobante(c)}>🖨️ Reimprimir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── PROVEEDORES IA ───────────────────────────────────────────
  const ProveedoresView = () => {
    const [query, setQuery]   = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoad]  = useState(false);
    const tiposNegocio = ["Óptica","Mecánica","Petshop","Ferretería","Tecnología","Farmacia","Restaurante","Salud"];

    const buscar = async (tipo) => {
      const q = tipo || query;
      if(!q) return;
      setLoad(true); setResult("");
      const sys = "Eres un experto en cadenas de suministro para negocios locales en Ecuador. Conoces importadores, distribuidores mayoristas y proveedores locales en Quito, Guayaquil y principales ciudades. Respondes en español con información práctica.";
      const msg = `Para un negocio tipo "${q}" en Ecuador, dame: 1) Top 5 importadores o distribuidores mayoristas con sus datos de contacto aproximados y especialidad, 2) Mercados o zonas físicas en Quito/Guayaquil donde conseguir mercadería, 3) Páginas web o plataformas para comprar al por mayor, 4) Precio estimado promedio de compra al por mayor vs precio de venta al público. Sé específico con Ecuador.`;
      try { setResult(await callGroq(sys, msg, 800)); } catch(e){ setResult("Error: "+e.message); }
      setLoad(false);
    };

    return (
      <div>
        <h2 style={{fontSize:18,fontWeight:900,marginBottom:6}}>🔍 Proveedores e Importadores — IA</h2>
        <p style={{color:CV.muted,fontSize:11,marginBottom:14}}>La IA analiza el tipo de negocio y te recomienda dónde comprar mercadería en Ecuador al mejor precio.</p>

        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {tiposNegocio.map(t=>(
            <button key={t} style={{...S.btn("sec"),fontSize:10,padding:"5px 11px"}} onClick={()=>buscar(t)}>{t}</button>
          ))}
        </div>

        <div style={S.card(CV.cyan)}>
          <div style={S.ttl()}>🔍 Búsqueda personalizada</div>
          <div style={{display:"flex",gap:8}}>
            <input style={{...S.inp,flex:1}} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&buscar()} placeholder="Ej: productos para veterinaria, insumos para peluquería..."/>
            <button style={S.btn("pri")} onClick={()=>buscar()} disabled={loading}>{loading?"⏳":"🔍 Buscar"}</button>
          </div>
        </div>

        {result && (
          <div style={S.card(CV.green)}>
            <div style={{...S.ttl(CV.green)}}>📋 Resultados — Proveedores Ecuador</div>
            <div style={{fontSize:12,lineHeight:1.9,color:CV.white,whiteSpace:"pre-wrap"}}>{result}</div>
          </div>
        )}
        {loading && <div style={{...S.card(),fontSize:12,color:CV.muted}}>⏳ Buscando proveedores con Groq IA...</div>}
      </div>
    );
  };

  // ─── PAGOS + DEUNA ────────────────────────────────────────────
  const PagosView = () => (
    <div>
      <h2 style={{fontSize:18,fontWeight:900,marginBottom:14}}>💳 Opciones de Pago</h2>
      <div style={S.g2}>
        <div style={S.card(CV.cyan)}>
          <div style={S.ttl()}>📱 DEUNA — Banco del Pichincha</div>
          <p style={{fontSize:11,color:CV.muted,marginBottom:10}}>Tus clientes pagan escaneando el código QR con la app DEUNA.</p>
          <div style={{background:CV.white,borderRadius:10,padding:16,textAlign:"center",marginBottom:10}}>
            <div style={{fontSize:11,color:CV.navyMid,fontWeight:700,marginBottom:6}}>Código DEUNA</div>
            <div style={{fontSize:28,fontWeight:900,color:CV.navyMid,letterSpacing:2}}>{config.deuna_codigo||"clickvision"}</div>
            <div style={{fontSize:10,color:CV.muted,marginTop:4}}>Abre DEUNA → Pagar → Buscar comercio</div>
          </div>
          <div style={{...S.box,fontSize:11}}><span style={{color:CV.muted}}>Banco: </span><strong>{config.cuenta_banco}</strong></div>
        </div>

        <div style={S.card(CV.green)}>
          <div style={{...S.ttl(CV.green)}}>💳 Otras Opciones de Pago</div>
          {[
            ["💳 Payphone","Tarjeta VISA/MC · 5%+IVA comisión",`https://pay.payphone.app/${config.deuna_codigo||"clickvision"}`],
            ["🌐 PayPal","Internacional · 3.49%+$0.49",`https://paypal.me/${config.deuna_codigo||"clickvision"}`],
            ["₿ Binance Pay","Cripto USDT · 0% comisión","https://pay.binance.com"],
          ].map(([nombre,detalle,url],i)=>(
            <div key={i} style={{...S.box,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:700,fontSize:12}}>{nombre}</div><div style={{fontSize:10,color:CV.muted}}>{detalle}</div></div>
              <button style={{...S.btn("sec"),fontSize:10,padding:"4px 8px"}} onClick={()=>window.open(url,"_blank")}>Ir →</button>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card()}>
        <div style={S.ttl()}>📱 Recargas BeMovil</div>
        <p style={{fontSize:11,color:CV.muted,marginBottom:10}}>Ofrece recargas a tus clientes y gana comisión en cada una. Registrate en bemovil.ec como distribuidor.</p>
        <div style={{display:"flex",gap:8}}>
          <button style={{...S.btn("pri"),flex:1}} onClick={()=>window.open("https://bemovil.ec","_blank")}>🌐 Ir a BeMovil</button>
          <button style={{...S.btn("sec"),flex:1}} onClick={()=>window.open("https://bemovil.ec/afiliados","_blank")}>👥 Ser Distribuidor</button>
        </div>
      </div>

      <div style={S.card()}>
        <div style={S.ttl()}>🔄 Backup de Base de Datos</div>
        <p style={{fontSize:11,color:CV.muted,marginBottom:10}}>Exporta o importa toda la base de datos del sistema.</p>
        <div style={{display:"flex",gap:8}}>
          <button style={{...S.btn("ok"),flex:1}} onClick={exportBackup}>💾 Exportar Backup JSON</button>
          <label style={{...S.btn("sec"),flex:1,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            📁 Importar Backup
            <input type="file" accept=".json" style={{display:"none"}} onChange={e=>e.target.files[0]&&importBackup(e.target.files[0])}/>
          </label>
        </div>
      </div>
    </div>
  );

  // ─── MI TIENDA ────────────────────────────────────────────────
  const TiendaView = () => {
    const [catFil, setCatFil] = useState("todos");
    const cats = ["todos","lentes","armazones","contactos","accesorios"];
    const filtered = catFil==="todos" ? products.filter(p=>p.stock>0) : products.filter(p=>p.categoria===catFil&&p.stock>0);

    return (
      <div>
        <div style={{marginBottom:14,textAlign:"center"}}>
          <h2 style={{fontSize:22,fontWeight:900,color:CV.white}}>{config.nombre}</h2>
          <p style={{color:CV.muted,fontSize:12}}>Catálogo de productos disponibles</p>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:14,justifyContent:"center",flexWrap:"wrap"}}>
          {cats.map(c=><button key={c} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${CV.border}`,cursor:"pointer",fontWeight:700,fontSize:11,background:catFil===c?CV.cyan:"transparent",color:catFil===c?CV.navy:CV.muted,fontFamily:"inherit"}} onClick={()=>setCatFil(c)}>{c}</button>)}
        </div>
        <div style={S.g3}>
          {filtered.map(p=>(
            <div key={p.id} style={{...S.card(CV.cyan),textAlign:"center"}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:`linear-gradient(135deg,${CV.cyan}22,${CV.cyanDk}22)`,border:`2px solid ${CV.cyan}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 10px"}}>
                {p.categoria==="lentes"?"👓":p.categoria==="armazones"?"🕶️":p.categoria==="contactos"?"👁":p.categoria==="accesorios"?"🧴":"📦"}
              </div>
              <div style={{fontWeight:800,fontSize:13,marginBottom:3}}>{p.nombre}</div>
              <div style={{fontSize:11,color:CV.muted,marginBottom:6}}>{p.marca} · {p.descripcion}</div>
              <div style={{fontSize:22,fontWeight:900,color:CV.cyan,marginBottom:4}}>${p.precio_venta}</div>
              <div style={{fontSize:10,color:CV.muted,marginBottom:10}}>{p.stock} en stock</div>
              <button style={{...S.btn("pri"),width:"100%"}} onClick={()=>{
                const msg = `Hola ${config.nombre}! Me interesa el producto: ${p.nombre} a $${p.precio_venta}. ¿Tienen disponible?`;
                window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");
              }}>💬 Consultar por WhatsApp</button>
            </div>
          ))}
        </div>
        {filtered.length===0 && <div style={{textAlign:"center",padding:40,color:CV.muted}}>Sin productos disponibles en esta categoría.</div>}
      </div>
    );
  };

  // ─── SITIO WEB IA LAB ─────────────────────────────────────────
  const WebView = () => {
    const PLANES = [
      {nombre:"Starter",precio:150,mensual:40,color:CV.muted,beneficios:["5 páginas profesionales","Dominio .com gratis 1 año","Hosting incluido","WhatsApp flotante","Google Analytics","SSL certificado"]},
      {nombre:"Emprendedor",precio:250,mensual:50,color:CV.cyan,beneficios:["Todo Starter +","Hasta 15 páginas","Blog integrado","SEO básico","Redes sociales","2 revisiones/mes"],popular:true},
      {nombre:"Empresa",precio:600,mensual:70,color:CV.purple,beneficios:["Todo Emprendedor +","Hasta 30 páginas","Formularios avanzados","Integración sistemas","Chat en línea","Reunión mensual"]},
      {nombre:"Ecommerce",precio:1000,mensual:250,color:CV.yellow,beneficios:["Tienda online completa","Pasarela Payphone","Gestión inventario","Hasta 500 productos","Pedidos automáticos","Capacitación equipo"]},
    ];
    return (
      <div>
        <div style={{textAlign:"center",marginBottom:20}}>
          <h2 style={{fontSize:22,fontWeight:900,color:CV.cyan}}>🌐 Lleva tu negocio a internet</h2>
          <p style={{color:CV.muted,fontSize:12}}>Sitios web profesionales por IA LAB Institute — Quito, Ecuador</p>
        </div>
        <div style={S.g2}>
          {PLANES.map((plan,i)=>(
            <div key={i} style={{...S.card(plan.popular?CV.cyan:plan.color),border:plan.popular?`2px solid ${CV.cyan}`:`1px solid ${plan.color}33`,position:"relative"}}>
              {plan.popular && <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`,borderRadius:20,padding:"2px 12px",fontSize:10,fontWeight:800,color:CV.navy,whiteSpace:"nowrap"}}>⭐ MÁS POPULAR</div>}
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:16,fontWeight:900,color:plan.color}}>{plan.nombre}</div>
                <div style={{fontSize:26,fontWeight:900,color:CV.white}}>${plan.precio}</div>
                <div style={{fontSize:11,color:CV.muted}}>+ ${plan.mensual}/mes mantenimiento</div>
              </div>
              <div style={{marginBottom:12}}>
                {plan.beneficios.map((b,j)=><div key={j} style={{fontSize:11,color:CV.muted,marginBottom:4}}>✅ {b}</div>)}
              </div>
              <button style={{...S.btn("pri"),width:"100%"}} onClick={()=>window.open(`https://wa.me/593${config.whatsapp.replace("593","")||"912345678"}?text=${encodeURIComponent(`Hola, me interesa el plan ${plan.nombre} para mi sitio web. Precio: $${plan.precio} + $${plan.mensual}/mes`)}`)}>
                Quiero este plan →
              </button>
            </div>
          ))}
        </div>
        <div style={{...S.card(),textAlign:"center",marginTop:8}}>
          <div style={{fontSize:12,color:CV.muted}}>¿Dudas? Contáctanos directo:</div>
          <div style={{fontSize:14,fontWeight:700,color:CV.cyan,marginTop:4}}>IA LAB Institute · Quito, Ecuador</div>
          <div style={{fontSize:11,color:CV.muted}}>contacto@ialabinstitute.com</div>
        </div>
      </div>
    );
  };

  // ─── CONFIGURACIÓN ────────────────────────────────────────────
  const ConfigView = () => {
    const [form, setForm] = useState({...config});
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));
    const guardar = async () => { setConfig(form); await save("cv-config", form); toast_("✅ Configuración guardada"); };

    return (
      <div>
        <h2 style={{fontSize:18,fontWeight:900,marginBottom:14}}>⚙️ Configuración del Negocio</h2>
        <div style={S.card()}>
          <div style={S.ttl()}>🏢 Datos del Negocio</div>
          <div style={S.g2}>
            {[["nombre","Nombre del negocio"],["ruc","RUC"],["telefono","Teléfono"],["correo","Correo electrónico"],["whatsapp","WhatsApp (con 593)"],["direccion","Dirección"]].map(([k,l])=>(
              <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]||""} onChange={e=>setF(k,e.target.value)}/></div>
            ))}
          </div>
          <div style={{marginTop:10,marginBottom:10}}>
            <label style={S.lbl}>Cuenta bancaria para transferencias</label>
            <input style={S.inp} value={form.cuenta_banco||""} onChange={e=>setF("cuenta_banco",e.target.value)} placeholder="Banco · Tipo · Número de cuenta"/>
          </div>
          <div style={{marginBottom:10}}>
            <label style={S.lbl}>Código DEUNA</label>
            <input style={S.inp} value={form.deuna_codigo||""} onChange={e=>setF("deuna_codigo",e.target.value)} placeholder="Ej: clickvision"/>
          </div>
          <div style={{marginBottom:10}}>
            <label style={S.lbl}>URL logo (link de imagen)</label>
            <input style={S.inp} value={form.logo||""} onChange={e=>setF("logo",e.target.value)} placeholder="https://tu-logo.com/logo.png"/>
          </div>
          <button style={{...S.btn("pri"),width:"100%",marginTop:8,padding:10}} onClick={guardar}>💾 Guardar Configuración</button>
        </div>

        <div style={S.card()}>
          <div style={S.ttl(CV.yellow)}>⚠️ Configuración Avanzada</div>
          <p style={{fontSize:11,color:CV.muted,marginBottom:10}}>Para conectar la IA y los backups automáticos, configura estas variables en Vercel → Settings → Environment Variables:</p>
          {[
            ["REACT_APP_GROQ_API_KEY","Tu clave Groq (gsk_...)"],
            ["REACT_APP_SHEET_URL","URL del script de Google Sheets"],
            ["REACT_APP_MC_KEY","API Key de Mailchimp"],
            ["REACT_APP_MC_DC","Data center Mailchimp (ej: us1)"],
            ["REACT_APP_MC_LIST","Audience ID de Mailchimp"],
          ].map(([k,desc],i)=>(
            <div key={i} style={{...S.box,marginBottom:7,fontSize:11}}>
              <div style={{fontWeight:700,color:CV.cyan,marginBottom:2}}>{k}</div>
              <div style={{color:CV.muted}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── MODALES ──────────────────────────────────────────────────
  const PatientModal = ({data}) => {
    const [form, setForm] = useState(data || {nombre:"",cedula:"",telefono:"",correo:"",fecha_nacimiento:"",genero:"F",od_esfera:"",od_cilindro:"",od_eje:"",oi_esfera:"",oi_cilindro:"",oi_eje:"",adicion:"",tipo_lente:"",marca_armazon:"",color_armazon:"",material:"",proxima_revision:"",notas:"",crm_estado:"nuevo"});
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));
    return (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={S.ttl()}>{data?"✏️ Editar":"👤 Nuevo"} Paciente</div>
        <div style={S.g2}>
          {[["nombre","Nombre completo *"],["cedula","Cédula *"],["telefono","Teléfono"],["correo","Correo"]].map(([k,l])=>(
            <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]||""} onChange={e=>setF(k,e.target.value)}/></div>
          ))}
          <div><label style={S.lbl}>Nacimiento</label><input style={S.inp} type="date" value={form.fecha_nacimiento||""} onChange={e=>setF("fecha_nacimiento",e.target.value)}/></div>
          <div><label style={S.lbl}>Género</label><select style={S.inp} value={form.genero||"F"} onChange={e=>setF("genero",e.target.value)}><option value="F">Femenino</option><option value="M">Masculino</option><option value="O">Otro</option></select></div>
        </div>
        <div style={{fontSize:11,fontWeight:800,color:CV.cyan,padding:"6px 0 2px",borderTop:`1px solid ${CV.border}`}}>👁 RECETA OFTÁLMICA</div>
        <div style={{fontSize:10,fontWeight:700,color:CV.cyan,marginBottom:4}}>OJO DERECHO (OD)</div>
        <div style={S.g3}>
          {[["od_esfera","Esfera"],["od_cilindro","Cilindro"],["od_eje","Eje °"]].map(([k,l])=>(
            <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]||""} onChange={e=>setF(k,e.target.value)} placeholder={k.includes("eje")?"180":"-2.50"}/></div>
          ))}
        </div>
        <div style={{fontSize:10,fontWeight:700,color:CV.cyanLt,marginBottom:4}}>OJO IZQUIERDO (OI)</div>
        <div style={S.g3}>
          {[["oi_esfera","Esfera"],["oi_cilindro","Cilindro"],["oi_eje","Eje °"]].map(([k,l])=>(
            <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]||""} onChange={e=>setF(k,e.target.value)} placeholder={k.includes("eje")?"175":"-2.25"}/></div>
          ))}
        </div>
        <div style={S.g2}>
          <div><label style={S.lbl}>Adición</label><input style={S.inp} value={form.adicion||""} onChange={e=>setF("adicion",e.target.value)} placeholder="+2.00"/></div>
          <div><label style={S.lbl}>Próxima revisión</label><input style={S.inp} type="date" value={form.proxima_revision||""} onChange={e=>setF("proxima_revision",e.target.value)}/></div>
        </div>
        <div><label style={S.lbl}>Tipo de lente</label>
          <select style={S.inp} value={form.tipo_lente||""} onChange={e=>setF("tipo_lente",e.target.value)}>
            <option value="">Seleccionar...</option>
            {TIPOS_LENTE.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={S.g3}>
          {[["marca_armazon","Marca armazón"],["color_armazon","Color"],["material","Material"]].map(([k,l])=>(
            <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={form[k]||""} onChange={e=>setF(k,e.target.value)}/></div>
          ))}
        </div>
        <div><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:60,resize:"vertical"}} value={form.notas||""} onChange={e=>setF("notas",e.target.value)}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button style={S.btn("sec")} onClick={closeModal}>Cancelar</button>
          <button style={S.btn("pri")} onClick={()=>savePatient(form)} disabled={!form.nombre||!form.cedula}>💾 {data?"Actualizar":"Registrar"}</button>
        </div>
      </div>
    );
  };

  const ProductModal = ({data}) => {
    const [form, setForm] = useState(data||{nombre:"",categoria:"lentes",marca:"",precio_costo:0,precio_venta:0,stock:0,descripcion:"",codigo:""});
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));
    return (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={S.ttl()}>📦 {data?"Editar":"Nuevo"} Producto</div>
        <div><label style={S.lbl}>Nombre *</label><input style={S.inp} value={form.nombre||""} onChange={e=>setF("nombre",e.target.value)}/></div>
        <div style={S.g2}>
          <div><label style={S.lbl}>Categoría</label><select style={S.inp} value={form.categoria||"lentes"} onChange={e=>setF("categoria",e.target.value)}>{["lentes","armazones","contactos","accesorios","servicios"].map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label style={S.lbl}>Marca</label><input style={S.inp} value={form.marca||""} onChange={e=>setF("marca",e.target.value)}/></div>
          <div><label style={S.lbl}>Precio costo ($)</label><input style={S.inp} type="number" value={form.precio_costo||0} onChange={e=>setF("precio_costo",+e.target.value)}/></div>
          <div><label style={S.lbl}>Precio venta ($)</label><input style={S.inp} type="number" value={form.precio_venta||0} onChange={e=>setF("precio_venta",+e.target.value)}/></div>
          <div><label style={S.lbl}>Stock actual</label><input style={S.inp} type="number" value={form.stock||0} onChange={e=>setF("stock",+e.target.value)}/></div>
          <div><label style={S.lbl}>Código de barras</label><input style={S.inp} value={form.codigo||""} onChange={e=>setF("codigo",e.target.value)} placeholder="Ej: 8001"/></div>
        </div>
        <div><label style={S.lbl}>Descripción</label><textarea style={{...S.inp,minHeight:50,resize:"vertical"}} value={form.descripcion||""} onChange={e=>setF("descripcion",e.target.value)}/></div>
        <div style={{...S.box,fontSize:12}}>Margen: <strong style={{color:CV.green}}>{form.precio_venta&&form.precio_costo?Math.round((form.precio_venta-form.precio_costo)/form.precio_venta*100):0}%</strong></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button style={S.btn("sec")} onClick={closeModal}>Cancelar</button>
          <button style={S.btn("pri")} onClick={()=>saveProduct(form)}>💾 Guardar</button>
        </div>
      </div>
    );
  };

  const ApptModal = ({data}) => {
    const [form, setForm] = useState(data||{pnombre:"",fecha:now(),hora:"09:00",tipo:"primera_consulta",estado:"pendiente",notas:""});
    const setF = (k,v) => setForm(p=>({...p,[k]:v}));
    return (
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={S.ttl()}>📅 {data?"Editar":"Nueva"} Cita</div>
        <div><label style={S.lbl}>Paciente *</label>
          <input style={S.inp} list="pat-list" value={form.pnombre||""} onChange={e=>setForm(f=>({...f,pnombre:e.target.value}))} placeholder="Escribe nombre..."/>
          <datalist id="pat-list">{patients.map(p=><option key={p.id} value={p.nombre}/>)}</datalist>
        </div>
        <div style={S.g2}>
          <div><label style={S.lbl}>Fecha</label><input style={S.inp} type="date" value={form.fecha||now()} onChange={e=>setF("fecha",e.target.value)}/></div>
          <div><label style={S.lbl}>Hora</label><input style={S.inp} type="time" value={form.hora||"09:00"} onChange={e=>setF("hora",e.target.value)}/></div>
          <div><label style={S.lbl}>Tipo</label><select style={S.inp} value={form.tipo||"primera_consulta"} onChange={e=>setF("tipo",e.target.value)}>{TIPOS_CITA.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Estado</label><select style={S.inp} value={form.estado||"pendiente"} onChange={e=>setF("estado",e.target.value)}>{["pendiente","confirmado","completado","cancelado"].map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div><label style={S.lbl}>Notas</label><textarea style={{...S.inp,minHeight:50,resize:"vertical"}} value={form.notas||""} onChange={e=>setF("notas",e.target.value)}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button style={S.btn("sec")} onClick={closeModal}>Cancelar</button>
          <button style={S.btn("pri")} onClick={()=>saveAppointment(form)}>💾 Guardar</button>
        </div>
      </div>
    );
  };

  const Modal = () => {
    if(!modal) return null;
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&closeModal()}>
        <div style={{background:CV.card,borderRadius:14,border:`1px solid ${CV.border}`,padding:22,maxWidth:680,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
          {modal.type==="patient" && <PatientModal data={modal.data}/>}
          {modal.type==="product" && <ProductModal data={modal.data}/>}
          {modal.type==="appt"    && <ApptModal data={modal.data}/>}
        </div>
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────
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
        @media(max-width:640px){
          .cv-g4{grid-template-columns:1fr 1fr!important}
          .cv-g3{grid-template-columns:1fr 1fr!important}
          .cv-g2{grid-template-columns:1fr!important}
          .cv-hdr{flex-direction:column;height:auto!important;padding:8px!important}
        }
      `}</style>

      {toast && <div style={{position:"fixed",top:14,right:14,zIndex:9999,background:CV.green,color:"#000",padding:"10px 16px",borderRadius:8,fontWeight:800,fontSize:12,boxShadow:`0 4px 20px ${CV.green}66`}}>{toast}</div>}

      <div style={S.hdr}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${CV.cyan},${CV.cyanDk})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👁</div>
          <div>
            <div style={{fontSize:14,fontWeight:900,color:CV.white,letterSpacing:".05em"}}>{config.nombre}</div>
            <div style={{fontSize:8,color:CV.muted,letterSpacing:".12em"}}>SISTEMA v2.0 — IA LAB</div>
          </div>
        </div>
        <nav style={S.nav}>
          {TABS.map(([id,ico])=><button key={id} style={S.nb(tab===id)} onClick={()=>{setTab(id);setSearch("");}}>{ico} {TAB_LABELS[id]}</button>)}
        </nav>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          <button style={{...S.btn("sec"),fontSize:10}} onClick={exportCSV}>📥</button>
          <button style={{...S.btn("sec"),fontSize:10}} onClick={()=>{ setLogged(false); setCurrentUser(null); }}>🚪</button>
        </div>
      </div>

      <Modal/>

      <div style={S.wrap}>
        {tab==="dashboard"    && <Dashboard/>}
        {tab==="patients"     && <Patients/>}
        {tab==="crm"          && <CRMView/>}
        {tab==="campaigns"    && <Campaigns/>}
        {tab==="inventory"    && <Inventory/>}
        {tab==="agenda"       && <AgendaView/>}
        {tab==="comprobantes" && <ComprobantesView/>}
        {tab==="proveedores"  && <ProveedoresView/>}
        {tab==="pagos"        && <PagosView/>}
        {tab==="tienda"       && <TiendaView/>}
        {tab==="web"          && <WebView/>}
        {tab==="config"       && <ConfigView/>}
      </div>
    </div>
  );
}
