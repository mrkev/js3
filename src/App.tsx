import { useCallback, useEffect, useState } from "react";
import { GridCellProps } from "react-virtualized";
import { useContainer } from "structured-state";
import "./App.css";
import { CellElem } from "./CellElem";

import { Cell } from "./model/Cell";
import { evaluateCell } from "./model/Evaluator";
import { Sheet } from "./model/Sheet";
import { Sidebar } from "./Sidebar";
import useClientSize from "./useClientSize";
import { SpreadsheetGrid } from "./SpreadsheetGrid";

const SIZE = 100;

export function App() {
  const [sheet] = useState(() =>
    Sheet.ofDimensions(SIZE, SIZE)
      .set(0, 0, '<input type="range"/>', true)
      .set(0, 1, '"cool"', true)
      .set(1, 0, "CELL[0][0]()", true),
  );

  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  useContainer(sheet);

  useEffect(() => {
    // for any initial .sets, note this also renders right now but might
    // be good to separate evaluation and rendering perhaps
    sheet.flushEvalQueue();
  }, [sheet]);

  const [editorValue, setEditorValue] = useState("");
  const onCellClick = useCallback((clickedCell: Cell) => {
    setSelectedCell(clickedCell);
    setEditorValue(clickedCell.strValue);
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
  // - col/row labels
  return (
    <>
      <SpreadsheetGrid sheet={sheet} renderCell={renderCell} width={windowWidth} height={windowHeight} />
      {selectedCell && (
        <Sidebar
          selectedCell={selectedCell}
          onEditorChange={(value) => {
            if (value == null) return;
            selectedCell.setStrValue(value);
            evaluateCell(selectedCell, sheet);
            selectedCell.render();
          }}
          editorValue={editorValue}
        />
      )}
    </>
  );
}
