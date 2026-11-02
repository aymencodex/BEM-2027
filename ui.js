(function () {
  try {
    var u = JSON.parse(localStorage.getItem('tracker-4am-ui')) || {}, r = document.documentElement;
    if (u.ac) r.setAttribute('data-ac', u.ac);
    if (u.fs) r.setAttribute('data-fs', u.fs);
    if (u.mo === 'off') r.setAttribute('data-mo', 'off');
    if (u.ob === 0) r.setAttribute('data-ob', 'off');
  } catch (e) {}
})();
