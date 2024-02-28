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

const fs = require("fs");
const path = require("path");

const AdmZip = require("adm-zip");

const src  = path.join(__dirname, "src");
const dist = path.join(__dirname, "dist");

const ext  = path.join(__dirname, "extension.zip");

/* clear dist */ {
    if(fs.existsSync(dist))
        fs.rmSync(dist, {recursive: true});
    fs.mkdirSync(dist);

    !fs.existsSync(ext) || fs.rmSync(ext, {recursive: true});
}

/* copy src to zip */ {
    for(const file of fs.readdirSync(src))
        fs.copyFileSync(path.join(src, file), path.join(dist, file));
}

/* minify */ {
    for(const file of ["options.css", "options.js", "index.js", "style.css"])
        fs.writeFileSync(path.join(dist, file), fs.readFileSync(path.join(dist, file), "utf-8")
            .replace(/(?<!^)\/\*.*\*\//g, '') // /* comments (except first copyright)
            .replace(/ \/\/.*$/gm,'') // // comments
            .replace(/ +/gm, ' ') // extra spaces
            .replace(/^ +/gm, '') // leading space
            .replace(/\r?\n/gm, '') // new line
            .trim());
    for(const file of ["options.html"])
        fs.writeFileSync(path.join(dist, file), fs.readFileSync(path.join(dist, file), "utf-8")
            .replace(/ +/gm, ' ') // extra spaces
            .replace(/^ +/gm, '') // leading space
            .replace(/\r?\n/gm, '') // new line
            .trim());
}

const zip = new AdmZip();

zip.addLocalFolderPromise(dist)
   .then(() => zip.writeZip(ext))
   .then(() => fs.rmSync(dist, {recursive: true}));