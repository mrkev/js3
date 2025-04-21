import Editor from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { Cell } from "./model/Cell";
import { Sheet } from "./model/Sheet";
import { usePrimitive } from "structured-state";

export function Sidebar({
  sheet,
  onEditorChange,
}: {
  sheet: Sheet;
  // selectedCell: Cell;
  onEditorChange: (value: string | undefined) => void;
}) {
  const [editorValue, setEditorValue] = useState("");
  const [selectedCell] = usePrimitive(sheet.selectedCell);

  const editorRef = useRef<null | any>(null);
  useEffect(() => {
    setEditorValue(selectedCell?.strValue.get() ?? "");
  }, [selectedCell]);

  if (selectedCell == null) {
    return null;
  }

  return (
    <div
      className="sidebar"
      style={{
        display: "flex",
        flexDirection: "column",
        width: 400,
        position: "absolute",
        right: 10,
        top: 10,
        height: 400,
        background: "white",
        border: "1px solid gray",
      }}
    >
      <pre>
        const CELL[{selectedCell.row}][{selectedCell.col}] ={" "}
      </pre>
      <div style={{ flexGrow: 1, flexShrink: 1, overflow: "hidden" }}>
        <Editor
          onMount={function handleEditorDidMount(editor, monaco) {
            editorRef.current = editor;
            // editor.focus();
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
          height="100%"
          language="javascript"
          onChange={onEditorChange}
          value={editorValue}
        />
        <pre>TODO: - resize columns</pre>
      </div>
    </div>
  );
}
