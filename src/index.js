/*
 * Copyright (C) 2024 Katsute <https://github.com/Katsute>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

(async () => {

    const identifier = "bkx";

    // functions

    const createCSS = (id, css) => {
        const e = document.createElement("style");
        e.id = id;
        e.setAttribute("type", "text/css");
        if(css){
            e.appendChild(document.createTextNode(css));
        }
        return e;
    };

    const round = (number, places) => Math.round((number + Number.EPSILON) * Math.pow(10, places)) / Math.pow(10, places);

    // background - base

    const body = document.querySelector("body");

    const options = await (chrome ?? browser).storage.sync.get() ?? {};

    console.groupCollapsed("Loading options");
    console.info(JSON.stringify(options, null, 4));
    console.groupEnd();

    const wA = options.renderContentAboveBackground || false;
    const si = options.smoothImageRendering || false;

    body.setAttribute(`${identifier}-wA`, wA);
    body.setAttribute(`${identifier}-si`, si);

    const wT = options.windowTime || 0;
    const eT = options.editorTime || 0;
    const sT = options.sidebarTime || 0;
    const pT = options.panelTime || 0;

    const wI = [...(options.windowBackgrounds || [])];
    const eI = [...(options.editorBackgrounds || [])];
    const sI = [...(options.sidebarBackgrounds || [])];
    const pI = [...(options.panelBackgrounds || [])];

    const wC = [...Array(wI.length).keys()];
    const eC = [...Array(eI.length).keys()];
    const sC = [...Array(sI.length).keys()];
    const pC = [...Array(pI.length).keys()];

    const wS = [
        `body${!wA ? "::before" : " > div[role='application'] > div.monaco-grid-view::after"}`
    ];
    const eS = [
        `.split-view-view > .editor-group-container::after`
    ];
    const sS = [
        `.split-view-view > .part.sidebar::after`,
        `.split-view-view > .part.auxiliarybar::after`
    ];
    const pS = [
        `.split-view-view > .part.panel::after`
    ];

    const global = createCSS(`${identifier}-global`);

    for(const [images, selectors, position, repeat, size, opacity, blur] of [
        [
            wI,
            wS,
            options.windowPosition || "center center",
            options.windowRepeat || "no-repeat",
            options.windowSize || "cover",
            options.windowOpacity || 0.9,
            options.windowBlur || 0
        ],
        [
            eI,
            eS,
            options.editorPosition || "center center",
            options.editorRepeat || "no-repeat",
            options.editorSize || "cover",
            options.editorOpacity || 0.9,
            options.editorBlur || 0
        ],
        [
            sI,
            sS,
            options.sidebarPosition || "center center",
            options.sidebarRepeat || "no-repeat",
            options.sidebarSize || "cover",
            options.sidebarOpacity || 0.9,
            options.sidebarBlur || 0
        ],
        [
            pI,
            pS,
            options.panelPosition || "center center",
            options.panelRepeat || "no-repeat",
            options.panelSize || "cover",
            options.panelOpacity || 0.9,
            options.panelBlur || 0
        ],
    ]){
        if(images.length > 0){
            global.appendChild(document.createTextNode(`
                ${selectors.join(',')} {

                    background-position: ${position};
                    background-repeat: ${repeat};
                    background-size: ${size};

                    opacity: ${round(1 - parseFloat(opacity), 2)};

                    filter: blur(${blur});

                }
            `));
        }
    }

    // background - images

    const shuffle = (arr) => {
        for(let i = arr.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    };

    const wIE = createCSS(`${identifier}-w`);
    const eIE = createCSS(`${identifier}-e`);
    const sIE = createCSS(`${identifier}-s`);
    const pIE = createCSS(`${identifier}-p`);

    const setW = () => {
        while(wIE.firstChild){
            wIE.removeChild(wIE.firstChild);
        }

        if(wI.length > 0){
            shuffle(wC);

            wIE.appendChild(document.createTextNode(`
                ${wS.join(',')} {

                    background-image: url("${wI[wC[0]].replace(/"/g, `\\"`)}");

                }
            `));
        }
    };

    const setE = () => {
        while(eIE.firstChild){
            eIE.removeChild(eIE.firstChild);
        }

        if(eI.length > 0){
            const len = Math.min(eI.length, 10);

            shuffle(eC);

            let buf = '';
            for(let i = 0; i < len; i++){
                buf += `
                    .part.editor :not(.split-view-container) .split-view-container > .split-view-view:nth-child(${len}n+${i+1}) > .editor-group-container::after {

                        background-image: url("${eI[eC[i]].replace(/"/g, `\\"`)}");

                    }
                `;
            };

            eIE.appendChild(document.createTextNode(buf));
        }
    };

    const setS = () => {
        while(sIE.firstChild){
            sIE.removeChild(sIE.firstChild);
        }

        if(sI.length > 0){
            shuffle(sC);

            sIE.appendChild(document.createTextNode(`
                .split-view-view > .part.sidebar::after {

                    background-image: url("${sI[sC[0]].replace(/"/g, `\\"`)}");

                }
                .split-view-view > .part.auxiliarybar::after {

                    background-image: url("${(sI[sC[1]] ?? sI[sC[0]]).replace(/"/g, `\\"`)}");

                }
            `));
        }
    };

    const setP = () => {
        while(pIE.firstChild){
            pIE.removeChild(pIE.firstChild);
        }

        if(pI.length > 0){
            shuffle(pC);

            pIE.appendChild(document.createTextNode(`
                ${pS.join(',')} {

                    background-image: url(${pI[pC[0]].replace(/"/g, `\\"`)});

                }
            `));
        }
    };

    // install

    const head = document.querySelector("head");

    const user = createCSS(`${identifier}-user`, options.css);

    head.appendChild(user);
    head.appendChild(global);
    head.appendChild(wIE);
    head.appendChild(eIE);
    head.appendChild(sIE);
    head.appendChild(pIE);

    for(const arr of [wC, eC, sC, pC]){
        shuffle(arr);
    }

    for(const [timer, attribute, images, apply] of [
        [wT, `${identifier}-wT`, wI, setW],
        [eT, `${identifier}-eT`, eI, setE],
        [sT, `${identifier}-sT`, sI, setS],
        [pT, `${identifier}-pT`, pI, setP],
    ]){
        if(timer > 0 && images.length > 1){
            setInterval(() => {
                body.setAttribute(attribute, true);
                setTimeout(() => {
                    apply();
                    body.setAttribute(attribute, false);
                }, 1 * 1000);
            }, timer * 1000);
        }
    }

    setW();
    setE();
    setS();
    setP();
})();