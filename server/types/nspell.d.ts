declare module 'nspell' {
  interface NSpellInstance {
    correct: (word: string) => boolean;
    suggest: (word: string) => string[];
    add: (word: string) => void;
  }

  function nspell(dictionary: any): NSpellInstance;
  export = nspell;
}

declare module 'dictionary-en' {
  function en(callback: (err: Error | null, result: any) => void): void;
  export = en;
}

declare module 'dictionary-es' {
  function es(callback: (err: Error | null, result: any) => void): void;
  export = es;
}