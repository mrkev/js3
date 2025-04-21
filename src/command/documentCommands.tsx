import { CommandBlock } from "./Command";

export const documentCommands = CommandBlock.create(["Project", "Edit", "Tools", "Playback"] as const, (command) => {
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
  };
});
