import { exhaustive } from "../exhaustive";
import { Sheet } from "../model/Sheet";
import { CommandBlock } from "./Command";

export const documentCommands = CommandBlock.create(["Project", "Selection"] as const, (command) => {
  return {
    newProject: command(["KeyN", "alt", "meta"], async (e, project) => {
      e?.preventDefault();
      e?.stopPropagation();
      alert("FOO");
      // const didClose = await closeProject(project);
      // if (!didClose) {
      //   return;
      // }
      // await ProjectPersistance.openEmptyProject();
    })
      .helptext("New Project")
      .section("Project"),

    save: command(["KeyS", "meta"], async (e, project) => {
      e?.preventDefault();
      e?.stopPropagation();
      alert("BAR");
      // return ProjectPersistance.doSave(project);
    })
      .helptext("Save")
      .section("Project"),

    // Format
    bold: command(["KeyB", "meta"], async (e, project) => {
      e?.preventDefault();
      e?.stopPropagation();
      alert("BOLD");
      // return ProjectPersistance.doSave(project);
    })
      .helptext("Save")
      .section("Project"),

    selectDown: command(["ArrowDown"], async (e, sheet) => {
      e?.preventDefault();
      e?.stopPropagation();
      selectMove("down", sheet);
    }).section("Selection"),

    selectUp: command(["ArrowUp"], async (e, sheet) => {
      e?.preventDefault();
      e?.stopPropagation();
      selectMove("up", sheet);
      // return ProjectPersistance.doSave(project);
    }).section("Selection"),

    selectLeft: command(["ArrowLeft"], async (e, sheet) => {
      e?.preventDefault();
      e?.stopPropagation();
      selectMove("left", sheet);
      // return ProjectPersistance.doSave(project);
    }).section("Selection"),

    selectRight: command(["ArrowRight"], async (e, sheet) => {
      e?.preventDefault();
      e?.stopPropagation();
      selectMove("right", sheet);
      // return ProjectPersistance.doSave(project);
    }).section("Selection"),
  };
});

function selectMove(dir: "down" | "up" | "left" | "right", sheet: Sheet) {
  const sel = sheet.selectedCell.get();
  if (sel == null) {
    return;
  }

  let newRow = sel.row;
  let newCol = sel.col;
  switch (dir) {
    case "down":
      newRow += 1;
      break;
    case "up":
      newRow -= 1;
      break;
    case "left":
      newCol -= 1;
      break;
    case "right":
      newCol += 1;
      break;
    default:
      throw exhaustive(dir);
  }
  if (newRow >= sheet.rows || newRow < 0 || newCol >= sheet.cols || newCol < 0) {
    return;
  }

  const newCell = sheet.get(newRow, newCol);
  sheet.selectedCell.set(newCell);
}
