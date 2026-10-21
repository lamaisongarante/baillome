// Moteur de rendu minimal des maquettes Baillome (lecture seule hors de la toile)
class DCLogic { constructor(props){ this.props = props || {}; this.state = {}; } setState(o){ Object.assign(this.state, o); if (window.__dcRender) window.__dcRender(); } }
window.DCLogic = DCLogic;
(function(){
  function get(scope, expr){ expr = expr.trim(); if (expr === 'true') return true; if (expr === 'false') return false; return expr.split('.').reduce((o,k)=> o == null ? undefined : o[k], scope); }
  function isExpr(s){ return /^\s*\{\{[^}]+\}\}\s*$/.test(s); }
  function inner(s){ return s.replace(/^\s*\{\{|\}\}\s*$/g,''); }
  function interp(str, scope){ return str.replace(/\{\{([^}]+)\}\}/g,(m,e)=>{ const v = get(scope,e); return (v == null || typeof v === 'function') ? '' : String(v); }); }
  function proc(node, scope){
    const kids = Array.from(node.childNodes);
    for (const n of kids){
      if (n.nodeType === 3){ if (n.nodeValue.includes('{{')) n.nodeValue = interp(n.nodeValue, scope); continue; }
      if (n.nodeType !== 1) continue;
      const tag = n.tagName.toLowerCase();
      if (tag === 'sc-for'){
        const list = get(scope, inner(n.getAttribute('list'))) || []; const as = n.getAttribute('as');
        const frag = document.createDocumentFragment();
        list.forEach(item => { const wrap = document.createElement('div'); wrap.innerHTML = n.innerHTML; proc(wrap, Object.assign({}, scope, {[as]: item})); while (wrap.firstChild) frag.appendChild(wrap.firstChild); });
        n.replaceWith(frag); continue;
      }
      if (tag === 'sc-if'){
        const v = get(scope, inner(n.getAttribute('value')));
        if (v){ const wrap = document.createElement('div'); wrap.innerHTML = n.innerHTML; proc(wrap, scope); const frag = document.createDocumentFragment(); while (wrap.firstChild) frag.appendChild(wrap.firstChild); n.replaceWith(frag); } else n.remove();
        continue;
      }
      for (const a of Array.from(n.attributes)){
        if (!a.value.includes('{{')) continue;
        if (/^on/i.test(a.name) && isExpr(a.value)){ const fn = get(scope, inner(a.value)); n.removeAttribute(a.name); if (typeof fn === 'function') n.addEventListener(a.name.slice(2).toLowerCase(), fn); continue; }
        n.setAttribute(a.name, interp(a.value, scope));
      }
      proc(n, scope);
    }
  }
  window.addEventListener('DOMContentLoaded', () => {
    const host = document.querySelector('x-dc'); if (!host) return;
    const helmet = host.querySelector('helmet'); if (helmet){ Array.from(helmet.children).forEach(c => document.head.appendChild(c)); helmet.remove(); }
    const tpl = host.innerHTML;
    const sc = document.querySelector('script[type="text/x-dc"]');
    let inst = null;
    if (sc){ const Comp = new Function('DCLogic', sc.textContent + '\nreturn Component;')(DCLogic); inst = new Comp({}); }
    window.__dcRender = () => { const vals = inst && inst.renderVals ? inst.renderVals() : {}; host.innerHTML = tpl; proc(host, vals); };
    window.__dcRender();
  });
})();
