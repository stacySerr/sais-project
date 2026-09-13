#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const PAGES = path.join(SRC, "pages");
const INCLUDES = path.join(SRC, "includes");
const DATA = path.join(SRC, "data", "site.json");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function walk(dir) {
  return fs.readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return fs.statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function parsePage(raw) {
  if (!raw.startsWith("---")) {
    return { data: {}, content: raw };
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, content: raw };
  const fm = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).replace(/^\n/, "");
  const data = {};
  for (const line of fm.split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, content };
}

function render(template, vars) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) =>
    vars[key] == null ? "" : String(vars[key])
  );
}

function navHtml(site, current) {
  return site.nav
    .map((item) => {
      const currentAttr =
        item.href === current ? ' aria-current="page"' : "";
      return `<a href="${item.href}"${currentAttr}>${item.label}</a>`;
    })
    .join("\n        ");
}

function outPath(permalink) {
  const clean = permalink.endsWith("/") ? permalink.slice(0, -1) : permalink;
  if (!clean || clean === "/") return path.join(DIST, "index.html");
  return path.join(DIST, clean.replace(/^\//, ""), "index.html");
}

function main() {
  const site = JSON.parse(read(DATA));
  const layout = read(path.join(INCLUDES, "layout.html"));
  rmrf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  const pages = walk(PAGES).filter((f) => f.endsWith(".html"));
  for (const file of pages) {
    const { data, content } = parsePage(read(file));
    const permalink = data.permalink || "/";
    const pageTitle =
      permalink === "/"
        ? site.name
        : `${data.title || site.shortName} · ${site.name}`;
    const html = render(layout, {
      title: pageTitle,
      description: data.description || site.description,
      nav: navHtml(site, permalink),
      content,
    });
    const dest = outPath(permalink);
    write(dest, html);
    console.log("wrote", path.relative(DIST, dest));
  }

  const cssSrc = path.join(SRC, "styles.css");
  write(path.join(DIST, "styles.css"), read(cssSrc));
  console.log("wrote styles.css");
  console.log(`built ${pages.length} pages → dist/`);
}

main();
