import { FloatingPanel } from "@/components/floating-panel";
import "@csstools/normalize.css";
import { useEffect, useState } from "react";
import { useContainer, usePrimitive } from "structured-state";
import "./App.css";
import { useDocumentKeyboardEvents } from "./command/useDocumentKeyboardEvents";
import { Cell } from "./model/Cell";
import { evaluateCell } from "./model/Evaluator";
import { Sheet } from "./model/Sheet";
import { SpreadsheetGrid } from "./SpreadsheetGrid";
import useClientSize from "./useClientSize";

export const SIZE = 100;

export function App() {
  const [sheet] = useState(() =>
    Sheet.ofDimensions(SIZE, SIZE)
      .set(0, 0, '<input type="range"/>', true)
      .set(0, 1, '"cool"', true)
      .set(1, 0, "CELL[0][0]()", true),
  );

  const [selectedCell, setSelectedCell] = usePrimitive<Cell>(sheet.selectedCell);
  useDocumentKeyboardEvents(sheet);

  useContainer(sheet);

  useEffect(() => {
    // for any initial .sets, note this also renders right now but might
    // be good to separate evaluation and rendering perhaps
    sheet.flushEvalQueue();
  }, [sheet]);

  const [windowWidth, windowHeight] = useClientSize();

  // TODO:
  // - edit col/row sizes
  return (
    <>
      <SpreadsheetGrid sheet={sheet} width={windowWidth} height={windowHeight} />
      <FloatingPanel
        sheet={sheet}
        onEditorChange={(value) => {
          if (value == null) return;
          selectedCell.strValue.set(value);
          evaluateCell(selectedCell, sheet);
          selectedCell.render();
        }}
      />

      {/* <Sidebar
        sheet={sheet}
        onEditorChange={(value) => {
          if (value == null) return;
          selectedCell.strValue.set(value);
          evaluateCell(selectedCell, sheet);
          selectedCell.render();
        }}
      /> */}
    </>
  );
}
