import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Activity, ArrowDownToLine, ArrowRight, Bell, Check, ChevronDown, CircleHelp,
  Clock3, Copy, FileImage, Folder, FolderPlus, Grid2X2, LayoutDashboard, Link2,
  LockKeyhole, LogOut, Menu, MoreHorizontal, Plus, QrCode, Search, Settings,
  ShieldCheck, SlidersHorizontal, Sparkles, Trash2, Users, X, Zap
} from "lucide-react";

type QRItem = { id: string; name: string; value: string; kind: "URL" | "Text"; mode: "Dynamic" | "Static"; status: "Published" | "Draft" | "Disabled"; folder: string; created: string; scans: number; color: string };
const initialItems: QRItem[] = [
  { id:"EN-2048",name:"Diwali Campaign Landing",value:"https://example.com/diwali",kind:"URL",mode:"Dynamic",status:"Published",folder:"Diwali Offers",created:"Today",scans:1284,color:"#8b7cff" },
  { id:"EN-2047",name:"Weekend Mega Sale",value:"https://example.com/weekend",kind:"URL",mode:"Dynamic",status:"Published",folder:"Weekend Offers",created:"Yesterday",scans:862,color:"#4ea9ff" },
  { id:"EN-2046",name:"Store Wi-Fi Details",value:"JamJoom Guest Wi-Fi",kind:"Text",mode:"Static",status:"Published",folder:"General",created:"Oct 29",scans:342,color:"#4fd1a5" },
  { id:"EN-2045",name:"Product Catalogue",value:"https://example.com/catalogue",kind:"URL",mode:"Dynamic",status:"Draft",folder:"Product Catalogue",created:"Oct 28",scans:0,color:"#e9a15d" },
];
const initialFolders = ["All projects","Diwali Offers","Weekend Offers","Product Catalogue","General"];
const fmt = (n:number) => new Intl.NumberFormat("en-IN").format(n);

export default function App() {
  const [items,setItems] = useState<QRItem[]>(() => { try { const v=localStorage.getItem("enivin-items"); return v?JSON.parse(v):initialItems; } catch { return initialItems; } });
  const [folders,setFolders] = useState<string[]>(() => { try { const v=localStorage.getItem("enivin-folders"); return v?JSON.parse(v):initialFolders; } catch { return initialFolders; } });
  const [active,setActive] = useState("Overview");
  const [folder,setFolder] = useState("All projects");
  const [search,setSearch] = useState("");
  const [modal,setModal] = useState<"create"|"folder"|"edit"|null>(null);
  const [selected,setSelected] = useState<QRItem|null>(null);
  const [name,setName] = useState("");
  const [value,setValue] = useState("");
  const [kind,setKind] = useState<"URL"|"Text">("URL");
  const [mode,setMode] = useState<"Dynamic"|"Static">("Dynamic");
  const [targetFolder,setTargetFolder] = useState("General");
  const [newFolder,setNewFolder] = useState("");
  const [notice,setNotice] = useState("");
  const [mobileOpen,setMobileOpen] = useState(false);
  const [qrPreview,setQrPreview] = useState("");
  const [qrSvg,setQrSvg] = useState("");
  const [qrPng,setQrPng] = useState("");

  useEffect(()=>{localStorage.setItem("enivin-items",JSON.stringify(items));},[items]);
  useEffect(()=>{localStorage.setItem("enivin-folders",JSON.stringify(folders));},[folders]);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(""),2600);return()=>clearTimeout(t);},[notice]);
  const visible = useMemo(()=>items.filter(i=>(folder==="All projects"||i.folder===folder)&&(`${i.name} ${i.id} ${i.value}`.toLowerCase().includes(search.toLowerCase()))),[items,folder,search]);
  const published = items.filter(i=>i.status==="Published").length;
  const scans = items.reduce((a,b)=>a+b.scans,0);

  async function makePreview(data:string) {
    if(!data.trim()){setQrPreview("");setQrSvg("");setQrPng("");return;}
    try { const opts={width:360,margin:2,errorCorrectionLevel:"H" as const,color:{dark:"#10131b",light:"#ffffff"}};
      const [url,svg]=await Promise.all([QRCode.toDataURL(data,opts),QRCode.toString(data,{...opts,type:"svg"})]);
      setQrPreview(url);setQrSvg(svg);setQrPng(url);
    } catch { setQrPreview("");setQrSvg("");setQrPng(""); }
  }
  useEffect(()=>{const t=setTimeout(()=>void makePreview(value),160);return()=>clearTimeout(t);},[value]);
  function openCreate(){setName("");setValue("");setKind("URL");setMode("Dynamic");setTargetFolder(folders.find(f=>f!=="All projects")||"General");setModal("create");}
  function saveQR(){if(!name.trim()||!value.trim()){setNotice("Add a project name and QR content.");return;}if(kind==="URL"&&!/^https?:\/\//i.test(value)){setNotice("Use a valid URL beginning with http:// or https://.");return;}
    const entry:QRItem={id:"EN-"+Math.floor(1000+Math.random()*9000),name:name.trim(),value:value.trim(),kind,mode,status:"Draft",folder:targetFolder,created:"Just now",scans:0,color:"#8b7cff"};
    setItems([entry,...items]);setModal(null);setNotice("QR project saved to your library.");setSelected(entry);setTimeout(()=>setSelected(null),50);
  }
  function saveEdit(){if(!selected)return;setItems(items.map(i=>i.id===selected.id?{...i,value:value.trim(),name:name.trim()||i.name}:i));setSelected(null);setModal(null);setNotice("QR destination updated.");}
  function download(data:string,filename:string,type:string){const a=document.createElement("a");a.href=data;a.download=filename;a.click();}
  function exportSvg(item:QRItem){QRCode.toString(item.value,{type:"svg",width:1200,margin:4,errorCorrectionLevel:"H"}).then(s=>download("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s),item.id+".svg","image/svg+xml"));}
  function exportPng(item:QRItem){QRCode.toDataURL(item.value,{width:1600,margin:4,errorCorrectionLevel:"H"}).then(u=>download(u,item.id+".png","image/png"));}
  function toggleStatus(item:QRItem){setItems(items.map(i=>i.id===item.id?{...i,status:i.status==="Disabled"?"Published":"Disabled"}:i));setNotice(item.status==="Disabled"?"QR enabled.":"QR disabled.");}
  function createFolder(){if(!newFolder.trim())return;if(folders.includes(newFolder.trim())){setNotice("That folder already exists.");return;}setFolders([...folders,newFolder.trim()]);setFolder(newFolder.trim());setNewFolder("");setModal(null);setNotice("Folder created.");}
  const nav=[{label:"WORKSPACE",items:[["Overview",LayoutDashboard],["QR Library",Grid2X2],["Folders",Folder]]},{label:"MANAGE",items:[["Team members",Users],["Activity logs",Activity]]} ] as const;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?"sidebar-open":""}`}>
      <div className="brand"><div className="brand-mark"><QrCode size={23}/></div><div><strong>enivin<span>.</span></strong><small>SUPER QR CODE</small></div><button className="icon-btn close-nav" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">J</div><div><b>JamJoom Workspace</b><small>Private workspace</small></div><ChevronDown size={15}/></div>
      <nav>{nav.map(group=><div className="nav-group" key={group.label}><p>{group.label}</p>{group.items.map(([label,Icon])=><button key={label} className={`nav-link ${active===label?"active":""}`} onClick={()=>{setActive(label);setMobileOpen(false);}}><Icon size={17}/><span>{label}</span>{label==="QR Library"&&<em>{items.length}</em>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>Need a hand?</b><p>Explore the quick guide to get started.</p><button onClick={()=>setNotice("Help center will be connected in a future release.")}>Open help centre <ArrowRight size={13}/></button></div><button className="profile-row"><div className="profile-avatar">N</div><div><b>Nibin</b><small>Super Admin · Demo</small></div><MoreHorizontal size={18}/></button></div>
    </aside>
    {mobileOpen&&<div className="scrim" onClick={()=>setMobileOpen(false)}/>}
    <main className="main">
      <header className="topbar"><div className="crumb"><button className="icon-btn mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><span>Workspace</span><span className="slash">/</span><b>{active}</b></div><div className="top-actions"><div className="demo-pill"><span/> DEMO MODE</div><button className="icon-btn" title="Notifications" onClick={()=>setNotice("You're all caught up.")}><Bell size={18}/></button><div className="top-avatar">N</div></div></header>
      <div className="page">
        {active==="Overview"&&<><div className="welcome-row"><div><div className="eyebrow"><Sparkles size={13}/> YOUR QR WORKSPACE</div><h1>Good evening, Nibin<span>.</span></h1><p className="subhead">Here’s what’s happening across your QR projects.</p></div><button className="primary-btn" onClick={openCreate}><Plus size={17}/> Create QR code</button></div>
          <div className="stats-grid"><Stat icon={<QrCode/>} label="Total QR codes" value={String(items.length).padStart(2,"0")} foot="Across all folders" tone="violet"/><Stat icon={<Activity/>} label="Total scans" value={fmt(scans)} foot="Demo sample activity" tone="blue"/><Stat icon={<Check/>} label="Published codes" value={String(published).padStart(2,"0")} foot="Live in this demo" tone="green"/><Stat icon={<Folder/>} label="Folders" value={String(folders.length-1).padStart(2,"0")} foot="Organised campaigns" tone="orange"/></div>
          <div className="section-heading"><div><h2>Recent projects</h2><p>Your latest QR code activity</p></div><button className="text-btn" onClick={()=>setActive("QR Library")}>View all projects <ArrowRight size={15}/></button></div>
          <QRTable items={items.slice(0,4)} onEdit={i=>{setSelected(i);setName(i.name);setValue(i.value);setModal("edit");}} onExport={exportSvg} onPng={exportPng} onToggle={toggleStatus}/>
          <div className="bottom-grid"><div className="panel"><div className="panel-heading"><div><h3>Quick create</h3><p>Start with a popular QR type</p></div><Zap size={18}/></div><div className="quick-grid"><Quick icon={<Link2/>} label="Website URL" onClick={()=>{openCreate();setKind("URL");}}/><Quick icon={<FileImage/>} label="PDF document" onClick={()=>setNotice("PDF QR publishing will be added with secure file storage.")}/><Quick icon={<Users/>} label="Contact card" onClick={()=>setNotice("Contact card QR is on the product roadmap.")}/><Quick icon={<SlidersHorizontal/>} label="Custom design" onClick={()=>setNotice("Advanced design studio is coming in a future release.")}/></div></div><div className="panel activity-panel"><div className="panel-heading"><div><h3>Workspace activity</h3><p>A snapshot of your demo workspace</p></div><Clock3 size={18}/></div><div className="activity-line"><div className="activity-dot violet-dot"/><div><b>QR project created</b><small>Diwali Campaign Landing · Today</small></div></div><div className="activity-line"><div className="activity-dot blue-dot"/><div><b>Destination updated</b><small>Weekend Mega Sale · Yesterday</small></div></div><div className="activity-line"><div className="activity-dot green-dot"/><div><b>New folder added</b><small>Product Catalogue · Oct 28</small></div></div></div></div>
        </>}
        {active==="QR Library"&&<><div className="welcome-row"><div><div className="eyebrow">PROJECT MANAGEMENT</div><h1>QR Library<span>.</span></h1><p className="subhead">Create, organise and manage your QR codes.</p></div><button className="primary-btn" onClick={openCreate}><Plus size={17}/> Create QR code</button></div><div className="library-toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search projects..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></div><select value={folder} onChange={e=>setFolder(e.target.value)}>{folders.map(f=><option key={f}>{f}</option>)}</select></div><QRTable items={visible} onEdit={i=>{setSelected(i);setName(i.name);setValue(i.value);setModal("edit");}} onExport={exportSvg} onPng={exportPng} onToggle={toggleStatus}/></>}
        {active==="Folders"&&<><div className="welcome-row"><div><div className="eyebrow">ORGANISE YOUR WORK</div><h1>Folders<span>.</span></h1><p className="subhead">Keep campaigns and QR projects in one place.</p></div><button className="primary-btn" onClick={()=>setModal("folder")}><FolderPlus size={17}/> New folder</button></div><div className="folder-grid">{folders.filter(f=>f!=="All projects").map((f,i)=><button className="folder-card" key={f} onClick={()=>{setFolder(f);setActive("QR Library");}}><div className="folder-icon"><Folder size={22}/></div><MoreHorizontal size={18}/><b>{f}</b><small>{items.filter(x=>x.folder===f).length} projects</small></button>)}</div></>}
        {(active==="Team members"||active==="Activity logs")&&<div className="coming-panel"><div className="coming-icon">{active==="Team members"?<Users/>:<Activity/>}</div><div className="eyebrow">ADMIN MODULE</div><h1>{active}<span>.</span></h1><p className="subhead">This module needs a secure backend before it can be enabled.</p><div className="notice-box"><ShieldCheck size={18}/><span>For staff accounts, permissions and audit logs, connect the production authentication and database service. This preview intentionally does not simulate real access control.</span></div></div>}
        <footer><span>© 2026 Enivin Super QR Code</span><span><LockKeyhole size={12}/> Private workspace preview <i/> Made for focused work</span></footer>
      </div>
    </main>
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null);}}><div className="modal"><div className="modal-head"><div><div className="eyebrow">{modal==="folder"?"ORGANISATION":"NEW PROJECT"}</div><h2>{modal==="create"?"Create QR code":modal==="edit"?"Edit QR destination":"Create folder"}</h2></div><button className="icon-btn" onClick={()=>setModal(null)}><X size={19}/></button></div>
      {modal==="folder"?<><label>Folder name</label><input className="field" value={newFolder} onChange={e=>setNewFolder(e.target.value)} placeholder="e.g. Christmas Campaign"/><button className="primary-btn full-btn" onClick={createFolder}>Create folder <ArrowRight size={16}/></button></>:<><div className="create-layout"><div className="form-fields"><label>Project name</label><input className="field" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Summer Sale Landing"/><label>QR content type</label><div className="segmented"><button className={kind==="URL"?"chosen":""} onClick={()=>{setKind("URL");setValue("");}}>Website URL</button><button className={kind==="Text"?"chosen":""} onClick={()=>{setKind("Text");setValue("");}}>Plain text</button></div><label>{kind==="URL"?"Destination URL":"Text content"}</label><textarea className="field textarea" value={value} onChange={e=>setValue(e.target.value)} placeholder={kind==="URL"?"https://yourwebsite.com":"Enter your text..."}/>{modal==="create"&&<><label>QR behaviour</label><div className="segmented"><button className={mode==="Dynamic"?"chosen":""} onClick={()=>setMode("Dynamic")}>Dynamic <small>Editable</small></button><button className={mode==="Static"?"chosen":""} onClick={()=>setMode("Static")}>Static <small>Fixed</small></button></div><label>Save to folder</label><select className="field" value={targetFolder} onChange={e=>setTargetFolder(e.target.value)}>{folders.filter(f=>f!=="All projects").map(f=><option key={f}>{f}</option>)}</select></>}</div><div className="preview-side"><div className="preview-label">LIVE PREVIEW</div><div className="qr-frame">{qrPreview?<img src={qrPreview} alt="QR code preview"/>:<div className="qr-placeholder"><QrCode size={54}/><span>Enter content to preview</span></div>}</div><div className="preview-caption"><b>Scan to preview</b><small>High correction · Standard QR</small></div></div></div><div className="modal-actions"><span><ShieldCheck size={15}/> Scan-safe standard QR</span><button className="primary-btn" onClick={modal==="create"?saveQR:saveEdit}>{modal==="create"?"Save QR project":"Save changes"} <ArrowRight size={16}/></button></div></>}</div></div>}
    {notice&&<div className="toast"><Check size={16}/>{notice}<button onClick={()=>setNotice("")}><X size={14}/></button></div>}
  </div>;
}

function Stat({icon,label,value,foot,tone}:{icon:React.ReactNode;label:string;value:string;foot:string;tone:string}){return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span>{label}</span><strong>{value}</strong><small>{foot}</small></div>}
function Quick({icon,label,onClick}:{icon:React.ReactNode;label:string;onClick:()=>void}){return <button className="quick-btn" onClick={onClick}><div>{icon}</div><span>{label}</span><ArrowRight size={14}/></button>}
function QRTable({items,onEdit,onExport,onPng,onToggle}:{items:QRItem[];onEdit:(i:QRItem)=>void;onExport:(i:QRItem)=>void;onPng:(i:QRItem)=>void;onToggle:(i:QRItem)=>void}){return <div className="table-wrap"><table><thead><tr><th>PROJECT</th><th>TYPE</th><th>BEHAVIOUR</th><th>SCANS</th><th>STATUS</th><th>CREATED</th><th/></tr></thead><tbody>{items.map(i=><tr key={i.id}><td><div className="project-cell"><div className="mini-qr" style={{color:i.color}}><QrCode size={21}/></div><div><b>{i.name}</b><small>{i.id} · {i.folder}</small></div></div></td><td><span className="type-pill">{i.kind}</span></td><td><span className="behaviour">{i.mode==="Dynamic"?<Zap size={13}/>:<LockKeyhole size={13}/>} {i.mode}</span></td><td className="scan-count">{fmt(i.scans)}</td><td><span className={`status ${i.status.toLowerCase()}`}><i/>{i.status}</span></td><td className="created">{i.created}</td><td><div className="row-actions"><button title="Edit destination" onClick={()=>onEdit(i)}><Settings size={15}/></button><button title="Download SVG" onClick={()=>onExport(i)}><ArrowDownToLine size={15}/></button><details><summary><MoreHorizontal size={17}/></summary><div className="action-menu"><button onClick={()=>onPng(i)}>Download PNG</button><button onClick={()=>onToggle(i)}>{i.status==="Disabled"?"Enable":"Disable"} QR</button></div></details></div></td></tr>)}</tbody></table>{items.length===0&&<div className="empty-state"><QrCode size={34}/><b>No QR projects found</b><span>Try another search or create a new QR code.</span></div>}</div>}
