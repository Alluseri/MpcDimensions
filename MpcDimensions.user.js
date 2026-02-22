// ==UserScript==
// @name         MpcUtils
// @namespace    https://lunahook.dev/
// @version      2.0.0
// @description  A set of handy utilities for Mapartcraft.
// @author       Alluseri
// @match        https://rebane2001.com/mapartcraft/
// @match        https://mike2b2t.github.io/mapartcraft/
// @icon         https://rebane2001.com/favicon.ico
// @grant        none
// @run-at       document-idle
// ==/UserScript==

/** biome-ignore-all lint: intended */

(function () {
	'use strict';

	function buildElement(tag, characteristics, inner, callback) {
		var elem = document.createElement(tag);
		elem.replaceChildren(...(inner?.filter(t => t) || []));
		for (let _ in (characteristics || {})) {
			elem[_] = characteristics[_];
		}
		if (callback) callback(elem);
		return elem;
	}

	const $ = document.querySelector.bind(document);
	const $$ = Query => Array.from(document.querySelectorAll(Query));
	const id = document.getElementById.bind(document);

	document.head.appendChild(buildElement("style", {
		innerHTML: `
		#luna-mpcu-container {
			display: flex;
			flex-direction: row;
			gap: 2px;
		}

		#luna-mpcu-input-container {
			display: flex;
			flex-direction: column;
			gap: 2px;

            > div {
            	display: flex;
                flex-direction: row;

            	> input {
					width: 80px;
					margin-left: 4px;
                    flex: 1;
				}
            }
		}

		#luna-mpcu-calc-btn {
			flex: 1;
		}

        #luna-mpcu-slop-killer-btn {
            height: 40px;
            flex: 1;
        }
		`
	}))

    function payload() {
        $(".mapPreviewDiv").appendChild(buildElement("div", {
            "id": "luna-mpcu-container"
        }, [
            buildElement("div", {
                "id": "luna-mpcu-input-container"
            }, [
                buildElement("div", {}, [
                    buildElement("span", { innerText: "Max X pieces:" }),
                    buildElement("input", { min: 1, type: "number", id: "luna-mpcu-x", value: 10 })
                ]),
                buildElement("div", {}, [
                    buildElement("span", { innerText: "Max Y pieces:" }),
                    buildElement("input", { min: 1, type: "number", id: "luna-mpcu-y", value: 10 })
                ]),
                buildElement("div", {}, [
                    buildElement("span", { innerText: "Max dev (%):" }),
                    buildElement("input", { min: 0, max: 50, step: 0.5, type: "number", id: "luna-mpcu-dev", value: 5 })
                ])
            ]),
            buildElement("button", {
                "id": "luna-mpcu-calc-btn",
                "innerText": "let's joe"
            }, [], button => {
                button.addEventListener("click", () => {
                    var maxX = id("luna-mpcu-x").value;
                    var maxY = id("luna-mpcu-y").value;
                    var tg = $(".mapResWarning")?.innerText.split("x");
                    if (!tg) return alert("Looks like the map is already good as-is, or the website got updated and broke this userscript!");
                    var targetHor = tg[0] - 0;
                    var targetVert = tg[1] - 0;
                    var maxSizeDev = id("luna-mpcu-dev").value;

                    var all = [];
                    for (var x = 1;x < maxX;x++)
                        for (var y = 1;y < maxY;y++) {
                            var tratio = (x * 128) / (y * 128);
                            var xx = Math.round(targetVert * tratio);
                            var szdev = Math.abs(1 - (xx * targetVert) / (targetHor * targetVert)) * 100;
                            if (szdev > maxSizeDev) continue;
                            all.push([`${x}x${y}`, szdev, `${xx}x${targetVert}`]);
                        }

                    all.sort((a, b) => a[1] - b[1]);

                    alert(all.map(t => {
						var m = (100 - t[1]);
						return m == 100 ? `${t[0]} is a perfect map size!` : `${t[0]} is more akin to ${t[2]} (a ${m.toFixed(1)}% match)`;
					}).join("\n"));
                });
            })
        ]));

        $(".mapPreviewDiv").appendChild(buildElement("button", {
            "id": "luna-mpcu-slop-killer-btn",
            "innerText": "Optimize palette by threshold"
        }, [], Button => {
            Button.addEventListener("click", () => {
                var threshold = prompt("What is the threshold for block removal?") - 0;
                if (!threshold)
                    return;

                var pack = Array.from($("#materialtable").firstElementChild.children).map(t => ({
                    block: t.querySelector(".tooltipText")?.innerText,
                    count: t.lastElementChild.innerText.split(" ")[0] - 0
                })).filter(t => t.block && t.block != "Placeholder Block" && t.count);

                var summary = [];
                pack.forEach(t => {
                    if (t.count < threshold) {
                        var el = $(".blockSelectionDiv").querySelector(`[alt='${t.block}']`).closest(".colourSet").querySelector(`[alt='None']`);
                        if (!el) {
                            alert(`BUG: Failed to uncheck ${t.block}. Please report this!`);
                            return;
                        }
                        el.click(); // this is a bit cringe but im in no mood to figure out the internal workings of the website, sorry
                        summary.push(`- Deleted ${t.count} of ${t.block}`);
                    }
                });

                if (summary.length > 0) {
                    alert(`Summary for optimization threshold of ${threshold} blocks:\n${summary.join("\n")}`);
                } else {
                    alert(`No blocks were found under the threshold of ${threshold} blocks!`);
                }
            });
        }));
    }

    if ($(".mapPreviewDiv"))
        payload();
    else window.addEventListener("load", payload);
})();
