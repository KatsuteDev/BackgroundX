/* Copyright (C) 2024 Katsute <https://github.com/Katsute> */

(async () => {

    const identifier = "bkx";

    // functions

    const createCSS = (id, css) => {
        const e = document.createElement("style");
        e.id = id;
        e.setAttribute("type", "text/css");
        if(css){
            e.appendChild(document.createTextNode(css));
        };
        return e;
    };

    const round = (number, places) => Math.round((number + Number.EPSILON) * Math.pow(10, places)) / Math.pow(10, places);

    // background - base

    const body = document.querySelector("body");

    const options = await (chrome ?? browser).storage.sync.get("options");

    const wA = options.renderContentAboveBackground ?? false;
    const si = options.smoothImageRendering ?? false;

    body.setAttribute(`${identifier}-wA`, wA);
    body.setAttribute(`${identifier}-si`, si);

    const wT = options.windowTimer ?? 0;
    const eT = options.editorTimer ?? 0;
    const sT = options.sidebarTimer ?? 0;
    const pT = options.panelTimer ?? 0;

    const wI = [...(options.windowBackgrounds ?? [])];
    const eI = [...(options.editorBackgrounds ?? [])];
    const sI = [...(options.sidebarBackgrounds ?? [])];
    const pI = [...(options.panelBackgrounds ?? [])];

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

    for(const [images, selectors, position, repeat, size , opacity, blur] of [
        [
            wI,
            wS,
            options.windowPosition ?? "center center",
            options.windowRepeat ?? "no-repeat",
            options.windowSize ?? "cover",
            options.windowOpacity ?? 0.9,
            options.windowBlur ?? 0
        ],
        [
            eI,
            eS,
            options.editorPosition ?? "center center",
            options.editorRepeat ?? "no-repeat",
            options.editorSize ?? "cover",
            options.editorOpacity ?? 0.9,
            options.editorBlur ?? 0
        ],
        [
            sI,
            sS,
            options.sidebarPosition ?? "center center",
            options.sidebarRepeat ?? "no-repeat",
            options.sidebarSize ?? "cover",
            options.sidebarOpacity ?? 0.9,
            options.sidebarBlur ?? 0
        ],
        [
            pI,
            pS,
            options.panelPosition ?? "center center",
            options.panelRepeat ?? "no-repeat",
            options.panelSize ?? "cover",
            options.panelOpacity ?? 0.9,
            options.panelBlur ?? 0
        ],
    ]){
        if(images.length > 0){
            global.appendChild(document.createTextNode(`
                ${selectors.join(',')} {

                    background-position: ${position};
                    background-repeat: ${repeat};
                    background-size: ${size};

                    opacity: ${round(opacity, 2)};

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
        };
    };

    const set = (element, image, indexes, selectors) => {
        while(element.firstChild){
            element.removeChild(element.firstChild);
        };

        if(image.length > 0){
            shuffle(indexes);

            element.appendChild(document.createTextNode(`
                ${selectors.join(',')} {

                    background-image: url(${image[indexes[0]]});

                }
            `));
        }
    };

    const wIE = createCSS(`${identifier}-w`);
    const eIE = createCSS(`${identifier}-e`);
    const sIE = createCSS(`${identifier}-s`);
    const pIE = createCSS(`${identifier}-p`);

    const setW = () => set(wIE, wI, wC, wS);
    const setE = () => set(eIE, eI, eC, eS);
    const setS = () => set(sIE, sI, sC, sS);
    const setP = () => set(pIE, pI, pC, pS);

    // install

    const head = document.querySelector("head");

    const user = createCSS(`${identifier}-user`, "TODO");

    head.appendChild(user);
    head.appendChild(global);
    head.appendChild(wIE);
    head.appendChild(eIE);
    head.appendChild(sIE);
    head.appendChild(pIE);

    for(const arr of [wC, eC, sC, pC]){
        shuffle(arr);
    };

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