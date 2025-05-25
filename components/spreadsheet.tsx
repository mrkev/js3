import { FloatingPanel } from "@/components/FloatingPanel";

export function Spreadsheet() {
  return (
    <div className="relative min-h-[600px] border rounded-lg p-4 bg-gray-50">
      <div className="grid grid-cols-[repeat(10,minmax(100px,1fr))] auto-rows-[40px] gap-[1px] bg-gray-200">
        {/* Header row with column labels */}
        <div className="bg-gray-100 flex items-center justify-center font-medium"></div>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={`header-${i}`} className="bg-gray-100 flex items-center justify-center font-medium">
            {String.fromCharCode(65 + i)}
          </div>
        ))}

        {/* Row labels and cells */}
        {Array.from({ length: 15 }, (_, row) => (
          <>
            <div key={`row-${row}`} className="bg-gray-100 flex items-center justify-center font-medium">
              {row + 1}
            </div>
            {Array.from({ length: 9 }, (_, col) => (
              <div
                key={`cell-${row}-${col}`}
                className="bg-white border border-gray-100 flex items-center p-1 overflow-hidden"
              ></div>
            ))}
          </>
        ))}
      </div>

      <FloatingPanel />
    </div>
  );
}
