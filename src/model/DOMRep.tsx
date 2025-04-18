import { Primitive } from "./Cell";

/** a dom element represented in a cell */
export class DOMRep {
  type: "input";
  attrs: { [key: string]: string };
  domRep: HTMLInputElement;

  set onChange(cb: (e: Event) => void) {
    // todo, remove event listener
    this.domRep.addEventListener("change", cb);
  }

  constructor(type: "input", attrs: { [key: string]: string }) {
    this.type = type;
    this.attrs = attrs;

    // Create the element
    this.domRep = document.createElement(this.type);
    // todo: remove event listener
    this.domRep.addEventListener("click", function (e) {
      // e.preventDefault();
      e.stopPropagation();
    });
    for (let key in this.attrs) {
      this.domRep.setAttribute(key, this.attrs[key]);
    }
  }

  getDOM() {
    return this.domRep;
  }

  getPrimitiveValue(): Primitive {
    switch (this.attrs.type) {
      case "range":
        return parseInt(this.domRep.value);
      default:
        return this.domRep.value;
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
