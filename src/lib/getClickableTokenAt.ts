function Wv(e: string) {
	if (!e)
		return "";
	var t = e.indexOf("|");
	return -1 !== t && ("\\" === e.charAt(t - 1) && t--,
	e = e.slice(0, t)),
	e = e.trim()
}

function $v(e: string) {
	return !(!e.startsWith("./") && !e.startsWith("../")) || -1 === e.indexOf(":")
}

export function getClickableTokenAt(cm: CodeMirror.Editor, e: CodeMirror.Position) {
	
	const rE = 'hmd-internal-link'

	var t = cm
	var n = t.getLineTokens(e.line)
	var i = t.getTokenAt(e, !0)
	var r = i.type;
	
	if (r) {
		for (var o = r.split(" "), s = o.contains(rE), a = o.contains("formatting-link") && ["[[", "]]"].contains(i.string), l = -1, c = 0; c < n.length; c++) {
			if ((w = n[c]).start === i.start && w.end === i.end) {
				l = c;
				break
			}
		}
		if (s || a) {
			if (-1 !== l) {
				for (var u = l - 1; u >= 0; ) {
					var h = (w = n[u]).type;
					if (!h || !h.contains(rE))
						break;
					u--
				}
				for (var p = l + 1; p < n.length; ) {
					var d = (w = n[p]).type;
					if (!d || !d.contains(rE))
						break;
					p++
				}
				var f = ""
				  , g = e.ch
				  , m = e.ch;
				for (c = u + 1; c < p; c++) {
					(w = n[c]).type.contains(rE) && (f += w.string,
					w.start < g && (g = w.start),
					w.end > m && (m = w.end))
				}
				return {
					type: "internal-link",
					text: Wv(f),
					start: {
						line: e.line,
						ch: g
					},
					end: {
						line: e.line,
						ch: m
					}
				}
			}
			return null
		}
		if (o.contains("url")) {
			var v = i.string;
			if ("(" === v ? i = n[l + 1] : ")" === v && (i = n[l - 1]),
			!i)
				return null;
			v = i.string;
			try {
				v = decodeURI(v)
			} catch (e) {
				return null
			}
			var y = !0;
			return o.contains("string") ? y = !$v(v) : /^([a-z0-9+.-]+):/.test(v) || (v = "https://" + v),
			{
				type: y ? "external-link" : "internal-link",
				text: v,
				start: {
					line: e.line,
					ch: i.start
				},
				end: {
					line: e.line,
					ch: i.end
				}
			}
		}
		if (o.contains("hashtag")) {
			var b = "";
			for (g = e.ch,
			m = e.ch,
			c = 0; c < n.length; c++) {
				var w;
				if ((w = n[c]).type && w.type.split(" ").contains("hashtag"))
					b += w.string,
					w.start < g && (g = w.start),
					w.end > m && (m = w.end);
				else {
					if (!(c < l))
						break;
					b = "",
					g = e.ch,
					m = e.ch
				}
			}
			if (b)
				return {
					type: "tag",
					text: b,
					start: {
						line: e.line,
						ch: g
					},
					end: {
						line: e.line,
						ch: m
					}
				}
		}
		return null
	}
}
