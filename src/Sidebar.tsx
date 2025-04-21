import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import "./App.css";
import { Cell } from "./model/Cell";

export function Sidebar({
  selectedCell,
  onEditorChange,
  editorValue,
}: {
  selectedCell: Cell;
  onEditorChange: (value: string | undefined) => void;
  editorValue: string | undefined;
}) {
  const editorRef = useRef<null | any>(null);
  useEffect(() => {
    editorRef.current?.focus();
  }, [selectedCell]);

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
