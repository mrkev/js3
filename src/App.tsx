import "./App.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDebouncedEffect } from "./debounce";
import GridExample from "./GridExample";

import Editor from "@monaco-editor/react";
import { Cell } from "./model/Cell";
import { Sheet } from "./model/Sheet";
import { CellElem } from "./CellElem";

const SIZE = 1000;
const defaultSheet = Sheet.ofDimensions(SIZE, SIZE)
  .set(0, 0, '<input type="range"/>')
  .set(0, 1, '"cool"')
  .set(1, 0, "CELL[0][0]()");

function _getDatum(index: number) {
  return { name: "laksjf", size: 100, random: 1, color: "red" };
}

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
  // TODO:
  // - edit col/row sizes
  // - col/row labels
  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
      <GridExample
        renderCell={function renderCell({ columnIndex, key, rowIndex, style }) {
          const datum = _getDatum(rowIndex);
          const cell = sheet.get(rowIndex, columnIndex);
          if (!cell) {
            return <div>This shouldn't happen</div>;
          }

          return (
            <CellElem
              style={style}
              key={cell.row * SIZE + cell.col}
              cell={cell}
              onClick={(clickedCell) => {
                if (clickedCell === selectedCell) {
                  return;
                } else {
                  setSelectedCell(cell);
                  setEditorValue(clickedCell.strValue);
                }
              }}
              selected={selectedCell === cell}
            />
          );
        }}
        colCount={sheet.numCols()}
        rowCount={sheet.numRows()}
        getRowHeight={function (index) {
          const explicitHeight = sheet.getExplicitRowHeight(index);
          if (explicitHeight === null) {
            return 40;
          } else {
            return explicitHeight;
          }
        }}
        getColWidth={function _getColumnWidth(index: number) {
          const explicitWidth = sheet.getExplicitColWidth(index);
          if (explicitWidth === null) {
            return 150;
          } else {
            return explicitWidth;
          }
        }}
      />
      {/* <div className="spreadsheet" style={{ flexGrow: 1 }}>
        {sheet.map((cell) => (
          <CellElem
            key={cell.row * SIZE + cell.col}
            cell={cell}
            onClick={(clickedCell) => {
              if (clickedCell === selectedCell) {
                return;
              } else {
                setSelectedCell(cell);
                setEditorValue(clickedCell.strValue);
              }
            }}
            selected={selectedCell === cell}
          />
        ))}
      </div> */}
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
                const lastLineIndex = editor.getModel().getLineCount();
                editor.setPosition({
                  column: editor.getModel().getLineMaxColumn(lastLineIndex),
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
