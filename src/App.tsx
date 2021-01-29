import "./App.css";
import { useState } from "react";

import Editor from "@monaco-editor/react";
import { Cell } from "./model/Cell";
import { Sheet } from "./model/Sheet";
import { CellElem } from "./CellElem";

const SIZE = 2;
const defaultSheet = Sheet.ofDimensions(SIZE, SIZE)
  .set(0, 0, '<input type="range"/>')
  .set(0, 1, '"cool"')
  .set(1, 0, "CELL[0][0]()");

function App() {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [sheet, setSheet] = useState(defaultSheet);

  return (
    <div className="App">
      <div className="spreadsheet">
        {sheet.map((cell) => (
          <CellElem
            key={cell.row * SIZE + cell.col}
            cell={cell}
            onClick={setSelectedCell}
            selected={selectedCell === cell}
          />
        ))}
      </div>
      <div className="sidebar">
        {selectedCell && (
          <>
            <pre>
              const CELL[{selectedCell.row}][{selectedCell.col}] ={" "}
            </pre>
            <Editor
              height="90vh"
              language="javascript"
              onChange={(value) => {
                if (!selectedCell) return;
                setSheet(
                  sheet.set(selectedCell.row, selectedCell.col, value || "")
                );
              }}
              value={selectedCell ? selectedCell.strValue : "// some comment"}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
