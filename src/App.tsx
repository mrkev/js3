import "@csstools/normalize.css";
import { useCallback, useEffect, useState } from "react";
import { GridCellProps } from "react-virtualized";
import { useContainer, usePrimitive } from "structured-state";
import "./App.css";
import { CellElem } from "./CellElem";
import { Cell } from "./model/Cell";
import { evaluateCell } from "./model/Evaluator";
import { Sheet } from "./model/Sheet";
import { Sidebar } from "./Sidebar";
import { SpreadsheetGrid } from "./SpreadsheetGrid";
import useClientSize from "./useClientSize";
import { FloatingPanel } from "@/components/floating-panel";
import { useDocumentKeyboardEvents } from "./command/useDocumentKeyboardEvents";

const SIZE = 100;

export function App() {
  const [sheet] = useState(() =>
    Sheet.ofDimensions(SIZE, SIZE)
      .set(0, 0, '<input type="range"/>', true)
      .set(0, 1, '"cool"', true)
      .set(1, 0, "CELL[0][0]()", true),
  );

  const [selectedCell, setSelectedCell] = usePrimitive<Cell | null>(sheet.selectedCell);
  useDocumentKeyboardEvents(sheet);

  useContainer(sheet);

  useEffect(() => {
    // for any initial .sets, note this also renders right now but might
    // be good to separate evaluation and rendering perhaps
    sheet.flushEvalQueue();
  }, [sheet]);

  const onCellClick = useCallback((clickedCell: Cell) => {
    setSelectedCell(clickedCell);
  }, []);

  const renderCell = useCallback(
    function renderCell({ columnIndex, key, rowIndex, style }: GridCellProps) {
      const cell = sheet.get(rowIndex, columnIndex);
      if (!cell) {
        return <div>This shouldn't happen</div>;
      }

      return (
        <CellElem
          style={style}
          key={cell.row * SIZE + cell.col}
          cell={cell}
          onClick={onCellClick}
          selected={selectedCell === cell}
        />
      );
    },
    [onCellClick, selectedCell, sheet],
  );

  const [windowWidth, windowHeight] = useClientSize();

  // TODO:
  // - edit col/row sizes
  return (
    <>
      <SpreadsheetGrid sheet={sheet} renderCell={renderCell} width={windowWidth} height={windowHeight} />
      <FloatingPanel />
      {selectedCell && (
        <Sidebar
          sheet={sheet}
          onEditorChange={(value) => {
            if (value == null) return;
            selectedCell.strValue.set(value);
            evaluateCell(selectedCell, sheet);
            selectedCell.render();
          }}
        />
      )}
    </>
  );
}
