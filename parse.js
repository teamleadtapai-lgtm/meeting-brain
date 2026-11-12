/* Pure helpers: turning Claude's reply into sections. */
function mbBullets(body) {
  return body
    .split(/\n+/)
    .map(function (s) { return s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim(); })
    .filter(Boolean);
}
function mbParse(text, streaming) {
  var out = { say: "", needs: [], solution: "", suggestions: [], ask: [], sayDone: false, formatted: false };
  var re = /^[ \t*#>]*\[(SAY|NEEDS|SOLUTION|SUGGESTIONS|ASK)\][*:]*[ \t]*/gm;
  var marks = [];
  var m;
  while ((m = re.exec(text))) marks.push({ key: m[1], start: m.index, end: re.lastIndex });
  if (!marks.length) {
    var raw = text.trim();
    // While the first marker is still being typed, show nothing yet.
    if (streaming && raw.length < 16 && /^[*#> ]*\[/.test(raw)) raw = "";
    out.say = raw;
    return out;
  }
  out.formatted = true;
  marks.forEach(function (mk, i) {
    var last = i + 1 >= marks.length;
    var body = text.slice(mk.end, last ? text.length : marks[i + 1].start);
    // Drop a marker that is only half written at the very end of the stream.
    if (last && streaming) body = body.replace(/\n[ \t*#>]*\[[A-Z]*$/, "");
    body = body.trim();
    if (mk.key === "SAY") { out.say = body; out.sayDone = !last; }
    else if (mk.key === "SOLUTION") out.solution = body;
    else out[mk.key.toLowerCase()] = mbBullets(body);
  });
  return out;
}
