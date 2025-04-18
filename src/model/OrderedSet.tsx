import { JSONOfAuto, ReplaceFunctions, set, SSet, Structured } from "structured-state";
import { EmptyObj } from "../utils/types";

export class OrderedSet<T> extends Structured<EmptyObj, typeof OrderedSet> {
  // Structured
  override replace(): void {}
  override autoSimplify(): EmptyObj {
    return {};
  }
  static construct() {
    return Structured.create(OrderedSet);
  }
  private readonly _order: Array<T>;
  constructor(private readonly _set: SSet<T> = set()) {
    super();
    this._order = Array.from(_set.values());
  }

  push(value: T): this {
    if (this._set.has(value)) {
      return this;
    }
    this._set.add(value);
    this._order.push(value);
    return this;
  }

  pop() {
    const value = this._order.pop();
    if (value) {
      this._set.delete(value);
    }
    return value;
  }

  clear(): void {
    this._set.clear();
    this._order.splice(0, this._order.length);
  }
}
