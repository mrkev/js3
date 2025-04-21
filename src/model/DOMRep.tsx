import { Primitive } from "./Cell";

export type InputContent = {
  kind: "input";
  dom: HTMLInputElement;
};

/** a dom element represented in a cell */
export class DOMRep {
  readonly dom: HTMLInputElement;

  set onChange(cb: (e: Event) => void) {
    // todo, remove event listener
    this.dom.addEventListener("change", cb);
  }

  constructor(
    readonly type: "input",
    readonly attrs: { [key: string]: string },
  ) {
    this.attrs = attrs;
    const { className, ...rest } = attrs;

    // Create the element
    this.dom = document.createElement(this.type);
    this.dom.className = "cellInput " + className;
    // todo: remove event listener

    // this.dom.oninput = function (e) {
    //   console.log("input");
    // };

    this.dom.addEventListener("click", function (e) {
      // e.preventDefault();
      e.stopPropagation();
    });
    for (let [key, value] of Object.entries(rest)) {
      this.dom.setAttribute(key, value);
    }
  }

  getPrimitiveValue(): Primitive {
    switch (this.attrs.type) {
      case "range":
        return parseInt(this.dom.value);
      default:
        return this.dom.value;
    }
  }

  static createElement(type: any, attrs: null | Object, ...children: Array<any>) {
    if (children.length > 0) {
      throw new Error("Child elements are not supported");
    }

    if (typeof type !== "string") {
      throw new Error("Non-html elements are not supported");
    }

    if (type !== "input") {
      throw new Error("Only input elements are supported");
    }
    const attributes = attrs || {};
    return new DOMRep(type, attributes as any);
  }
}
