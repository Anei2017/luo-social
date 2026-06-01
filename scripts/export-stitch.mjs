/**
 * Export screens from a Stitch project into .stitch-export/
 * Usage: STITCH_API_KEY=... node scripts/export-stitch.mjs [projectId]
 */
import { stitch } from "@google/stitch-sdk";
import fs from "fs";
import path from "path";

const projectId = process.argv[2] ?? "9486157200915130447";
const outDir = path.join(process.cwd(), ".stitch-export");

const project = stitch.project(projectId);
const gp = await stitch.callTool("get_project", { name: projectId });
console.log("Project:", gp.title ?? projectId);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "project.json"),
  JSON.stringify(
    {
      projectId,
      title: gp.title,
      designTheme: gp.designTheme,
      screenInstances: gp.screenInstances,
    },
    null,
    2,
  ),
);

const screens = await project.screens();
for (let i = 0; i < screens.length; i++) {
  const s = screens[i];
  const id = s.screenId ?? s.id;
  const htmlUrl = await s.getHtml();
  const res = await fetch(htmlUrl);
  const html = await res.text();
  const file = path.join(outDir, `screen-${i}-${id}.html`);
  fs.writeFileSync(file, html);
  console.log("Wrote", file);
}

console.log("Done.");
