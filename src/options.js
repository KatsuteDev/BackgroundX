/* Copyright (C) 2024 Katsute <https://github.com/Katsute> */

(async () => {

    const identifier = "bkx";

    // save & load

    let isLoading = false;

    const load = (options) => {
        try{
            isLoading = true;

            console.groupCollapsed("Loading options");
            console.info(JSON.stringify(options, null, 4));
            console.groupEnd();

            for(const type of ["window", "editor", "sidebar", "panel"]){
                const container = document.querySelector(`#${identifier}-${type}Backgrounds`);

                const add = (url) => {
                    const row = document.createElement("li");

                    const input = document.createElement("input");
                    input.setAttribute("type", "text");
                    input.setAttribute("placeholder", "Background image URL");
                    input.value = url;
                    input.addEventListener("change", () => {
                        saveOptions();
                    });
                    input.addEventListener("focusout", () => {
                        if(container.lastChild !== row && input.value.trim().length === 0){
                            container.removeChild(row);
                        };
                    });
                    input.addEventListener("keyup", () => {
                        if(container.lastChild === row && input.value.trim().length > 0){
                            add('');
                        };
                    });

                    const remove = document.createElement("button");
                    remove.textContent = '×';
                    remove.addEventListener("click", () => {
                        container.removeChild(row);
                        saveOptions();
                    });

                    row.appendChild(input);
                    row.append(remove);
                    container.appendChild(row);
                };

                while(container.firstChild){
                    container.removeChild(container.lastChild);
                };

                if(options[`${type}Backgrounds`]){
                    for(const image of options[`${type}Backgrounds`]){
                        add(image);
                    };
                };

                add('');

                const defaults = {
                    "Position": "center center",
                    "PositionManual": "50%",
                    "Repeat": "no-repeat",
                    "Size": "auto",
                    "SizeManual": "100%",
                    "Opacity": "0.9",
                    "Blur": "0",
                    "Time": 0,
                };

                for(const [option, def] of Object.entries(defaults)){
                    document.querySelector(`#${identifier}-${type}${option}`).value = options[`${type}${option}`] ?? def;
                };
            };

            document.querySelector(`#${identifier}-renderContentAboveBackground`).checked = options.renderContentAboveBackground ?? false;
            document.querySelector(`#${identifier}-smoothImageRendering`).checked = options.smoothImageRendering ?? false;

            document.querySelector(`#${identifier}-css`).value = options.css ?? '';

            for(const option of document.querySelectorAll("option[value='custom']")){
                const input = option.parentElement;
                input.nextElementSibling.disabled = input.value !== "custom";
            };
        }finally{
            isLoading = false;
        };
    };

    const save = async (options) => {
        console.groupCollapsed("Saving options");
        console.info(JSON.stringify(options, null, 4));
        console.groupEnd();

        await (chrome ?? browser).storage.sync.set(options);
    };

    const reset = async () => {
        console.info("Resetting options");
        chrome.storage.sync.clear()
            .then(() => save({}))
            .then(() => load({}));
    };

    // change observer

    const saveOptions = () => {
        if(!isLoading){
            const options = {
                renderContentAboveBackground: document.querySelector(`#${identifier}-renderContentAboveBackground`).checked,
                smoothImageRendering: document.querySelector(`#${identifier}-smoothImageRendering`).checked,
                css: document.querySelector(`#${identifier}-css`).value
            };

            for(const type of ["window", "editor", "sidebar", "panel"]){
                let buf = [];
                for(const input of document.querySelectorAll(`#${identifier}-${type}Backgrounds input`)){
                    if(input.value.trim()){
                        buf.push(input.value.trim());
                    };
                };

                options[`${type}Backgrounds`] = buf;

                for(const option of ["Position", "PositionManual", "Repeat", "Size", "Opacity", "Blur", "Time"]){
                    options[`${type}${option}`] = document.querySelector(`#${identifier}-${type}${option}`).value;
                };
            };

            save(options);
        };
    };

    for(const input of document.querySelectorAll(["input", "select", "textarea"])){
        input.addEventListener("change", saveOptions);
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
                save(options).then(() => load(options));
            };
            reader.readAsText(e.target.files[0], "UTF-8");
        };
    });

    document.querySelector(`#${identifier}-export`).addEventListener("click", async () => {
        const container = document.querySelector(`#${identifier}-export-container`);

        container.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(await (chrome ?? browser).storage.sync.get() ?? {}, null, 4))}`);
        container.setAttribute("download", "settings.json");
        container.click();
    });

    document.querySelector(`#${identifier}-reset`).addEventListener("click", () => {
        reset().then(() => load({}));
    });

    document.querySelector(`#${identifier}-report`).addEventListener("click", async () => {
        window.open(`https://github.com/KatsuteDev/BackgroundX/issues/new?template=bug.yml&settings=${encodeURI("```json\n" + JSON.stringify(await (chrome ?? browser).storage.sync.get() ?? {}, null, 4) + "\n```")}`);
    });

    load(await (chrome ?? browser).storage.sync.get() ?? {});

    console.info("Finished init");
})();