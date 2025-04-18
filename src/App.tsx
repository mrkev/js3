import Editor from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GridCellProps } from "react-virtualized";
import { useContainer } from "structured-state";
import "./App.css";
import { CellElem } from "./CellElem";
import GridExample from "./GridExample";
import { Cell } from "./model/Cell";
import { evaluateCell } from "./model/Evaluator";
import { Sheet } from "./model/Sheet";
import useClientSize from "./useClientSize";

const SIZE = 100;

function App() {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const editorRef = useRef<null | any>(null);
  // The editor value gets commited periodically to the cell for evaluation
  const [editorValue, setEditorValue] = useState("");
  const [sheet] = useState(() =>
    Sheet.ofDimensions(SIZE, SIZE)
      .set(0, 0, '<input type="range"/>', true)
      .set(0, 1, '"cool"', true)
      .set(1, 0, "CELL[0][0]()", true),
  );

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
    <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
      <GridExample
        renderCell={renderCell}
        colCount={sheet.cols}
        rowCount={sheet.rows}
        getRowHeight={getRowHeight}
        getColWidth={getColWidth}
        width={windowWidth - 400}
        height={windowHeight}
      />
      <div className="sidebar" style={{ flexGrow: 0, width: 400 }}>
        {selectedCell && (
          <>
            <pre>
              const CELL[{selectedCell.row}][{selectedCell.col}] ={" "}
            </pre>
            <Editor
              onMount={function handleEditorDidMount(editor, monaco) {
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
              height="90vh"
              language="javascript"
              onChange={onEditorChanged}
              value={editorValue}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
