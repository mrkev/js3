import { useCallback, useEffect, useRef, useState } from "react";
import { GridCellProps } from "react-virtualized";
import { useContainer } from "structured-state";
import "./App.css";
import { CellElem } from "./CellElem";
import GridExample from "./GridExample";
import { Cell } from "./model/Cell";
import { evaluateCell } from "./model/Evaluator";
import { Sheet } from "./model/Sheet";
import { Sidebar } from "./Sidebar";
import useClientSize from "./useClientSize";

const SIZE = 100;

export function App() {
  const [sheet] = useState(() =>
    Sheet.ofDimensions(SIZE, SIZE)
      .set(0, 0, '<input type="range"/>', true)
      .set(0, 1, '"cool"', true)
      .set(1, 0, "CELL[0][0]()", true),
  );

  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  // The editor value gets commited periodically to the cell for evaluation

  useContainer(sheet);

  useEffect(() => {
    // for any initial .sets, note this also renders right now but might
    // be good to separate evaluation and rendering perhaps
    sheet.flushEvalQueue();
  }, [sheet]);

  const onEditorChanged = function (value: string | undefined) {
    if (!selectedCell || value == null) return;
    setEditorValue(value);
    selectedCell.setStrValue(value);
    evaluateCell(selectedCell, sheet);
    selectedCell.render();
  };

  const editorRef = useRef<null | any>(null);
  const [editorValue, setEditorValue] = useState("");
  const onCellClick = useCallback((clickedCell: Cell) => {
    setSelectedCell(clickedCell);
    editorRef.current?.focus();
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

  const getRowHeight = useCallback(
    function getRowHeight(index: any) {
      const explicitHeight = sheet.getExplicitRowHeight(index);
      if (explicitHeight === null) {
        return 40;
      } else {
        return explicitHeight;
      }
    },
    [sheet],
  );
  const getColWidth = useCallback(
    function getColWidth(index: number) {
      const explicitWidth = sheet.getExplicitColWidth(index);
      if (explicitWidth === null) {
        return 150;
      } else {
        return explicitWidth;
      }
    },
    [sheet],
  );

  const [windowWidth, windowHeight] = useClientSize();

  // TODO:
  // - edit col/row sizes
  // - col/row labels
  return (
    <>
      <GridExample
        renderCell={renderCell}
        colCount={sheet.cols}
        rowCount={sheet.rows}
        getRowHeight={getRowHeight}
        getColWidth={getColWidth}
        width={windowWidth}
        height={windowHeight}
      />
      {selectedCell && (
        <Sidebar
          selectedCell={selectedCell}
          onEditorChange={onEditorChanged}
          editorValue={editorValue}
          onEditorMount={function handleEditorDidMount(editor, monaco) {
            editorRef.current = editor;
            editor.focus();
            const model = editor.getModel();
            if (!model) {
              return;
            }
            const lastLineIndex = model.getLineCount();
            editor.setPosition({
              column: model.getLineMaxColumn(lastLineIndex),
              lineNumber: lastLineIndex,
            });
          }}
        />
      )}
    </>
  );
}
