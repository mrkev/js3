import Editor from "@monaco-editor/react";
import { useRef } from "react";
import { usePrimitive } from "structured-state";
import { Sheet } from "./model/Sheet";

export function Sidebar({
  sheet,
  onEditorChange,
}: {
  sheet: Sheet;
  // selectedCell: Cell;
  onEditorChange: (value: string | undefined) => void;
}) {
  const [selectedCell] = usePrimitive(sheet.selectedCell);
  const [editorValue] = usePrimitive(selectedCell.strValue);

  const editorRef = useRef<null | any>(null);

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
