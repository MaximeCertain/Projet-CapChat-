declare namespace out {
  interface Writer {
    write(text: string, extra?: any): void;
  }

  interface OutApi {
    (text: string, ...values: any): void;
    error(text: string, ...values: any): void;
    to(writers: Writer[] | null): void;
  }
}

declare var out: out.OutApi;
export = out;
