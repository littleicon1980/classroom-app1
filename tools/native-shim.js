/* Native (Capacitor) bridge shim: print, file save/share, external links. No-op in a normal browser. */
(function(){
  var C = window.Capacitor;
  if(!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var P = function(n){ return (C.Plugins||{})[n]; };
  document.documentElement.className += " native-app";

  /* ---- printing: hand the page to the OS print dialog (Save as PDF / printer) ---- */
  window.print = function(){
    var np = P("NativePrint");
    if(!np){ alert("الطباعة غير متاحة على هذا الجهاز"); return; }
    try{ window.dispatchEvent(new Event("beforeprint")); }catch(e){}
    var landscape = document.body.classList.contains("dash-open");
    var done = function(){ try{ window.dispatchEvent(new Event("afterprint")); }catch(e){} };
    np.print({ name: document.title || "Classroom Dashboard", landscape: landscape }).then(done, done);
  };

  /* ---- downloads: blob anchors become "save / share" sheets ---- */
  document.addEventListener("click", function(ev){
    var a = ev.target && ev.target.closest ? ev.target.closest("a[download]") : null;
    if(!a || !/^blob:/.test(a.href)) return;
    var fs = P("Filesystem"), sh = P("Share");
    if(!fs || !sh) return;
    ev.preventDefault(); ev.stopPropagation();
    var name = a.getAttribute("download") || "file";
    fetch(a.href).then(function(r){ return r.blob(); }).then(function(blob){
      return new Promise(function(res, rej){
        var fr = new FileReader();
        fr.onload = function(){ res(String(fr.result).split(",")[1] || ""); };
        fr.onerror = rej; fr.readAsDataURL(blob);
      });
    }).then(function(b64){
      return fs.writeFile({ path: name, data: b64, directory: "CACHE" });
    }).then(function(w){
      return sh.share({ title: name, url: w.uri, dialogTitle: name });
    }).catch(function(e){
      if(e && /cancel/i.test(String(e.message||e))) return;
      alert("تعذّر حفظ الملف");
    });
  }, true);

  /* ---- external links open in the system browser ---- */
  var _open = window.open;
  window.open = function(url){
    var b = P("Browser");
    if(b && url){ b.open({ url: String(url) }); return null; }
    return _open.apply(window, arguments);
  };

  /* ---- Android back button: close the open screen first, then go back to the class list, then exit ---- */
  var appPlugin = P("App"), lastBack = 0;
  if(appPlugin && appPlugin.addListener){
    appPlugin.addListener("backButton", function(){
      var scan = document.querySelector(".scan-ov"), sc = scan && scan.querySelector("#scClose");
      if(sc){ sc.click(); return; }
      if(document.body.classList.contains("dash-open")){
        document.dispatchEvent(new KeyboardEvent("keydown", {key:"Escape", bubbles:true})); return;
      }
      if(document.body.classList.contains("focus")){
        document.dispatchEvent(new KeyboardEvent("keydown", {key:"Escape", bubbles:true})); return;
      }
      var cur = document.querySelector('.tool[aria-current="true"]'), home = document.querySelector('[data-tool="class"]');
      if(cur && home && cur.getAttribute("data-tool") !== "class"){ home.click(); return; }
      var now = Date.now();
      if(now - lastBack < 2000){ if(appPlugin.exitApp) appPlugin.exitApp(); return; }
      lastBack = now;
      var t = document.getElementById("toast");
      if(t){ t.textContent = "اضغط مرة أخرى للخروج"; t.classList.add("on"); setTimeout(function(){ t.classList.remove("on"); }, 1900); }
    });
  }
})();
