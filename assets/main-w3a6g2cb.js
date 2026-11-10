import{a as e,i as t,n,o as r,r as i,s as a,t as o}from"./mount-Dq630xXa.js";var s=e(),c=[`the sound`,`aditya chowhan`,`play it loud`,`adimakesmusic`,`vol. 01`,`listen`];function l(){return(0,s.jsx)(`svg`,{viewBox:`0 0 100 100`,className:`h-4 w-4 shrink-0 md:h-5 md:w-5`,"aria-hidden":!0,children:[0,45,90,135].map(e=>(0,s.jsx)(`line`,{x1:`50`,y1:`8`,x2:`50`,y2:`92`,stroke:`currentColor`,strokeWidth:`10`,strokeLinecap:`round`,transform:`rotate(${e} 50 50)`},e))})}function u({className:e,reverse:t=!1,slow:n=!1}){let i=(0,s.jsx)(`div`,{className:`flex shrink-0 items-center font-display text-xl uppercase leading-none tracking-wide md:text-3xl`,children:Array.from({length:3}).flatMap((e,t)=>c.map((e,n)=>(0,s.jsxs)(`span`,{className:`flex items-center gap-5 pr-5 md:gap-9 md:pr-9`,children:[(0,s.jsx)(`span`,{className:`whitespace-nowrap`,children:e}),(0,s.jsx)(l,{})]},`${t}-${n}`)))});return(0,s.jsx)(`div`,{className:r(`-ml-[5vw] w-[110vw] overflow-hidden py-2.5 md:py-3.5`,e),children:(0,s.jsxs)(`div`,{className:r(`flex w-max`,n?`animate-marquee-slow`:`animate-marquee`,t&&`[animation-direction:reverse]`),children:[i,(0,s.jsx)(`div`,{"aria-hidden":!0,className:`contents`,children:i})]})})}function d(){return(0,s.jsxs)(`div`,{"aria-hidden":!0,className:`relative z-20 -my-8 select-none md:-my-10`,children:[(0,s.jsx)(`div`,{className:`-rotate-[2.2deg]`,children:(0,s.jsx)(u,{className:`border-y-[3px] border-black bg-white text-black`})}),(0,s.jsx)(`div`,{className:`-mt-4 rotate-[1.6deg] md:-mt-6`,children:(0,s.jsx)(u,{className:`border-y border-white/25 bg-black text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]`,reverse:!0,slow:!0})})]})}var f=a(t(),1),p=`motion`,m=`motionchange`;function h(){return typeof document<`u`&&document.documentElement.dataset.motion===`off`}function g(e){return window.addEventListener(m,e),()=>window.removeEventListener(m,e)}function _(){return[(0,f.useSyncExternalStore)(g,h,()=>!1),(0,f.useCallback)(()=>{let e=!h();e?document.documentElement.dataset.motion=`off`:delete document.documentElement.dataset.motion;try{localStorage.setItem(p,e?`off`:`on`)}catch{}window.dispatchEvent(new Event(m))},[])]}function v({className:e}){let[t,n]=_();return(0,s.jsx)(`button`,{type:`button`,onClick:n,className:e,children:t?`resume motion`:`pause motion`})}function y(){let e=[...i.booking.enabled?[{label:`book ${i.artist.split(` `)[0]}`,href:`/book/`,external:!1}]:[],...i.socials.map(e=>({...e,external:!0}))];return(0,s.jsx)(`footer`,{id:`contact`,className:`border-t-4 border-black bg-black text-white`,children:(0,s.jsxs)(`div`,{className:`mx-auto max-w-6xl px-5 py-16 md:px-6 md:py-24`,children:[(0,s.jsxs)(`h2`,{className:`font-display text-4xl uppercase leading-[0.95] md:text-6xl`,children:[`say hi —`,(0,s.jsx)(`br`,{}),(0,s.jsx)(`span`,{className:`text-outline`,children:`make some noise`})]}),e.length>0&&(0,s.jsx)(`div`,{className:`mt-10 flex flex-wrap gap-x-10 gap-y-4 text-[0.625rem] uppercase tracking-[0.35em] text-neutral-400 md:mt-12 md:text-xs`,children:e.map(e=>e.external?(0,s.jsxs)(`a`,{href:e.href,target:`_blank`,rel:`noopener`,className:`-my-2 py-2 transition-colors hover:text-white`,children:[e.label,` `,(0,s.jsx)(`span`,{"aria-hidden":!0,children:`↗`}),(0,s.jsx)(`span`,{className:`sr-only`,children:` (opens in a new tab)`})]},e.href):(0,s.jsxs)(`a`,{href:e.href,className:`-my-2 py-2 text-white transition-colors hover:text-neutral-400`,children:[e.label,` `,(0,s.jsx)(`span`,{"aria-hidden":!0,children:`→`})]},e.href))}),(0,s.jsxs)(`div`,{className:`mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-[0.5625rem] uppercase tracking-[0.3em] text-quiet md:text-[0.625rem]`,children:[(0,s.jsx)(`span`,{children:`© mmxxvi aditya chowhan`}),(0,s.jsx)(v,{className:`-my-2 cursor-pointer py-2 uppercase transition-colors hover:text-white`}),(0,s.jsx)(`span`,{children:`black & white by design — colour by the music`})]})]})})}var b=14,x=7,S=14,C=260,w=85,T=17;function E({className:e,cell:t=36,radius:n=200}){let i=(0,f.useRef)(null),a=(0,f.useRef)(null);return(0,f.useEffect)(()=>{let e=i.current,r=a.current;if(!e||!r||!window.matchMedia(`(hover: hover) and (pointer: fine)`).matches||window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let o=r.getContext(`2d`);if(!o)return;let s=typeof Path2D.prototype.roundRect==`function`,c=[],l=[],u=[];for(let e=0;e<b;e++){let t=(e+.5)/b;c.push(`rgba(255,255,255,${(.01+t*.05).toFixed(4)})`),l.push(`rgba(255,255,255,${(.05+t*.42).toFixed(4)})`),u.push(`rgba(255,255,255,${(Math.max(0,t-.45)*.12).toFixed(4)})`)}let d=0,f=0,p=0,m=0,g=new Float32Array,_=new Float32Array,v=new Uint8Array,y=new Int32Array,E=0,D={x:-9e5,y:-9e5,on:!1},O=NaN,k=NaN,A=null,j=0,M=0,N=!0,P=()=>{let n=e.getBoundingClientRect();d=Math.max(1,Math.round(n.width)),f=Math.max(1,Math.round(n.height));let i=Math.min(window.devicePixelRatio||1,2);r.width=Math.round(d*i),r.height=Math.round(f*i),r.style.width=`${d}px`,r.style.height=`${f}px`,o.setTransform(i,0,0,i,0,0),p=Math.ceil(d/t),m=Math.ceil(f/t);let a=p*m;g=new Float32Array(a),_=new Float32Array(a),v=new Uint8Array(a),y=new Int32Array(a),E=0,A=null},F=()=>{for(let e=0;e<E;e++){let t=y[e];g[t]=0,_[t]=0,v[t]=0}E=0,o.clearRect(0,0,d,f),A=null},I=r=>{j=0;let i=Math.min((r-M)/1e3,1/30);M=r;let a=e.getBoundingClientRect(),d=D.on?D.x-a.left:-9e5,f=D.on?D.y-a.top:-9e5;if(D.on){let e=Math.max(0,Math.floor((d-n)/t)),r=Math.min(p-1,Math.floor((d+n)/t)),i=Math.max(0,Math.floor((f-n)/t)),a=Math.min(m-1,Math.floor((f+n)/t));for(let t=i;t<=a;t++){let n=t*p;for(let t=e;t<=r;t++){let e=n+t;v[e]||(v[e]=1,y[E++]=e)}}}let h=[];for(let e=0;e<b;e++)h.push(null);let N=n*n,P=1e9,F=1e9,L=-1e9,R=-1e9,z=!1,B=0;for(let e=0;e<E;e++){let r=y[e],a=r%p,o=(r-a)/p,c=a*t+t*.5,l=o*t+t*.5,u=d-c,m=f-l,E=u*u+m*m,D=0;if(E<N){let e=1-Math.sqrt(E)/n;D=e*e*(3-2*e)}let O=_[r],k=g[r],A=D>k?C*(.5+.5*D):w;if(O+=((D-k)*A-O*T)*i,k+=O*i,D===0&&k<.003&&k>-.003&&O<.02&&O>-.02){g[r]=0,_[r]=0,v[r]=0;continue}g[r]=k,_[r]=O,y[B++]=r;let j=D-k;if((O>.02||O<-.02||j>.004||j<-.004)&&(z=!0),k>.004){let e=k>1?1:k,n=(t-x)*(1+k*.16),r=c-n*.5,i=l-n*.5-k*S,a=e>=1?b-1:e*b|0,o=h[a];o||(o=new Path2D,h[a]=o),s?o.roundRect(r,i,n,n,2+k*2):o.rect(r,i,n,n),r<P&&(P=r),i<F&&(F=i),r+n>L&&(L=r+n),i+n>R&&(R=i+n)}}E=B;let V=L>-1e9?[P-3,F-3,L+3,R+3]:null;if(V||A){let e=V??A,t=A??V,n=Math.min(e[0],t[0]),r=Math.min(e[1],t[1]);o.clearRect(n,r,Math.max(e[2],t[2])-n,Math.max(e[3],t[3])-r)}A=V;for(let e=0;e<b;e++){let t=h[e];t&&(e>b*.45&&(o.lineWidth=3,o.strokeStyle=u[e],o.stroke(t)),o.fillStyle=c[e],o.fill(t),o.lineWidth=1,o.strokeStyle=l[e],o.stroke(t))}let H=D.x!==O||D.y!==k;O=D.x,k=D.y,E>0&&(z||H)&&(j=requestAnimationFrame(I))},L=()=>{j||!N||(M=performance.now(),j=requestAnimationFrame(I))},R=e=>{if(h()){D.on&&(D.on=!1,L());return}D.x=e.clientX,D.y=e.clientY,D.on=!0,L()},z=()=>{D.on=!1,L()},B=()=>{E>0&&L()};P();let V=null,H=()=>{P(),U(),L()},U=()=>{V?.removeEventListener(`change`,H),V=window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),V.addEventListener(`change`,H)};U();let W=new ResizeObserver(()=>{P(),L()});W.observe(e);let G=new IntersectionObserver(([e])=>{N=e.isIntersecting,N?L():j&&(cancelAnimationFrame(j),j=0,F())},{threshold:0});return G.observe(e),window.addEventListener(`mousemove`,R,{passive:!0}),window.addEventListener(`scroll`,B,{passive:!0}),document.addEventListener(`mouseleave`,z),window.addEventListener(`blur`,z),()=>{j&&cancelAnimationFrame(j),V?.removeEventListener(`change`,H),W.disconnect(),G.disconnect(),window.removeEventListener(`mousemove`,R),window.removeEventListener(`scroll`,B),document.removeEventListener(`mouseleave`,z),window.removeEventListener(`blur`,z)}},[t,n]),(0,s.jsxs)(`div`,{ref:i,"aria-hidden":!0,className:r(`pointer-events-none absolute inset-0 z-0 overflow-hidden`,e),children:[(0,s.jsx)(`div`,{className:`absolute inset-0`,style:{backgroundImage:`radial-gradient(circle at center, rgba(255,255,255,0.075) 1px, transparent 1.5px)`,backgroundSize:`${t}px ${t}px`,maskImage:`radial-gradient(ellipse 100% 95% at 50% 45%, #000 30%, rgba(0,0,0,0.55) 68%, transparent 92%)`,WebkitMaskImage:`radial-gradient(ellipse 100% 95% at 50% 45%, #000 30%, rgba(0,0,0,0.55) 68%, transparent 92%)`}}),(0,s.jsx)(`canvas`,{ref:a,className:`absolute inset-0 block h-full w-full`})]})}function D(){return(0,s.jsx)(`div`,{"aria-hidden":!0,className:`pointer-events-none absolute -bottom-48 -left-48 z-0 hidden md:block`,children:(0,s.jsxs)(`div`,{className:`relative h-[38rem] w-[38rem] animate-spin-slower rounded-full border border-white/30 bg-[radial-gradient(circle,transparent_58%,rgba(255,255,255,0.04)_100%)]`,children:[(0,s.jsx)(`div`,{className:`absolute inset-10 rounded-full border border-white/20`}),(0,s.jsx)(`div`,{className:`absolute inset-20 rounded-full border border-white/20`}),(0,s.jsx)(`div`,{className:`absolute inset-32 rounded-full border border-dashed border-white/30`}),(0,s.jsx)(`div`,{className:`absolute inset-44 rounded-full border border-white/20`}),(0,s.jsx)(`div`,{className:`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45`}),(0,s.jsx)(`div`,{className:`absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70`}),(0,s.jsx)(`div`,{className:`absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-white/50`})]})})}function O(){return(0,s.jsxs)(`header`,{className:`relative flex min-h-svh flex-col overflow-hidden bg-black text-white`,children:[(0,s.jsx)(E,{}),(0,s.jsx)(n,{page:`home`}),(0,s.jsx)(D,{}),(0,s.jsxs)(`div`,{className:`relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center`,children:[(0,s.jsx)(`p`,{className:`mb-6 text-[0.625rem] uppercase tracking-[0.55em] text-quiet md:mb-8 md:text-xs`,children:`( sound on ) — vol. 01`}),(0,s.jsxs)(`h1`,{className:`relative font-display uppercase leading-[0.84]`,children:[(0,s.jsx)(`span`,{className:`block text-[clamp(4.4rem,17vw,15rem)] tracking-[0.01em]`,children:`Aditya`}),` `,(0,s.jsx)(`span`,{className:`text-outline block text-[clamp(4.4rem,17vw,15rem)] tracking-[0.01em]`,children:`Chowhan`}),` `,(0,s.jsx)(`span`,{className:`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[5deg] whitespace-nowrap font-accent text-[clamp(2.2rem,7.5vw,5.5rem)] lowercase italic tracking-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`,children:`makes\xA0music`})]}),(0,s.jsxs)(`p`,{className:`mt-9 max-w-md text-[0.625rem] font-medium uppercase leading-loose tracking-[0.28em] text-neutral-400 md:mt-11 md:text-xs`,children:[`everything here is black & white —`,(0,s.jsx)(`br`,{}),`until you press play.`]})]}),(0,s.jsxs)(`div`,{className:`z-10 flex items-end justify-between px-5 pb-6 text-[0.5625rem] uppercase tracking-[0.35em] text-quiet md:px-10 md:pb-8 md:text-[0.6875rem]`,children:[(0,s.jsx)(`span`,{className:`hidden sm:block`,children:`est. mmxxvi`}),(0,s.jsxs)(`a`,{href:`#sound`,className:`group flex flex-col items-center gap-2 text-neutral-300 transition-colors hover:text-white`,children:[(0,s.jsx)(`span`,{children:`scroll for the sound`}),(0,s.jsx)(`span`,{"aria-hidden":!0,className:`animate-bounce text-sm leading-none`,children:`↓`})]}),(0,s.jsx)(`span`,{className:`hidden sm:block`,children:`play it loud ♪`})]})]})}var k=`attribute vec2 aPos; void main(){ gl_Position=vec4(aPos,0.0,1.0); }`,A={wave:`precision highp float;
uniform vec2 iResolution; uniform float iTime; uniform float uSaturation;
const float PI = 3.14159265359;
const float AMPLITUDE   = 0.32;
const float FREQ        = 1.1;
const float ABER_FREQ   = 1.0;
const float SPEED       = 2.4;
const float WAVE_SCALE  = 0.6;
const float ABERRATION  = 2.6;
const float THICKNESS   = 3.0;
const float INTENSITY   = 2.;
const float FALLOFF     = 1.7;
const float EDGE_MASK   = 0.4;
const float EDGE_INSET  = 0.0;
const float BAND_FILL   = 30000.0;
const float BAND_THICK  = 0.08;
const float SOFTNESS    = 2.5;
const float LOW_AMP     = 6.0;
const float LOW_INT     = 1.5;
const float MID_ABER    = 0.8;
const float MID_ABAMP   = 0.05;
const float MID_BAND    = 20.0;
const float MID_SOFT    = 0.4;
const float HIGH_ABER   = 0.5;
const float HIGH_ABAMP  = 0.06;
const float RESOLVED    = 1.0;
const float UNRES_SCALE = 0.14;

vec3 spectral4(int s){
    float x = float(s);
    return clamp(vec3(abs(x-3.0)-1.0, 2.0-abs(x-2.0), 2.0-abs(x-4.0)), 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 R = iResolution.xy;
    float aspect = R.x / R.y;
    vec2 p = (fragCoord + 0.5) * 2.0 / R - 1.0;
    p.x *= aspect;
    float yScreen = p.y;
    p /= max(WAVE_SCALE, 0.1);

    float t   = iTime;
    float low  = clamp(0.45 + 0.45*sin(t*0.8)*sin(t*0.37+1.0), 0.0, 1.0);
    float mid  = clamp(0.40 + 0.40*sin(t*1.7+2.0)*sin(t*0.53), 0.0, 1.0);
    float high = clamp(0.30 + 0.30*sin(t*2.9+4.0)*sin(t*0.71+2.0), 0.0, 1.0);

    float res   = clamp(RESOLVED, 0.0, 1.0);
    float drift = mod(t, 20.0*PI) * SPEED;

    float xN  = p.x / max(aspect, 1.0);
    float env = cos(PI*0.5 * min(abs(0.9*xN), 1.0));
    env *= env;

    float A1    = AMPLITUDE + 0.01*low*LOW_AMP;
    float A2    = A1 + mid*MID_ABAMP + high*HIGH_ABAMP;
    float AB    = (ABERRATION + mid*MID_ABER + high*HIGH_ABER)*res;
    float th    = mix(0.1, 0.01*THICKNESS, res);
    float inten = mix(0.1, 0.01*(INTENSITY + low*LOW_INT), res);
    float soft  = 0.01*res*max(0.0, SOFTNESS + mid*MID_SOFT);

    float dUnres = max(length(p) - mix(0.14, UNRES_SCALE, res), 0.0);
    float yMain = A1 * env * res * sin(p.x*FREQ + drift);

    float bandFillTh = max(BAND_THICK, 1e-4);
    float bandAmt    = 1e-4 * BAND_FILL * inten;
    vec3 num = vec3(0.0), den = vec3(0.0);
    for(int s = 0; s < 4; s++){
        vec3 hue = mix(vec3(1.0), spectral4(s), res * uSaturation);
        den += hue;
        float ab = mix(-AB, AB, float(s)/3.0);
        float yL = A2 * env * res * sin(p.x*ABER_FREQ + drift + ab);
        float d   = mix(dUnres, abs(p.y - yL), res);
        float lor = mix(1.0/(1.0 + (0.02*d)*(0.02*d)), 1.0, res);
        float line = inten / (sqrt(d*d + soft*soft) + th);
        float lo = min(yMain, yL), hi = max(yMain, yL);
        float dBand = max(0.0, max(p.y - hi, lo - p.y));
        float band  = bandAmt / (dBand + bandFillTh);
        num += hue * lor * (line + band);
    }
    vec3 col = num / den;

    float dM    = mix(dUnres, abs(p.y - yMain), res);
    float lorM  = mix(1.0/(1.0 + (0.02*dM)*(0.02*dM)), 1.0, res);
    float boost = (1.0 - res) * (14.0*low + 4.0);
    col += 0.5 * inten * (lorM + boost) / (sqrt(dM*dM + soft*soft) + th);

    col = pow(max(col, 0.0), vec3(1.5));
    float emT = clamp((abs(yScreen) - 1.0 + EDGE_INSET) / (-max(EDGE_MASK, 1e-4)), 0.0, 1.0);
    float em  = emT*emT*(3.0 - 2.0*emT);
    float gauss = exp(-pow(xN*FALLOFF, 2.0));
    col *= mix(1.0, em*gauss, res);
    col *= res;
    fragColor = vec4(col, 1.0);
}
void main(){ mainImage(gl_FragColor, gl_FragCoord.xy); }`,"fluid-dots":`precision highp float;
uniform vec2 iResolution; uniform float iTime;
const float TAU = 6.28318530718;
const int   N   = 6;
const float SMOOTH_K = 0.08;
const float INTENSITY  = 0.0025;
const float FALLOFF_P  = 1.35;
const float FADE_START = 0.02;
const float FADE_END   = 0.56;
const float ABERR = 0.005;
const vec3  SPECTRAL = vec3(0.0, 0.5, 1.0) * ABERR;
const float HUE_SPEED = 0.06;
const float COLOR_K   = 0.5;
const float SAT       = 0.01;
const float HUE_SPAN  = 0.667;
const float MERGE_PERIOD = 6.0;
const float T_MOVE   = 1.25;
const float STAGGER  = 0.33;
const float HOLD     = 0.0;
const float W = 4.6;
const float L = 3.2;
const float PIERCE  = 0.12;
const float RECOIL  = 0.035;
const float REC_LAG = 0.11;
const float GATHER_PERIOD = 12.0;
const float GATHER_START  = 9.2;
const float GATHER_HOLD   = 0.8;
const float GATHER_R      = 0.008;
const float GATHER_DIM    = 0.85;
const float GATHER_IN     = 1.8;
const float GATHER_IN_L   = 7.5;
const float BURST_W = 6.5;
const float BURST_L = 4.0;
const float CHARGE_T     = 0.30;
const float CHARGE_SHRK  = 0.18;
const float CHARGE_GLOW  = 0.35;
const float FLASH_GAIN   = 1.2;
const float FLASH_DECAY  = 7.0;

float hash11(float n){ return fract(sin(n*127.1 + 311.7)*43758.5453); }
float settleWL(float tau, float w, float l){
    if(tau <= 0.0) return 0.0;
    return 1.0 - exp(-l*tau)*cos(w*tau);
}
float settle(float tau){ return settleWL(tau, W, L); }
float settleCrit(float tau, float l){
    if(tau <= 0.0) return 0.0;
    return 1.0 - exp(-l*tau)*(1.0 + l*tau);
}
float smin(float a, float b, float k){
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h*h*k*0.25;
}
vec3 hue2rgb(float h){
    h = fract(h);
    float r = clamp(abs(h*6.0 - 3.0) - 1.0, 0.0, 1.0);
    float g = clamp(2.0 - abs(h*6.0 - 2.0), 0.0, 1.0);
    float b = clamp(2.0 - abs(h*6.0 - 4.0), 0.0, 1.0);
    return vec3(r, g, b);
}
float dotR(float fi, float seed, float t){
    return 0.036 + 0.010*sin(t*1.3 + seed*TAU) + 0.005*sin(t*2.4 + fi*1.3);
}
float dotSD(vec2 p, vec2 pos, float r, float t, float fi, float shapeDamp){
    vec2 d = p - pos;
    float sq = 0.075 * (0.5 + 0.5*sin(t*0.9 + fi*2.0)) * shapeDamp;
    float ca = cos(t*0.35 + fi), sa = sin(t*0.35 + fi);
    d = mat2(ca,-sa,sa,ca) * d;
    d *= vec2(1.0+sq, 1.0-sq);
    return length(d) - r;
}
vec3 scene(vec2 p, float t){
    float k  = floor(t/MERGE_PERIOD);
    float u  = fract(t/MERGE_PERIOD);
    float te = u * MERGE_PERIOD;
    float tg = mod(t, GATHER_PERIOD);
    float g  = settleCrit((tg - GATHER_START) * GATHER_IN, GATHER_IN_L)
             - settleWL(tg - GATHER_START - GATHER_HOLD, BURST_W, BURST_L);
    float gC = clamp(g, 0.0, 1.0);
    float tb     = tg - (GATHER_START + GATHER_HOLD);
    float charge = smoothstep(-CHARGE_T, 0.0, min(tb, 0.0)) * gC;
    float flash  = tb > 0.0 ? exp(-tb * FLASH_DECAY) : 0.0;
    float gBright = mix(1.0, GATHER_DIM, gC) * (1.0 + CHARGE_GLOW*charge + FLASH_GAIN*flash);
    vec3  total3 = vec3(1e5);
    vec3  cAcc   = vec3(0.0);
    float wAcc   = 1e-6;
    for(int i=0; i<N; i++){
        float fi   = float(i);
        float seed = hash11(fi);
        float ang = fi/float(N)*TAU + t*0.35;
        vec2 dir  = vec2(cos(ang), sin(ang));
        float R = 0.17 + 0.010*sin(t*1.0) + 0.007*sin(t*1.3 + seed*TAU);
        float pairId   = mod(fi, 3.0);
        float moverLow = mod(k + pairId, 2.0);
        float isMover  = (fi < 2.5) ? step(moverLow, 0.5) : step(0.5, moverLow);
        float goStart  = pairId * STAGGER;
        float retStart = 3.0*STAGGER + HOLD + pairId * STAGGER;
        float m   = (settle(te - goStart)           - settle(te - retStart))           * isMover;
        float rec = (settle(te - goStart - REC_LAG) - settle(te - retStart - REC_LAG)) * (1.0 - isMover);
        float rSelf = dotR(fi, seed, t);
        rSelf = mix(rSelf, 0.036, gC);
        rSelf *= 1.0 - CHARGE_SHRK * charge;
        float fj    = mod(fi + 3.0, 6.0);
        float rPart = dotR(fj, hash11(fj), t);
        float deep   = -(R + RECOIL) - PIERCE * rPart;
        float radial = mix(R, deep, m) + RECOIL * rec;
        radial = mix(radial, GATHER_R, g);
        vec2  pos    = radial * dir;
        float sdR = dotSD(p - SPECTRAL.r*dir, pos, rSelf, t, fi, 1.0 - gC);
        float sdG = dotSD(p - SPECTRAL.g*dir, pos, rSelf, t, fi, 1.0 - gC);
        float sdB = dotSD(p - SPECTRAL.b*dir, pos, rSelf, t, fi, 1.0 - gC);
        total3 = vec3( smin(total3.r, sdR, SMOOTH_K),
                       smin(total3.g, sdG, SMOOTH_K),
                       smin(total3.b, sdB, SMOOTH_K) );
        float hue = fract(fi/float(N) + t*HUE_SPEED) * HUE_SPAN;
        vec3 dotCol = mix(vec3(1.0), hue2rgb(hue), SAT);
        float w = exp(-sdG * COLOR_K);
        cAcc += w * dotCol;
        wAcc += w;
    }
    vec3 sd3    = max(total3, vec3(0.0)) + 1e-4;
    vec3 core3  = clamp(INTENSITY / pow(sd3, vec3(FALLOFF_P)), 0.0, 1.0);
    vec3 edge3  = 1.0 - smoothstep(vec3(FADE_START), vec3(FADE_END), sd3);
    vec3 bright = core3 * edge3 * gBright;
    return bright * (cAcc / wAcc);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 res = iResolution.xy;
    vec2 p = (2.0*fragCoord - res) / min(res.x, res.y);
    float t = iTime;
    p /= 1.0 + 0.03*sin(t*1.0);
    vec3 col = scene(p, t);
    col *= 1.0 + 0.05*sin(t*1.0 + 1.0);
    col = pow(col, vec3(1.0/1.2));
    col = min(col, 1.0);
    float n = fract(sin(dot(fragCoord, vec2(12.9898,78.233)))*43758.5453);
    col += (n - 0.5)/255.0;
    fragColor = vec4(col, 1.0);
}
void main(){ mainImage(gl_FragColor, gl_FragCoord.xy); }`};function j({variant:e=`wave`,size:t=420,renderScale:n=.75,saturation:i=1,className:a,style:o,...c}){let l=f.useRef(null);return f.useEffect(()=>{let r=l.current;if(!r)return;let a=r.getContext(`webgl`);if(!a)return;let o=(e,t)=>{let n=a.createShader(e);return n?(a.shaderSource(n,t),a.compileShader(n),a.getShaderParameter(n,a.COMPILE_STATUS)?n:(console.warn(`SiriWave: shader failed to compile`,a.getShaderInfoLog(n)),a.deleteShader(n),null)):null},s=o(a.VERTEX_SHADER,k),c=o(a.FRAGMENT_SHADER,A[e]),u=a.createProgram();if(!s||!c||!u){s&&a.deleteShader(s),c&&a.deleteShader(c);return}if(a.attachShader(u,s),a.attachShader(u,c),a.linkProgram(u),!a.getProgramParameter(u,a.LINK_STATUS)){console.warn(`SiriWave: program failed to link`,a.getProgramInfoLog(u)),a.deleteProgram(u),a.deleteShader(s),a.deleteShader(c);return}a.useProgram(u);let d=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,d),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),a.STATIC_DRAW);let f=a.getAttribLocation(u,`aPos`);a.enableVertexAttribArray(f),a.vertexAttribPointer(f,2,a.FLOAT,!1,0,0);let p=a.getUniformLocation(u,`iResolution`),m=a.getUniformLocation(u,`iTime`);a.uniform1f(a.getUniformLocation(u,`uSaturation`),i);let h=Math.round(t*n);r.width=h,r.height=h,a.viewport(0,0,h,h);let g=typeof performance<`u`?performance.now():Date.now(),_=0,v=()=>{let e=((typeof performance<`u`?performance.now():Date.now())-g)/1e3;a.uniform2f(p,h,h),a.uniform1f(m,e),a.drawArrays(a.TRIANGLES,0,3),_=requestAnimationFrame(v)};return v(),()=>{cancelAnimationFrame(_),a.deleteProgram(u),a.deleteShader(s),a.deleteShader(c),a.deleteBuffer(d)}},[e,t,n,i]),(0,s.jsx)(`canvas`,{ref:l,className:r(`block rounded-[20px] bg-black`,a),style:{width:t,height:t,...o},...c})}var M=2400,N=8e3,P=900,F=`min(380px, 86vw)`;function I(){let[e,t]=(0,f.useState)(`loading`),[n,i]=(0,f.useState)(null),[a,o]=(0,f.useState)(!1);if((0,f.useEffect)(()=>{let e=window.innerWidth||document.documentElement.clientWidth;i({size:e>0?Math.min(380,Math.round(e*.86)):380,scale:Math.min(window.devicePixelRatio||1,2)})},[]),(0,f.useEffect)(()=>{let e=!0;return(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{e&&o(!0)}),()=>{e=!1}},[]),(0,f.useEffect)(()=>{let e=document.documentElement,n=e.style.overflow;e.style.overflow=`hidden`;let r=!1,i=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches||h(),a=document.readyState===`complete`?Promise.resolve():new Promise(e=>window.addEventListener(`load`,()=>e(),{once:!0})),o=document.fonts?document.fonts.ready.then(()=>{}):Promise.resolve(),s=new Promise(e=>setTimeout(e,i?0:M)),c=new Promise(e=>setTimeout(e,N));return Promise.race([Promise.all([a,o,s]),c]).then(()=>{r||(e.style.overflow=n,t(`leaving`))}),()=>{r=!0,e.style.overflow=n}},[]),(0,f.useEffect)(()=>{if(e!==`leaving`)return;let n=window.setTimeout(()=>t(`done`),P);return()=>window.clearTimeout(n)},[e]),e===`done`)return null;let c=e===`leaving`;return(0,s.jsxs)(`div`,{"data-loader":!0,role:`status`,"aria-label":`Loading`,className:r(`fixed inset-0 z-[45] flex flex-col items-center justify-center bg-black transition-opacity ease-out`,c&&`pointer-events-none opacity-0`),style:{transitionDuration:`${P}ms`},children:[(0,s.jsx)(`div`,{className:r(`transition-[transform,filter] ease-in`,c&&`scale-[1.18] blur-[6px]`),style:{transitionDuration:`${P}ms`,width:F,height:F},children:n&&(0,s.jsx)(`div`,{className:`h-full w-full animate-fade-in`,children:(0,s.jsx)(j,{"aria-hidden":!0,variant:`wave`,size:n.size,renderScale:n.scale,saturation:0,style:{width:`100%`,height:`100%`,maskImage:`linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)`,WebkitMaskImage:`linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)`}})})}),(0,s.jsx)(`div`,{className:r(`flex min-h-10 flex-col items-center gap-3 transition-opacity duration-300`,c&&`opacity-0`),style:{marginTop:`calc(${F} * -0.18)`},children:a&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`p`,{className:`animate-fade-in text-[0.625rem] font-bold uppercase tracking-[0.5em] text-white/85 md:text-xs`,children:`adimakesmusic`}),(0,s.jsx)(`p`,{className:`animate-fade-in text-[0.5625rem] uppercase tracking-[0.45em] text-quiet [animation-delay:150ms] md:text-[0.625rem]`,children:`tuning in`})]})})]})}var L=r(`sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]`,`focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-black`,`focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.3em]`);function R({to:e}){return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`a`,{href:e,className:L,children:`skip to content`}),(0,s.jsx)(v,{className:L})]})}var z=`/`,B=26,V=[{id:`track-01`,number:`01`,title:`Track 01`,image:`${z}pics/aditya-chowhan.jpg`},{id:`track-02`,number:`02`,title:`Track 02`,gradient:`bg-gradient-to-br from-amber-300 via-orange-500 to-rose-600`,ink:`dark`},{id:`track-03`,number:`03`,title:`Track 03`,gradient:`bg-gradient-to-br from-sky-300 via-blue-600 to-indigo-800`,ink:`light`},{id:`track-04`,number:`04`,title:`Track 04`,gradient:`bg-gradient-to-br from-lime-300 via-emerald-500 to-teal-800`,ink:`dark`}];function H(e){let t=(0,f.useRef)(null),n=(0,f.useRef)(null),r=(0,f.useRef)(null),i=(0,f.useRef)(null),a=(0,f.useRef)(void 0),o=(0,f.useRef)(!1),[s,c]=(0,f.useState)(!1),[l,u]=(0,f.useState)(!1),d=(0,f.useCallback)(()=>{if(!t.current){let n=new Audio(e);n.loop=!0,n.preload=`auto`,t.current=n}if(!n.current){let e=new(window.AudioContext??window.webkitAudioContext),a=e.createMediaElementSource(t.current),o=e.createAnalyser();o.fftSize=512,o.smoothingTimeConstant=.82;let s=e.createGain();a.connect(o),o.connect(s),s.connect(e.destination),n.current=e,i.current=o,r.current=s}return t.current},[e]),p=(0,f.useCallback)(async()=>{let e=d();o.current=!0,window.clearTimeout(a.current);try{if(n.current?.resume().catch(()=>{}),await e.play(),!o.current){e.pause(),c(!1);return}n.current?.resume().catch(()=>{});let t=n.current,i=r.current;t&&i&&(i.gain.cancelScheduledValues(t.currentTime),i.gain.setValueAtTime(i.gain.value,t.currentTime),i.gain.linearRampToValueAtTime(1,t.currentTime+.35)),c(!0),u(!1)}catch{u(!0)}},[d]),m=(0,f.useCallback)(()=>{o.current=!1;let e=n.current,i=r.current;e&&i&&!t.current?.paused?(i.gain.cancelScheduledValues(e.currentTime),i.gain.setValueAtTime(i.gain.value,e.currentTime),i.gain.linearRampToValueAtTime(1e-4,e.currentTime+.25),a.current=window.setTimeout(()=>t.current?.pause(),270)):t.current?.pause(),c(!1)},[]);return(0,f.useEffect)(()=>()=>{window.clearTimeout(a.current),t.current?.pause(),n.current?.close().catch(()=>{})},[]),{play:p,pause:m,playing:s,blocked:l,analyserRef:i}}function U({analyser:e,live:t}){let n=(0,f.useRef)([]);return(0,f.useEffect)(()=>{if(!t)return;let r=0,i=null,a=()=>{let t=e.current;if(t){(!i||i.length!==t.frequencyBinCount)&&(i=new Uint8Array(t.frequencyBinCount)),t.getByteFrequencyData(i);let e=Math.floor(i.length*.75),r=(B-1)/2;for(let t=0;t<B;t++){let a=Math.abs(t-r)/r,o=Math.min(e-1,Math.round(a**1.7*(e-1))),s=0;for(let t=0;t<4;t++)s+=i[Math.min(e-1,o+t)];let c=(s/4/255)**1.25,l=n.current[t];l&&(l.style.height=`${Math.max(6,c*100)}%`,l.style.opacity=String(.55+c*.45))}}r=requestAnimationFrame(a)};return r=requestAnimationFrame(a),()=>{cancelAnimationFrame(r);for(let e of n.current)e&&(e.style.height=``,e.style.opacity=``)}},[e,t]),(0,s.jsx)(`div`,{"aria-hidden":!0,className:`flex h-24 items-center justify-center gap-[3px] md:h-36 md:gap-1`,children:Array.from({length:B}).map((e,i)=>(0,s.jsx)(`span`,{ref:e=>{n.current[i]=e},className:r(`w-[3px] rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.4)] md:w-[5px]`,!t&&`animate-eq-bar`),style:{height:`8%`,animationDelay:`${i%7*.11}s`,animationDuration:`${.8+i%5*.14}s`}},i))})}function W(){let[e,t]=(0,f.useState)(0),[n,i]=(0,f.useState)(!1),[a,o]=(0,f.useState)(!1),{play:c,pause:l,playing:u,blocked:d,analyserRef:p}=H(`${z}audio/track-01.mp3`),m=n||a,h=()=>{o(!0),c()},g=()=>{o(!1),l()},_=e=>{if(t(e),e!==0){a&&g();return}u?g():h()};return(0,s.jsx)(`div`,{className:`flex h-[24rem] w-full items-stretch gap-2 md:h-[30rem] md:gap-3`,children:V.map((o,c)=>{let l=e===c,f=c===0,v=o.ink===`dark`;return(0,s.jsxs)(`div`,{role:`button`,tabIndex:0,"aria-pressed":f?u:void 0,"aria-expanded":f?void 0:l,onPointerEnter:e=>{e.pointerType!==`touch`&&(t(c),f&&(i(!0),h()))},onPointerLeave:f?e=>{e.pointerType!==`touch`&&(i(!1),g())}:void 0,onClick:()=>_(c),onKeyDown:e=>{e.repeat||(e.key===`Enter`||e.key===` `?(e.preventDefault(),_(c)):e.key===`Escape`&&f&&g())},onFocus:()=>t(c),onBlur:f?()=>{n||g()}:void 0,style:{flexGrow:l?7:1,flexBasis:0},className:r(`group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl transition-[flex-grow,box-shadow] duration-500 ease-in-out md:rounded-3xl`,l?`shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)]`:`shadow-[0_12px_35px_-14px_rgba(0,0,0,0.35)]`,o.gradient),children:[o.image&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`span`,{className:`sr-only`,children:`Play `}),(0,s.jsx)(`img`,{"aria-hidden":!0,src:o.image,alt:`Aditya Chowhan with his guitar`,width:960,height:1280,draggable:!1,className:r(`absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-all duration-700`,m?`scale-110 blur-[6px] brightness-[0.45]`:`scale-100`)}),(0,s.jsx)(`div`,{className:`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent`}),(0,s.jsx)(`div`,{className:r(`absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/45 to-transparent transition-opacity duration-500`,l?`opacity-0`:`opacity-100`)}),(0,s.jsxs)(`div`,{className:r(`absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 transition-opacity duration-500`,m&&l?`opacity-100`:`pointer-events-none opacity-0`),children:[(0,s.jsx)(U,{analyser:p,live:u}),(0,s.jsx)(`p`,{"aria-hidden":!0,className:`px-4 text-center text-[0.5625rem] uppercase tracking-[0.45em] text-white/90 md:text-[0.6875rem]`,children:u?`now playing — track 01`:d?`♪ click once for sound`:a?`tuning…`:`paused — click to play`})]}),(0,s.jsxs)(`div`,{className:r(`absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5 transition-opacity duration-500 md:p-6`,l?`opacity-100`:`opacity-0`),children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`p`,{className:`font-display text-2xl uppercase leading-none text-white md:text-3xl`,children:o.title}),(0,s.jsx)(`p`,{className:`mt-2 text-[0.5625rem] uppercase tracking-[0.4em] text-white/85 md:text-[0.625rem]`,children:`aditya chowhan — demo`})]}),(0,s.jsx)(`span`,{"aria-hidden":!0,className:r(`flex h-9 w-9 items-center justify-center rounded-full border border-white/60 text-sm text-white transition-colors md:h-10 md:w-10`,u&&`border-white bg-white text-black`),children:`♪`})]})]}),!o.image&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`div`,{className:`grain absolute inset-0 opacity-30 mix-blend-overlay`}),(0,s.jsxs)(`div`,{className:r(`absolute inset-0 flex flex-col items-start justify-between p-5 transition-opacity delay-100 duration-500 md:p-6`,l?`opacity-100`:`opacity-0`),children:[(0,s.jsx)(`span`,{className:`rounded-full border border-black/70 px-3 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.3em] text-black md:text-[0.625rem]`,children:`coming soon`}),(0,s.jsxs)(`div`,{children:[(0,s.jsxs)(`p`,{className:r(`font-display text-6xl uppercase leading-none md:text-8xl`,v?`text-black`:`text-white/95`),children:[(0,s.jsx)(`span`,{className:`sr-only`,children:`Track `}),o.number]}),(0,s.jsx)(`p`,{className:r(`mt-2 text-[0.5625rem] uppercase tracking-[0.4em] md:text-[0.625rem]`,v?`text-black/80`:`text-white`),children:`still in the studio`})]})]})]}),(0,s.jsx)(`div`,{"aria-hidden":!0,className:r(`absolute inset-0 flex items-end justify-center pb-5 transition-opacity duration-300`,l?`pointer-events-none opacity-0`:`opacity-100`),children:(0,s.jsx)(`span`,{className:r(`rotate-180 text-[0.5625rem] font-semibold uppercase tracking-[0.4em] [writing-mode:vertical-rl] md:text-[0.625rem]`,v?`text-black`:`text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]`),children:f?`${o.number} — track 01 ♪`:`${o.number} — soon`})})]},o.id)})})}function G(){return(0,s.jsx)(`section`,{id:`sound`,className:`relative bg-[#f5f4f3] pb-24 pt-28 text-black md:pb-32 md:pt-36`,children:(0,s.jsxs)(`div`,{className:`mx-auto max-w-6xl px-4 md:px-6`,children:[(0,s.jsxs)(`div`,{className:`mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-16`,children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`p`,{className:`mb-3 text-[0.625rem] uppercase tracking-[0.5em] text-quiet-ink md:text-[0.6875rem]`,children:`01 — the shelf`}),(0,s.jsxs)(`h2`,{className:`font-display text-5xl uppercase leading-[0.9] md:text-7xl`,children:[`the `,(0,s.jsx)(`span`,{className:`font-accent lowercase italic`,children:`sound`})]})]}),(0,s.jsxs)(`p`,{className:`max-w-[16rem] text-right text-[0.5625rem] uppercase leading-loose tracking-[0.25em] text-quiet-ink md:text-[0.6875rem]`,children:[`hover or tap the first card ♪`,(0,s.jsx)(`br`,{}),`the rest are still in the studio`]})]}),(0,s.jsx)(W,{}),(0,s.jsx)(`p`,{className:`mt-10 text-center text-[0.5625rem] uppercase tracking-[0.4em] text-quiet-ink md:text-[0.625rem]`,children:`( this is where the colour lives )`})]})})}function K(){return(0,s.jsxs)(`div`,{id:`top`,className:`relative min-h-svh overflow-x-clip bg-black font-grotesk`,children:[(0,s.jsx)(R,{to:`#sound`}),(0,s.jsx)(O,{}),(0,s.jsxs)(`main`,{children:[(0,s.jsx)(d,{}),(0,s.jsx)(G,{})]}),(0,s.jsx)(y,{}),(0,s.jsx)(I,{}),(0,s.jsx)(`div`,{"aria-hidden":!0,className:`grain pointer-events-none fixed inset-0 z-50 opacity-[0.06]`})]})}o((0,s.jsx)(K,{}));