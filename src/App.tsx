import "./App.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDebouncedEffect } from "./debounce";
import GridExample from "./GridExample";
import { Grid, GridCellProps } from "react-virtualized";

import Editor from "@monaco-editor/react";
import { Cell } from "./model/Cell";
import { Sheet } from "./model/Sheet";
import { CellElem } from "./CellElem";
import useClientSize from "./useClientSize";

const SIZE = 1000;
const defaultSheet = Sheet.ofDimensions(SIZE, SIZE)
  .set(0, 0, '<input type="range"/>')
  .set(0, 1, '"cool"')
  .set(1, 0, "CELL[0][0]()");

function App() {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [sheet, setSheet] = useState(defaultSheet);
  const editorRef = useRef<null | any>(null);
  // The editor value gets commited periodically to the cell for evaluation
  const [editorValue, setEditorValue] = useState("");

  useEffect(
    function selectionChanged() {
      const editor = editorRef.current;
      if (editor == null) {
        return;
      }
      editor.focus();
    },
    [selectedCell]
  );

  function commitEditorValue() {
    if (!selectedCell) return;
    setSheet(sheet.set(selectedCell.row, selectedCell.col, editorValue || ""));
  }

  const onEditorChanged = function (value: string | undefined) {
    if (!selectedCell || value == null) return;
    setEditorValue(value);
    // TODO debounce
    commitEditorValue();
  };

  const onCellClick = useCallback(
    (clickedCell: any) => {
      // if (clickedCell === selectedCell) {
      //   return;
      // } else {
      setSelectedCell(clickedCell);
      setEditorValue(clickedCell.strValue);
      // }
    },
    []
    // [selectedCell]
  );

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
    [onCellClick, selectedCell, sheet]
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
    [sheet]
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
    [sheet]
  );

  const [windowWidth, windowHeight] = useClientSize();

  // TODO:
  // - edit col/row sizes
  // - col/row labels
  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
      <GridExample
        renderCell={renderCell}
        colCount={sheet.numCols()}
        rowCount={sheet.numRows()}
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
