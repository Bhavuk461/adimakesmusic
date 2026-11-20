import{c as e,l as t,n,o as r,s as i,t as a}from"./mount-Brga4sIX.js";import{n as o,r as s,t as c}from"./skip-links-DBOfqtUY.js";var l=i(),u=[`the sound`,`aditya chowhan`,`play it loud`,`adimakesmusic`,`vol. 01`,`listen`];function d(){return(0,l.jsx)(`svg`,{viewBox:`0 0 100 100`,className:`h-4 w-4 shrink-0 md:h-5 md:w-5`,"aria-hidden":!0,children:[0,45,90,135].map(e=>(0,l.jsx)(`line`,{x1:`50`,y1:`8`,x2:`50`,y2:`92`,stroke:`currentColor`,strokeWidth:`10`,strokeLinecap:`round`,transform:`rotate(${e} 50 50)`},e))})}function f({words:t,className:n,reverse:r=!1,slow:i=!1}){let a=(0,l.jsx)(`div`,{className:`flex shrink-0 items-center font-display text-xl uppercase leading-none tracking-wide md:text-3xl`,children:Array.from({length:3}).flatMap((e,n)=>t.map((e,t)=>(0,l.jsxs)(`span`,{className:`flex items-center gap-5 pr-5 md:gap-9 md:pr-9`,children:[(0,l.jsx)(`span`,{className:`whitespace-nowrap`,children:e}),(0,l.jsx)(d,{})]},`${n}-${t}`)))});return(0,l.jsx)(`div`,{className:e(`-ml-[5vw] w-[110vw] overflow-hidden py-2.5 md:py-3.5`,n),children:(0,l.jsxs)(`div`,{className:e(`flex w-max`,i?`animate-marquee-slow`:`animate-marquee`,r&&`[animation-direction:reverse]`),children:[a,(0,l.jsx)(`div`,{"aria-hidden":!0,className:`contents`,children:a})]})})}function p({words:e=u}){return(0,l.jsxs)(`div`,{"aria-hidden":!0,className:`relative z-20 -my-8 select-none md:-my-10`,children:[(0,l.jsx)(`div`,{className:`-rotate-[2.2deg]`,children:(0,l.jsx)(f,{words:e,className:`border-y-[3px] border-black bg-white text-black`})}),(0,l.jsx)(`div`,{className:`-mt-4 rotate-[1.6deg] md:-mt-6`,children:(0,l.jsx)(f,{words:e,className:`border-y border-white/25 bg-black text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]`,reverse:!0,slow:!0})})]})}var m=t(r(),1),h=14,g=7,_=14,v=260,y=85,b=17;function x({className:t,cell:n=36,radius:r=200}){let i=(0,m.useRef)(null),a=(0,m.useRef)(null);return(0,m.useEffect)(()=>{let e=i.current,t=a.current;if(!e||!t||!window.matchMedia(`(hover: hover) and (pointer: fine)`).matches||window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let o=t.getContext(`2d`);if(!o)return;let c=typeof Path2D.prototype.roundRect==`function`,l=[],u=[],d=[];for(let e=0;e<h;e++){let t=(e+.5)/h;l.push(`rgba(255,255,255,${(.01+t*.05).toFixed(4)})`),u.push(`rgba(255,255,255,${(.05+t*.42).toFixed(4)})`),d.push(`rgba(255,255,255,${(Math.max(0,t-.45)*.12).toFixed(4)})`)}let f=0,p=0,m=0,x=0,S=new Float32Array,C=new Float32Array,w=new Uint8Array,T=new Int32Array,E=0,D={x:-9e5,y:-9e5,on:!1},O=NaN,k=NaN,A=null,j=0,M=0,N=!0,P=()=>{let r=e.getBoundingClientRect();f=Math.max(1,Math.round(r.width)),p=Math.max(1,Math.round(r.height));let i=Math.min(window.devicePixelRatio||1,2);t.width=Math.round(f*i),t.height=Math.round(p*i),t.style.width=`${f}px`,t.style.height=`${p}px`,o.setTransform(i,0,0,i,0,0),m=Math.ceil(f/n),x=Math.ceil(p/n);let a=m*x;S=new Float32Array(a),C=new Float32Array(a),w=new Uint8Array(a),T=new Int32Array(a),E=0,A=null},F=()=>{for(let e=0;e<E;e++){let t=T[e];S[t]=0,C[t]=0,w[t]=0}E=0,o.clearRect(0,0,f,p),A=null},I=t=>{j=0;let i=Math.min((t-M)/1e3,1/30);M=t;let a=e.getBoundingClientRect(),s=D.on?D.x-a.left:-9e5,f=D.on?D.y-a.top:-9e5;if(D.on){let e=Math.max(0,Math.floor((s-r)/n)),t=Math.min(m-1,Math.floor((s+r)/n)),i=Math.max(0,Math.floor((f-r)/n)),a=Math.min(x-1,Math.floor((f+r)/n));for(let n=i;n<=a;n++){let r=n*m;for(let n=e;n<=t;n++){let e=r+n;w[e]||(w[e]=1,T[E++]=e)}}}let p=[];for(let e=0;e<h;e++)p.push(null);let N=r*r,P=1e9,F=1e9,L=-1e9,R=-1e9,z=!1,B=0;for(let e=0;e<E;e++){let t=T[e],a=t%m,o=(t-a)/m,l=a*n+n*.5,u=o*n+n*.5,d=s-l,x=f-u,E=d*d+x*x,D=0;if(E<N){let e=1-Math.sqrt(E)/r;D=e*e*(3-2*e)}let O=C[t],k=S[t],A=D>k?v*(.5+.5*D):y;if(O+=((D-k)*A-O*b)*i,k+=O*i,D===0&&k<.003&&k>-.003&&O<.02&&O>-.02){S[t]=0,C[t]=0,w[t]=0;continue}S[t]=k,C[t]=O,T[B++]=t;let j=D-k;if((O>.02||O<-.02||j>.004||j<-.004)&&(z=!0),k>.004){let e=k>1?1:k,t=(n-g)*(1+k*.16),r=l-t*.5,i=u-t*.5-k*_,a=e>=1?h-1:e*h|0,o=p[a];o||(o=new Path2D,p[a]=o),c?o.roundRect(r,i,t,t,2+k*2):o.rect(r,i,t,t),r<P&&(P=r),i<F&&(F=i),r+t>L&&(L=r+t),i+t>R&&(R=i+t)}}E=B;let V=L>-1e9?[P-3,F-3,L+3,R+3]:null;if(V||A){let e=V??A,t=A??V,n=Math.min(e[0],t[0]),r=Math.min(e[1],t[1]);o.clearRect(n,r,Math.max(e[2],t[2])-n,Math.max(e[3],t[3])-r)}A=V;for(let e=0;e<h;e++){let t=p[e];t&&(e>h*.45&&(o.lineWidth=3,o.strokeStyle=d[e],o.stroke(t)),o.fillStyle=l[e],o.fill(t),o.lineWidth=1,o.strokeStyle=u[e],o.stroke(t))}let H=D.x!==O||D.y!==k;O=D.x,k=D.y,E>0&&(z||H)&&(j=requestAnimationFrame(I))},L=()=>{j||!N||(M=performance.now(),j=requestAnimationFrame(I))},R=e=>{if(s()){D.on&&(D.on=!1,L());return}D.x=e.clientX,D.y=e.clientY,D.on=!0,L()},z=()=>{D.on=!1,L()},B=()=>{E>0&&L()};P();let V=null,H=()=>{P(),U(),L()},U=()=>{V?.removeEventListener(`change`,H),V=window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),V.addEventListener(`change`,H)};U();let W=new ResizeObserver(()=>{P(),L()});W.observe(e);let G=new IntersectionObserver(([e])=>{N=e.isIntersecting,N?L():j&&(cancelAnimationFrame(j),j=0,F())},{threshold:0});return G.observe(e),window.addEventListener(`mousemove`,R,{passive:!0}),window.addEventListener(`scroll`,B,{passive:!0}),document.addEventListener(`mouseleave`,z),window.addEventListener(`blur`,z),()=>{j&&cancelAnimationFrame(j),V?.removeEventListener(`change`,H),W.disconnect(),G.disconnect(),window.removeEventListener(`mousemove`,R),window.removeEventListener(`scroll`,B),document.removeEventListener(`mouseleave`,z),window.removeEventListener(`blur`,z)}},[n,r]),(0,l.jsxs)(`div`,{ref:i,"aria-hidden":!0,className:e(`pointer-events-none absolute inset-0 z-0 overflow-hidden`,t),children:[(0,l.jsx)(`div`,{className:`absolute inset-0`,style:{backgroundImage:`radial-gradient(circle at center, rgba(255,255,255,0.075) 1px, transparent 1.5px)`,backgroundSize:`${n}px ${n}px`,maskImage:`radial-gradient(ellipse 100% 95% at 50% 45%, #000 30%, rgba(0,0,0,0.55) 68%, transparent 92%)`,WebkitMaskImage:`radial-gradient(ellipse 100% 95% at 50% 45%, #000 30%, rgba(0,0,0,0.55) 68%, transparent 92%)`}}),(0,l.jsx)(`canvas`,{ref:a,className:`absolute inset-0 block h-full w-full`})]})}function S(){return(0,l.jsx)(`div`,{"aria-hidden":!0,className:`pointer-events-none absolute -bottom-48 -left-48 z-0 hidden md:block`,children:(0,l.jsxs)(`div`,{className:`relative h-[38rem] w-[38rem] animate-spin-slower rounded-full border border-white/30 bg-[radial-gradient(circle,transparent_58%,rgba(255,255,255,0.04)_100%)]`,children:[(0,l.jsx)(`div`,{className:`absolute inset-10 rounded-full border border-white/20`}),(0,l.jsx)(`div`,{className:`absolute inset-20 rounded-full border border-white/20`}),(0,l.jsx)(`div`,{className:`absolute inset-32 rounded-full border border-dashed border-white/30`}),(0,l.jsx)(`div`,{className:`absolute inset-44 rounded-full border border-white/20`}),(0,l.jsx)(`div`,{className:`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45`}),(0,l.jsx)(`div`,{className:`absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70`}),(0,l.jsx)(`div`,{className:`absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-white/50`})]})})}function C(){return(0,l.jsxs)(`header`,{className:`relative flex min-h-svh flex-col overflow-hidden bg-black text-white`,children:[(0,l.jsx)(x,{}),(0,l.jsx)(n,{page:`home`}),(0,l.jsx)(S,{}),(0,l.jsxs)(`div`,{className:`relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center`,children:[(0,l.jsx)(`p`,{className:`mb-6 text-[0.625rem] uppercase tracking-[0.55em] text-quiet md:mb-8 md:text-xs`,children:`( sound on ) — vol. 01`}),(0,l.jsxs)(`h1`,{className:`relative font-display uppercase leading-[0.84]`,children:[(0,l.jsx)(`span`,{className:`block text-[clamp(4.4rem,17vw,15rem)] tracking-[0.01em]`,children:`Aditya`}),` `,(0,l.jsx)(`span`,{className:`text-outline block text-[clamp(4.4rem,17vw,15rem)] tracking-[0.01em]`,children:`Chowhan`}),` `,(0,l.jsx)(`span`,{className:`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[5deg] whitespace-nowrap font-accent text-[clamp(2.2rem,7.5vw,5.5rem)] lowercase italic tracking-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`,children:`makes\xA0music`})]}),(0,l.jsxs)(`p`,{className:`mt-9 max-w-md text-[0.625rem] font-medium uppercase leading-loose tracking-[0.28em] text-neutral-400 md:mt-11 md:text-xs`,children:[`everything here is black & white —`,(0,l.jsx)(`br`,{}),`until you press play.`]})]}),(0,l.jsxs)(`div`,{className:`z-10 flex items-end justify-between px-5 pb-6 text-[0.5625rem] uppercase tracking-[0.35em] text-quiet md:px-10 md:pb-8 md:text-[0.6875rem]`,children:[(0,l.jsx)(`span`,{className:`hidden sm:block`,children:`est. mmxxvi`}),(0,l.jsxs)(`a`,{href:`#sound`,className:`group flex flex-col items-center gap-2 text-neutral-300 transition-colors hover:text-white`,children:[(0,l.jsx)(`span`,{children:`scroll for the sound`}),(0,l.jsx)(`span`,{"aria-hidden":!0,className:`animate-bounce text-sm leading-none`,children:`↓`})]}),(0,l.jsx)(`span`,{className:`hidden sm:block`,children:`play it loud ♪`})]})]})}var w=`attribute vec2 aPos; void main(){ gl_Position=vec4(aPos,0.0,1.0); }`,T={wave:`precision highp float;
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
void main(){ mainImage(gl_FragColor, gl_FragCoord.xy); }`};function E({variant:t=`wave`,size:n=420,renderScale:r=.75,saturation:i=1,className:a,style:o,...s}){let c=m.useRef(null);return m.useEffect(()=>{let e=c.current;if(!e)return;let a=e.getContext(`webgl`);if(!a)return;let o=(e,t)=>{let n=a.createShader(e);return n?(a.shaderSource(n,t),a.compileShader(n),a.getShaderParameter(n,a.COMPILE_STATUS)?n:(console.warn(`SiriWave: shader failed to compile`,a.getShaderInfoLog(n)),a.deleteShader(n),null)):null},s=o(a.VERTEX_SHADER,w),l=o(a.FRAGMENT_SHADER,T[t]),u=a.createProgram();if(!s||!l||!u){s&&a.deleteShader(s),l&&a.deleteShader(l);return}if(a.attachShader(u,s),a.attachShader(u,l),a.linkProgram(u),!a.getProgramParameter(u,a.LINK_STATUS)){console.warn(`SiriWave: program failed to link`,a.getProgramInfoLog(u)),a.deleteProgram(u),a.deleteShader(s),a.deleteShader(l);return}a.useProgram(u);let d=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,d),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),a.STATIC_DRAW);let f=a.getAttribLocation(u,`aPos`);a.enableVertexAttribArray(f),a.vertexAttribPointer(f,2,a.FLOAT,!1,0,0);let p=a.getUniformLocation(u,`iResolution`),m=a.getUniformLocation(u,`iTime`);a.uniform1f(a.getUniformLocation(u,`uSaturation`),i);let h=Math.round(n*r);e.width=h,e.height=h,a.viewport(0,0,h,h);let g=typeof performance<`u`?performance.now():Date.now(),_=0,v=()=>{let e=((typeof performance<`u`?performance.now():Date.now())-g)/1e3;a.uniform2f(p,h,h),a.uniform1f(m,e),a.drawArrays(a.TRIANGLES,0,3),_=requestAnimationFrame(v)};return v(),()=>{cancelAnimationFrame(_),a.deleteProgram(u),a.deleteShader(s),a.deleteShader(l),a.deleteBuffer(d)}},[t,n,r,i]),(0,l.jsx)(`canvas`,{ref:c,className:e(`block rounded-[20px] bg-black`,a),style:{width:n,height:n,...o},...s})}var D=8e3,O=900,k=`min(380px, 86vw)`,A=()=>document.documentElement.dataset.intro===`seen`;function j(){let[t,n]=(0,m.useState)(`loading`),[r,i]=(0,m.useState)(null),[a,o]=(0,m.useState)(!1);if((0,m.useEffect)(()=>{if(A())return;let e=window.innerWidth||document.documentElement.clientWidth;i({size:e>0?Math.min(380,Math.round(e*.86)):380,scale:Math.min(window.devicePixelRatio||1,2)})},[]),(0,m.useEffect)(()=>{let e=!0;return(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{e&&o(!0)}),()=>{e=!1}},[]),(0,m.useEffect)(()=>{if(A()){n(`done`);return}let e=document.documentElement,t=e.style.overflow;e.style.overflow=`hidden`;let r=!1,i=document.readyState===`complete`?Promise.resolve():new Promise(e=>window.addEventListener(`load`,()=>e(),{once:!0})),a=document.fonts?document.fonts.ready.then(()=>{}):Promise.resolve(),o=new Promise(e=>setTimeout(e,D));return Promise.race([Promise.all([i,a]),o]).then(()=>{r||(e.style.overflow=t,n(`leaving`))}),()=>{r=!0,e.style.overflow=t}},[]),(0,m.useEffect)(()=>{if(t!==`leaving`)return;let e=window.setTimeout(()=>n(`done`),O);return()=>window.clearTimeout(e)},[t]),t===`done`)return null;let s=t===`leaving`;return(0,l.jsxs)(`div`,{"data-loader":!0,role:`status`,"aria-label":`Loading`,className:e(`fixed inset-0 z-[45] flex flex-col items-center justify-center bg-black transition-opacity ease-out`,s&&`pointer-events-none opacity-0`),style:{transitionDuration:`${O}ms`},children:[(0,l.jsx)(`div`,{className:e(`transition-[transform,filter] ease-in`,s&&`scale-[1.18] blur-[6px]`),style:{transitionDuration:`${O}ms`,width:k,height:k},children:r&&(0,l.jsx)(`div`,{className:`h-full w-full animate-fade-in`,children:(0,l.jsx)(E,{"aria-hidden":!0,variant:`wave`,size:r.size,renderScale:r.scale,saturation:0,style:{width:`100%`,height:`100%`,maskImage:`linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)`,WebkitMaskImage:`linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)`}})})}),(0,l.jsx)(`div`,{className:e(`flex min-h-10 flex-col items-center gap-3 transition-opacity duration-300`,s&&`opacity-0`),style:{marginTop:`calc(${k} * -0.18)`},children:a&&(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`p`,{className:`animate-fade-in text-[0.625rem] font-bold uppercase tracking-[0.5em] text-white/85 md:text-xs`,children:`adimakesmusic`}),(0,l.jsx)(`p`,{className:`animate-fade-in text-[0.5625rem] uppercase tracking-[0.45em] text-quiet [animation-delay:150ms] md:text-[0.625rem]`,children:`tuning in`})]})})]})}var M=`/`,N=26,P=[{id:`track-01`,number:`01`,title:`Track 01`,image:`${M}pics/aditya-chowhan.jpg`},{id:`track-02`,number:`02`,title:`Track 02`,gradient:`bg-gradient-to-br from-amber-300 via-orange-500 to-rose-600`,ink:`dark`},{id:`track-03`,number:`03`,title:`Track 03`,gradient:`bg-gradient-to-br from-sky-300 via-blue-600 to-indigo-800`,ink:`light`},{id:`track-04`,number:`04`,title:`Track 04`,gradient:`bg-gradient-to-br from-lime-300 via-emerald-500 to-teal-800`,ink:`dark`}];function F(e){let t=(0,m.useRef)(null),n=(0,m.useRef)(null),r=(0,m.useRef)(null),i=(0,m.useRef)(null),a=(0,m.useRef)(void 0),o=(0,m.useRef)(!1),[s,c]=(0,m.useState)(!1),[l,u]=(0,m.useState)(!1),d=(0,m.useCallback)(()=>{if(!t.current){let n=new Audio(e);n.loop=!0,n.preload=`auto`,t.current=n}if(!n.current){let e=new(window.AudioContext??window.webkitAudioContext),a=e.createMediaElementSource(t.current),o=e.createAnalyser();o.fftSize=512,o.smoothingTimeConstant=.82;let s=e.createGain();a.connect(o),o.connect(s),s.connect(e.destination),n.current=e,i.current=o,r.current=s}return t.current},[e]),f=(0,m.useCallback)(async()=>{let e=d();o.current=!0,window.clearTimeout(a.current);try{if(n.current?.resume().catch(()=>{}),await e.play(),!o.current){e.pause(),c(!1);return}n.current?.resume().catch(()=>{});let t=n.current,i=r.current;t&&i&&(i.gain.cancelScheduledValues(t.currentTime),i.gain.setValueAtTime(i.gain.value,t.currentTime),i.gain.linearRampToValueAtTime(1,t.currentTime+.35)),c(!0),u(!1)}catch{u(!0)}},[d]),p=(0,m.useCallback)(()=>{o.current=!1;let e=n.current,i=r.current;e&&i&&!t.current?.paused?(i.gain.cancelScheduledValues(e.currentTime),i.gain.setValueAtTime(i.gain.value,e.currentTime),i.gain.linearRampToValueAtTime(1e-4,e.currentTime+.25),a.current=window.setTimeout(()=>t.current?.pause(),270)):t.current?.pause(),c(!1)},[]);return(0,m.useEffect)(()=>()=>{window.clearTimeout(a.current),t.current?.pause(),n.current?.close().catch(()=>{})},[]),{play:f,pause:p,playing:s,blocked:l,analyserRef:i}}function I({analyser:t,live:n}){let r=(0,m.useRef)([]);return(0,m.useEffect)(()=>{if(!n)return;let e=0,i=null,a=()=>{let n=t.current;if(n){(!i||i.length!==n.frequencyBinCount)&&(i=new Uint8Array(n.frequencyBinCount)),n.getByteFrequencyData(i);let e=Math.floor(i.length*.75),t=(N-1)/2;for(let n=0;n<N;n++){let a=Math.abs(n-t)/t,o=Math.min(e-1,Math.round(a**1.7*(e-1))),s=0;for(let t=0;t<4;t++)s+=i[Math.min(e-1,o+t)];let c=(s/4/255)**1.25,l=r.current[n];l&&(l.style.height=`${Math.max(6,c*100)}%`,l.style.opacity=String(.55+c*.45))}}e=requestAnimationFrame(a)};return e=requestAnimationFrame(a),()=>{cancelAnimationFrame(e);for(let e of r.current)e&&(e.style.height=``,e.style.opacity=``)}},[t,n]),(0,l.jsx)(`div`,{"aria-hidden":!0,className:`flex h-24 items-center justify-center gap-[3px] md:h-36 md:gap-1`,children:Array.from({length:N}).map((t,i)=>(0,l.jsx)(`span`,{ref:e=>{r.current[i]=e},className:e(`w-[3px] rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.4)] md:w-[5px]`,!n&&`animate-eq-bar`),style:{height:`8%`,animationDelay:`${i%7*.11}s`,animationDuration:`${.8+i%5*.14}s`}},i))})}function L(){let[t,n]=(0,m.useState)(0),[r,i]=(0,m.useState)(!1),[a,o]=(0,m.useState)(!1),{play:s,pause:c,playing:u,blocked:d,analyserRef:f}=F(`${M}audio/track-01.mp3`),p=r||a,h=()=>{o(!0),s()},g=()=>{o(!1),c()},_=e=>{if(n(e),e!==0){a&&g();return}u?g():h()};return(0,l.jsx)(`div`,{className:`flex h-[24rem] w-full items-stretch gap-2 md:h-[30rem] md:gap-3`,children:P.map((o,s)=>{let c=t===s,m=s===0,v=o.ink===`dark`;return(0,l.jsxs)(`div`,{role:`button`,tabIndex:0,"aria-pressed":m?u:void 0,"aria-expanded":m?void 0:c,onPointerEnter:e=>{e.pointerType!==`touch`&&(n(s),m&&(i(!0),h()))},onPointerLeave:m?e=>{e.pointerType!==`touch`&&(i(!1),g())}:void 0,onClick:()=>_(s),onKeyDown:e=>{e.repeat||(e.key===`Enter`||e.key===` `?(e.preventDefault(),_(s)):e.key===`Escape`&&m&&g())},onFocus:()=>n(s),onBlur:m?()=>{r||g()}:void 0,style:{flexGrow:c?7:1,flexBasis:0},className:e(`group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl transition-[flex-grow,box-shadow] duration-500 ease-in-out md:rounded-3xl`,c?`shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)]`:`shadow-[0_12px_35px_-14px_rgba(0,0,0,0.35)]`,o.gradient),children:[o.image&&(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`span`,{className:`sr-only`,children:`Play `}),(0,l.jsx)(`img`,{"aria-hidden":!0,src:o.image,alt:`Aditya Chowhan with his guitar`,width:960,height:1280,draggable:!1,className:e(`absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-all duration-700`,p?`scale-110 blur-[6px] brightness-[0.45]`:`scale-100`)}),(0,l.jsx)(`div`,{className:`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent`}),(0,l.jsx)(`div`,{className:e(`absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/45 to-transparent transition-opacity duration-500`,c?`opacity-0`:`opacity-100`)}),(0,l.jsxs)(`div`,{className:e(`absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 transition-opacity duration-500`,p&&c?`opacity-100`:`pointer-events-none opacity-0`),children:[(0,l.jsx)(I,{analyser:f,live:u}),(0,l.jsx)(`p`,{"aria-hidden":!0,className:`px-4 text-center text-[0.5625rem] uppercase tracking-[0.45em] text-white/90 md:text-[0.6875rem]`,children:u?`now playing — track 01`:d?`♪ click once for sound`:a?`tuning…`:`paused — click to play`})]}),(0,l.jsxs)(`div`,{className:e(`absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5 transition-opacity duration-500 md:p-6`,c?`opacity-100`:`opacity-0`),children:[(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`p`,{className:`font-display text-2xl uppercase leading-none text-white md:text-3xl`,children:o.title}),(0,l.jsx)(`p`,{className:`mt-2 text-[0.5625rem] uppercase tracking-[0.4em] text-white/85 md:text-[0.625rem]`,children:`aditya chowhan — demo`})]}),(0,l.jsx)(`span`,{"aria-hidden":!0,className:e(`flex h-9 w-9 items-center justify-center rounded-full border border-white/60 text-sm text-white transition-colors md:h-10 md:w-10`,u&&`border-white bg-white text-black`),children:`♪`})]})]}),!o.image&&(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`div`,{className:`grain absolute inset-0 opacity-30 mix-blend-overlay`}),(0,l.jsxs)(`div`,{className:e(`absolute inset-0 flex flex-col items-start justify-between p-5 transition-opacity delay-100 duration-500 md:p-6`,c?`opacity-100`:`opacity-0`),children:[(0,l.jsx)(`span`,{className:`rounded-full border border-black/70 px-3 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.3em] text-black md:text-[0.625rem]`,children:`coming soon`}),(0,l.jsxs)(`div`,{children:[(0,l.jsxs)(`p`,{className:e(`font-display text-6xl uppercase leading-none md:text-8xl`,v?`text-black`:`text-white/95`),children:[(0,l.jsx)(`span`,{className:`sr-only`,children:`Track `}),o.number]}),(0,l.jsx)(`p`,{className:e(`mt-2 text-[0.5625rem] uppercase tracking-[0.4em] md:text-[0.625rem]`,v?`text-black/80`:`text-white`),children:`still in the studio`})]})]})]}),(0,l.jsx)(`div`,{"aria-hidden":!0,className:e(`absolute inset-0 flex items-end justify-center pb-5 transition-opacity duration-300`,c?`pointer-events-none opacity-0`:`opacity-100`),children:(0,l.jsx)(`span`,{className:e(`rotate-180 text-[0.5625rem] font-semibold uppercase tracking-[0.4em] [writing-mode:vertical-rl] md:text-[0.625rem]`,v?`text-black`:`text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]`),children:m?`${o.number} — track 01 ♪`:`${o.number} — soon`})})]},o.id)})})}function R(){return(0,l.jsx)(`section`,{id:`sound`,className:`relative bg-[#f5f4f3] pb-24 pt-28 text-black md:pb-32 md:pt-36`,children:(0,l.jsxs)(`div`,{className:`mx-auto max-w-6xl px-4 md:px-6`,children:[(0,l.jsxs)(`div`,{className:`mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-16`,children:[(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`p`,{className:`mb-3 text-[0.625rem] uppercase tracking-[0.5em] text-quiet-ink md:text-[0.6875rem]`,children:`01 — the shelf`}),(0,l.jsxs)(`h2`,{className:`font-display text-5xl uppercase leading-[0.9] md:text-7xl`,children:[`the `,(0,l.jsx)(`span`,{className:`font-accent lowercase italic`,children:`sound`})]})]}),(0,l.jsxs)(`p`,{className:`max-w-[16rem] text-right text-[0.5625rem] uppercase leading-loose tracking-[0.25em] text-quiet-ink md:text-[0.6875rem]`,children:[`hover or tap the first card ♪`,(0,l.jsx)(`br`,{}),`the rest are still in the studio`]})]}),(0,l.jsx)(L,{}),(0,l.jsx)(`p`,{className:`mt-10 text-center text-[0.5625rem] uppercase tracking-[0.4em] text-quiet-ink md:text-[0.625rem]`,children:`( this is where the colour lives )`})]})})}function z(){return(0,l.jsxs)(`div`,{id:`top`,className:`relative min-h-svh overflow-x-clip bg-black font-grotesk`,children:[(0,l.jsx)(c,{to:`#sound`}),(0,l.jsx)(C,{}),(0,l.jsxs)(`main`,{children:[(0,l.jsx)(p,{}),(0,l.jsx)(R,{})]}),(0,l.jsx)(o,{}),(0,l.jsx)(j,{}),(0,l.jsx)(`div`,{"aria-hidden":!0,className:`grain pointer-events-none fixed inset-0 z-50 opacity-[0.06]`})]})}a((0,l.jsx)(z,{}));