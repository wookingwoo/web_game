const size = 32;
let zoom = 16;
const minZoom = 4, maxZoom = 32;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gridCanvas = document.getElementById('grid');
const gridCtx = gridCanvas.getContext('2d');
let gridEnabled = true;
const statusEl = document.getElementById('status');
const zoomDisplay = document.getElementById('zoom-display');

const defaultPalette = [
  '#000000','#0000AA','#00AA00','#00AAAA','#AA0000','#AA00AA','#AA5500','#AAAAAA',
  '#555555','#5555FF','#55FF55','#55FFFF','#FF5555','#FF55FF','#FFFF55','#FFFFFF'
];
let palette = defaultPalette.slice();
let fg = 0, bg = 15;
let data = new Array(size*size).fill(bg);
let undoStack = [], redoStack = [];
let currentTool = 'pencil';
let drawing = false;
let startPos = null;
let selection = null; // {x,y,w,h,data}
let clipboard = null;

// palette setup
const swatchContainer = document.getElementById('swatches');
const fgDisplay = document.getElementById('fg-display');
const bgDisplay = document.getElementById('bg-display');
const swapBtn = document.getElementById('swap-colors');

function refreshPalette(){
  swatchContainer.innerHTML='';
  palette.forEach((col,i)=>{
    const b=document.createElement('button');
    b.style.background=col;
    b.dataset.index=i;
    b.title = 'Color '+i;
    b.addEventListener('click',()=>{fg=i;updateFG();});
    b.addEventListener('contextmenu',(e)=>{e.preventDefault();bg=i;updateBG();});
    if(i>=14){
      const inp=document.createElement('input');
      inp.type='color';
      inp.value=col;
      inp.addEventListener('input',()=>{palette[i]=inp.value;b.style.background=inp.value;draw();});
      b.appendChild(inp);
    }
    swatchContainer.appendChild(b);
  });
  updateFG();updateBG();
}
function updateFG(){fgDisplay.style.background=palette[fg];}
function updateBG(){bgDisplay.style.background=palette[bg];}
refreshPalette();

swapBtn.addEventListener('click',()=>{[fg,bg]=[bg,fg];updateFG();updateBG();});

// toolbar
const tools=['pencil','eraser','fill','line','rect','circle','select','eyedrop'];
tools.forEach(t=>{
  const btn=document.querySelector(`[data-tool="${t}"]`);
  btn.addEventListener('click',()=>selectTool(t));
});
function selectTool(t){
  currentTool=t;
  document.querySelectorAll('.toolbar .tool').forEach(b=>b.classList.remove('active'));
  document.querySelector(`[data-tool="${t}"]`).classList.add('active');
}
selectTool('pencil');

document.getElementById('grid-toggle').addEventListener('click',()=>{gridEnabled=!gridEnabled;drawGrid();});
document.getElementById('undo').addEventListener('click',undo);
document.getElementById('redo').addEventListener('click',redo);
document.getElementById('clear').addEventListener('click',()=>{pushUndo();data.fill(bg);draw();});
document.getElementById('copy').addEventListener('click',()=>{if(selection){clipboard=selection.data.map(r=>r.slice());}});
document.getElementById('paste').addEventListener('click',()=>{if(clipboard){pushUndo();for(let y=0;y<clipboard.length;y++){for(let x=0;x<clipboard[0].length;x++){if(y<size&&x<size)data[y*size+x]=clipboard[y][x];}}draw();}});
document.getElementById('flip').addEventListener('click',()=>{if(selection){pushUndo();selection.data.forEach(r=>r.reverse());applySelection();}});
document.getElementById('rotate').addEventListener('click',()=>{if(selection){pushUndo();const w=selection.w,h=selection.h;const newData=Array.from({length:h},()=>Array(w));for(let y=0;y<h;y++)for(let x=0;x<w;x++)newData[x][h-1-y]=selection.data[y][x];selection.data=newData;selection.w=h;selection.h=w;applySelection();}});
document.getElementById('import').addEventListener('click',()=>document.getElementById('file-input').click());
document.getElementById('export').addEventListener('click',exportFiles);
document.getElementById('save').addEventListener('click',()=>{localStorage.setItem('pixelPainter',JSON.stringify({data,palette}));});
document.getElementById('load').addEventListener('click',()=>{const s=localStorage.getItem('pixelPainter');if(s){const obj=JSON.parse(s);data=obj.data.slice();palette=obj.palette.slice();refreshPalette();draw();}});
document.getElementById('file-input').addEventListener('change',handleImport);

// drawing
canvas.addEventListener('mousedown',e=>{const p=getPos(e);startPos=p;drawing=true;pushUndo();if(currentTool==='pencil')setPixel(p.x,p.y,fg);else if(currentTool==='eraser')setPixel(p.x,p.y,bg);else if(currentTool==='fill')fill(p.x,p.y);else if(currentTool==='eyedrop'){fg=getPixel(p.x,p.y);updateFG();drawing=false;}else if(currentTool==='select'){selection={x:p.x,y:p.y,w:1,h:1,data:[]};}});
canvas.addEventListener('mousemove',e=>{const p=getPos(e);statusEl.textContent=`${p.x},${p.y}`;if(!drawing)return;switch(currentTool){case'pencil':setPixel(p.x,p.y,fg);break;case'eraser':setPixel(p.x,p.y,bg);break;case'line':drawTemp(()=>line(startPos.x,startPos.y,p.x,p.y,fg));break;case'rect':drawTemp(()=>rect(startPos.x,startPos.y,p.x,p.y,fg));break;case'circle':drawTemp(()=>circle(startPos.x,startPos.y,p.x,p.y,fg));break;case'select':selection.w=p.x-startPos.x+1;selection.h=p.y-startPos.y+1;draw();drawSelectionRect();break;}});
function drawTemp(drawFn){draw();ctx.save();drawFn();ctx.restore();}
canvas.addEventListener('mouseup',e=>{if(!drawing)return;const p=getPos(e);drawing=false;switch(currentTool){case'line':line(startPos.x,startPos.y,p.x,p.y,fg);break;case'rect':rect(startPos.x,startPos.y,p.x,p.y,fg);break;case'circle':circle(startPos.x,startPos.y,p.x,p.y,fg);break;case'select':captureSelection();break;}draw();});
canvas.addEventListener('mouseleave',()=>{drawing=false;});
canvas.addEventListener('mousemove',e=>{const p=getPos(e);statusEl.textContent=`${p.x},${p.y}`;});

function setPixel(x,y,c){if(x>=0&&y>=0&&x<size&&y<size){data[y*size+x]=c;draw();}}
function getPixel(x,y){if(x>=0&&y>=0&&x<size&&y<size)return data[y*size+x];return bg;}
function line(x0,y0,x1,y1,c){let dx=Math.abs(x1-x0), sx=x0<x1?1:-1;let dy=-Math.abs(y1-y0), sy=y0<y1?1:-1;let err=dx+dy;while(true){setPixel(x0,y0,c);if(x0===x1 && y0===y1)break;let e2=2*err;if(e2>=dy){err+=dy;x0+=sx;}if(e2<=dx){err+=dx;y0+=sy;}}}
function rect(x0,y0,x1,y1,c){const xs=Math.min(x0,x1), ys=Math.min(y0,y1), xe=Math.max(x0,x1), ye=Math.max(y0,y1);for(let y=ys;y<=ye;y++)for(let x=xs;x<=xe;x++)setPixel(x,y,c);} 
function circle(x0,y0,x1,y1,c){const r=Math.round(Math.hypot(x1-x0,y1-y0));let x=r,y=0,err=0;while(x>=y){plotCircle(x0,y0,x,y,c);y++;err+=1+2*y;if(2*(err-x)+1>0){x--;err+=1-2*x;}}
}
function plotCircle(cx,cy,x,y,c){setPixel(cx+x,cy+y,c);setPixel(cx+y,cy+x,c);setPixel(cx-y,cy+x,c);setPixel(cx-x,cy+y,c);setPixel(cx-x,cy-y,c);setPixel(cx-y,cy-x,c);setPixel(cx+y,cy-x,c);setPixel(cx+x,cy-y,c);}
function fill(x,y){const target=getPixel(x,y);if(target===fg)return;const q=[[x,y]];while(q.length){const[nx,ny]=q.pop();if(getPixel(nx,ny)!==target)continue;setPixel(nx,ny,fg);if(nx>0)q.push([nx-1,ny]);if(nx<size-1)q.push([nx+1,ny]);if(ny>0)q.push([nx,ny-1]);if(ny<size-1)q.push([nx,ny+1]);}}
function pushUndo(){undoStack.push(data.slice());if(undoStack.length>50)undoStack.shift();redoStack=[];}
function undo(){if(undoStack.length){redoStack.push(data.slice());data=undoStack.pop();draw();}}
function redo(){if(redoStack.length){undoStack.push(data.slice());data=redoStack.pop();draw();}}

function draw(){ctx.fillStyle=palette[bg];ctx.fillRect(0,0,size*zoom,size*zoom);for(let y=0;y<size;y++)for(let x=0;x<size;x++){ctx.fillStyle=palette[data[y*size+x]];ctx.fillRect(x*zoom,y*zoom,zoom,zoom);}drawGrid();if(selection)drawSelectionRect();}
function drawGrid(){gridCtx.clearRect(0,0,size*zoom,size*zoom);if(!gridEnabled)return;gridCtx.strokeStyle='rgba(0,0,0,0.2)';for(let i=0;i<=size;i++){gridCtx.beginPath();gridCtx.moveTo(i*zoom,0);gridCtx.lineTo(i*zoom,size*zoom);gridCtx.stroke();gridCtx.beginPath();gridCtx.moveTo(0,i*zoom);gridCtx.lineTo(size*zoom,i*zoom);gridCtx.stroke();}}
function getPos(e){const r=canvas.getBoundingClientRect();return {x:Math.floor((e.clientX-r.left)/zoom),y:Math.floor((e.clientY-r.top)/zoom)};}

function captureSelection(){const {x,y,w,h}=selection;selection.data=[];for(let j=0;j<h;j++){const row=[];for(let i=0;i<w;i++){row.push(getPixel(x+i,y+j));}selection.data.push(row);} }
function applySelection(){const {x,y,w,h}=selection;for(let j=0;j<h;j++)for(let i=0;i<w;i++)setPixel(x+i,y+j,selection.data[j][i]);draw();}
function drawSelectionRect(){if(!selection)return;const {x,y,w,h}=selection;ctx.save();ctx.strokeStyle='red';ctx.lineWidth=1;ctx.strokeRect(x*zoom,y*zoom,w*zoom,h*zoom);ctx.restore();}

// import/export
function handleImport(e){const file=e.target.files[0];if(!file)return;const img=new Image();img.onload=()=>{const temp=document.createElement('canvas');temp.width=size;temp.height=size;const tctx=temp.getContext('2d');tctx.drawImage(img,0,0,size,size);const imgData=tctx.getImageData(0,0,size,size).data;pushUndo();for(let y=0;y<size;y++)for(let x=0;x<size;x++){const idx=(y*size+x)*4;const col=[imgData[idx],imgData[idx+1],imgData[idx+2]];data[y*size+x]=nearestColor(col);}draw();};img.src=URL.createObjectURL(file);}
function nearestColor([r,g,b]){let best=0,bestDist=Infinity;palette.forEach((col,i)=>{const cr=parseInt(col.slice(1,3),16),cg=parseInt(col.slice(3,5),16),cb=parseInt(col.slice(5,7),16);const d=(r-cr)**2+(g-cg)**2+(b-cb)**2;if(d<bestDist){bestDist=d;best=i;}});return best;}
function exportFiles(){const png=document.createElement('canvas');png.width=size;png.height=size;const pctx=png.getContext('2d');for(let y=0;y<size;y++)for(let x=0;x<size;x++){pctx.fillStyle=palette[data[y*size+x]];pctx.fillRect(x,y,1,1);}const url=png.toDataURL('image/png');download(url,'pixel.png');const json=JSON.stringify({width:size,height:size,data});const blob=new Blob([json],{type:'application/json'});download(URL.createObjectURL(blob),'pixel.json');}
function download(url,name){const a=document.createElement('a');a.href=url;a.download=name;a.click();}

// zoom shortcuts
function updateZoom(){canvas.width=gridCanvas.width=size*zoom;canvas.height=gridCanvas.height=size*zoom;zoomDisplay.textContent=zoom+'x';draw();}
document.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){zoom=Math.min(maxZoom,zoom+4);updateZoom();}else if(e.key==='-'||e.key==='_'){zoom=Math.max(minZoom,zoom-4);updateZoom();}else if(!e.ctrlKey){const idx=parseInt(e.key);if(idx>=1&&idx<=tools.length)selectTool(tools[idx-1]);}});

// draggable window
(function(){const win=document.querySelector('.window');const bar=document.querySelector('.title-bar');let ox=0,oy=0,drag=false;bar.addEventListener('mousedown',e=>{drag=true;ox=e.clientX-win.offsetLeft;oy=e.clientY-win.offsetTop;});document.addEventListener('mousemove',e=>{if(drag){win.style.left=(e.clientX-ox)+'px';win.style.top=(e.clientY-oy)+'px';}});document.addEventListener('mouseup',()=>drag=false);})();

updateZoom();
