/* Copyright (C) 2024 Katsute <https://github.com/Katsute> */

(async () => {

    const identifier = "bkx";

    // save & load

    const load = (options) => {
        for(const type of ["window", "editor", "sidebar", "panel"]){
            const key = type.charAt(0);

            // TODO: load images

            for(const option of ["Position", "PositionManual", "Repeat", "Size", "Opacity", "Blur", "Time"]){
                if(options[`${key}${option}`])
                    document.querySelector(`#${identifier}-${key}${option}`).value = options[`${key}${option}`];
            }
        };

        document.querySelector(`#${identifier}-renderContentAboveBackground`).checked = options.renderContentAboveBackground ?? false;
        document.querySelector(`#${identifier}-smoothImageRendering`).checked = options.smoothImageRendering ?? false;

        document.querySelector(`#${identifier}-css`).value = options.css ?? '';

        for(const option of document.querySelectorAll("option[value='custom']")){
            const input = option.parentElement;
            input.nextElementSibling.disabled = input.value !== "custom";
        };
    };

    const save = async (options) => {
        await chrome.storage.sync.set(options);
    };

    const reset = async () => await chrome.storage.sync.clear();

    load(await chrome.storage.sync.get() ?? {});

    // change observer

    for(const input of document.querySelectorAll(["input", "select", "textarea"])){
        input.addEventListener("change", () => {
            const options = {
                renderContentAboveBackground: document.querySelector(`#${identifier}-renderContentAboveBackground`).checked,
                smoothImageRendering: document.querySelector(`#${identifier}-smoothImageRendering`).checked,
                css: document.querySelector(`#${identifier}-css`).value
            }

            for(const type of ["window", "editor", "sidebar", "panel"]){
                const key = type.charAt(0);

                // TODO: save images

                for(const option of ["Position", "PositionManual", "Repeat", "Size", "Opacity", "Blur", "Time"]){
                    options[`${key}${option}`] = document.querySelector(`#${identifier}-${key}${option}`).value;
                }
            };

            save(options);
        });
    };

    for(const option of document.querySelectorAll("option[value='custom']")){
        const input = option.parentElement;
        input.addEventListener("change", () => {
            input.nextElementSibling.disabled = input.value !== "custom";
        });
    };

    // import & export

    document.querySelector(`#${identifier}-import`).addEventListener("click", () => document.querySelector(`#${identifier}-import-container`).click());

    document.querySelector(`#${identifier}-import-container`).addEventListener("change", (e) => {
        if(e.target.files.length === 1){
            const reader = new FileReader();
            reader.onload = (c) => {
                const content = c.target.result;
                const options = JSON.parse(content);
                save(options);
                load(options);
            };
            reader.readAsText(e.target.files[0], "UTF-8");
        }
    });

    document.querySelector(`#${identifier}-export`).addEventListener("click", async () => {
        const container = document.querySelector(`#${identifier}-export-container`);

        container.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(await chrome.storage.sync.get() ?? {}, null, 4))}`);
        container.setAttribute("download", "settings.json");
        container.click();
    });

    document.querySelector(`#${identifier}-reset`).addEventListener("click", () => {
        reset().then(() => {
            load({});
        })
    });
})();