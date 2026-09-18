export const SETTINGS_KEY = 'myeongnyang.settings.v1';

export const DEFAULTS = Object.freeze({ master: 0.8, sfx: 1, bgm: 1 });

function clean(key, v) {
  const x = Number(v);
  if (!Number.isFinite(x)) return DEFAULTS[key];
  return Math.min(1, Math.max(0, x));
}

function safeStore(store) {
  return {
    read() {
      try {
        return store ? store.getItem(SETTINGS_KEY) : null;
      } catch {
        return null;
      }
    },
    write(text) {
      try {
        if (store) store.setItem(SETTINGS_KEY, text);
      } catch {

      }
    },
  };
}

export function createSettings(store = defaultStore()) {
  const io = safeStore(store);
  const values = { ...DEFAULTS };

  const text = io.read();
  if (text) {
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const key of Object.keys(DEFAULTS)) {
        if (key in parsed) values[key] = clean(key, parsed[key]);
      }
    }
  }

  const persist = () => io.write(JSON.stringify(values));

  return {
    get(key) {
      return values[key];
    },

    all() {
      return { ...values };
    },

    set(key, v) {
      if (!(key in DEFAULTS)) throw new Error(`알 수 없는 설정: ${key}`);
      values[key] = clean(key, v);
      persist();
      return values[key];
    },
  };
}

function defaultStore() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}
