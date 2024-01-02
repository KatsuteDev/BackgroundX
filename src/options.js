/* Copyright (C) 2024 Katsute <https://github.com/Katsute> */

(async () => {

    const identifier = "bkx";

    // functions

    const $ = document.querySelector;
    const $$ = document.querySelectorAll;

    // save & load

    const load = (options) => {
        for(const type of ["window", "editor", "sidebar", "panel"]){
            // TODO: load setting into HTML

            // TODO: default & fallback values
        };

        $(`${identifier}-wA`).checked = options.renderContentAboveBackground;
        $(`${identifier}-si`).checked = options.smoothImageRendering;

        $(`${identifier}-css`).value = options.css;
    };

    const save = async (options) => {
        await chrome.storage.sync.set(options);
    };

    // change observer

    for(const input of $$(["input", "select", "textarea"])){
        input.addEventListener("change", () => {
            save({
                // TODO
            });
        });
    };

    for(const option of $$("option[value='custom']")){
        const input = option.parentElement;
        input.addEventListener("change", () => {
            input.nextSibling.disabled = input.value !== "custom";
        });
    };

    // import & export

    $("#${identifier}-import").addEventListener("click", () => {

    });

    $("#${identifier}-export").addEventListener("click", () => {

    });

    // init

    load(await chrome.storage.sync.get("options"));
})();