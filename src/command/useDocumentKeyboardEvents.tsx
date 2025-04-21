import { useEffect } from "react";
import { Sheet } from "../model/Sheet";
import { documentCommands } from "./documentCommands";

export function useDocumentKeyboardEvents(project: Sheet): void {
  useEffect(() => {
    function keydownEvent(e: KeyboardEvent) {
      // console.log("Doc keydown", e.code);
      // TODO: also, on top of of doing this to prevent keyboard events when typing on forms
      // make the UI modal so events don't happen when modal dialogs are open for example
      if (e.target instanceof HTMLInputElement) {
        return;
      }

      const executed = documentCommands.execByKeyboardEvent(e, project);
      if (executed) {
        // console.log("Executed comand!");
        return;
      }
    }

    function keyupEvent(_e: KeyboardEvent) {}

    function keypressEvent(e: KeyboardEvent) {
      // TODO: also, on top of of doing this to prevent keyboard events when typing on forms
      // make the UI modal so events don't happen when modal dialogs are open for example
      if (e.target instanceof HTMLInputElement) {
        return;
      }
    }

    document.addEventListener("keydown", keydownEvent);
    document.addEventListener("keypress", keypressEvent);
    document.addEventListener("keyup", keyupEvent);
    return function () {
      document.removeEventListener("keydown", keydownEvent);
      document.removeEventListener("keypress", keypressEvent);
      document.removeEventListener("keyup", keyupEvent);
    };
  }, [project]);
}
