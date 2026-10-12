function _(s){const t=s-1;return t*t*t+1}function m(s){const t=typeof s=="string"&&s.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);return t?[parseFloat(t[1]),t[2]||"px"]:[s,"px"]}function x(s,{delay:t=0,duration:a=400,easing:e=_,x:i=0,y:f=0,opacity:o=0}={}){const n=getComputedStyle(s),c=+n.opacity,p=n.transform==="none"?"":n.transform,u=c*(1-o),[y,r]=m(i),[$,d]=m(f);return{delay:t,duration:a,easing:e,css:(l,g)=>`
			transform: ${p} translate(${(1-l)*y}${r}, ${(1-l)*$}${d});
			opacity: ${c-u*g}`}}function C(s,{delay:t=0,duration:a=400,easing:e=_,start:i=0,opacity:f=0}={}){const o=getComputedStyle(s),n=+o.opacity,c=o.transform==="none"?"":o.transform,p=1-i,u=n*(1-f);return{delay:t,duration:a,easing:e,css:(y,r)=>`
			transform: ${c} scale(${1-p*r});
			opacity: ${n-u*r}
		`}}export{x as f,C as s};
