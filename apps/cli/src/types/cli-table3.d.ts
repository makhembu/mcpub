declare module 'cli-table3' {
  interface TableConstructorOptions {
    head?: string[];
    colWidths?: number[];
    style?: Record<string, any>;
    chars?: Record<string, string>;
  }
  class Table {
    constructor(options?: TableConstructorOptions);
    push(...rows: any[]): void;
    toString(): string;
  }
  export = Table;
}
