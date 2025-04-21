export type CellID = `r:${number}-c:${number}`;

export function cellID(row: number, col: number): CellID {
  return `r:${row}-c:${col}`;
}

const ID_REGEX = /^r:(\d+)-c:(\d+)$/gm;

export function posOfId(id: CellID) {
  const result = ID_REGEX.exec(id);
  if (result == null) {
    throw new Error("recieved non-id " + id);
  }
  const [, row, col] = result;
  return { row: ensureInt(row), col: ensureInt(col) };
}

export function ensureInt(val: unknown): number {
  if (typeof val === "number") {
    return val;
  }
  if (typeof val !== "string") {
    throw new Error(`can't convert ${val} to number`);
  }
  const num = parseInt(val);
  if (Number.isNaN(num)) {
    throw new Error(`can't convert non-number string ${val} to number`);
  }
  return num;
}
