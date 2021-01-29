export const cx = (...styles: Array<string | boolean>) =>
  styles.filter(Boolean).join(" ");
