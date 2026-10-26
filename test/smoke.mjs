import assert from 'node:assert/strict';

const clientUrl = new URL('../client.js', import.meta.url);
let loaded;

globalThis.window = {
  __ModuleLoader__: {
    load(definition) {
      loaded = definition;
    },
  },
};

await import(`${clientUrl.href}?smoke=${Date.now()}`);

assert.ok(loaded, 'client module did not call window.__ModuleLoader__.load');
assert.equal(loaded.id, 'dsh-codex-reasoning-slider');

const state = {
  current: { provider: 'test-provider', model: 'test-model', reasoningEffort: 'high' },
  groups: [
    {
      id: 'test-provider',
      name: 'Test Provider',
      models: [
        {
          id: 'test-model',
          name: 'Test Model',
          reasoning: {
            defaultEffort: 'medium',
            efforts: [
              { id: 'off', name: 'Off' },
              { id: 'minimal', name: 'Minimal' },
              { id: 'low', name: 'Low' },
              { id: 'medium', name: 'Medium' },
              { id: 'high', name: 'High' },
              { id: 'max', name: 'Max' },
            ],
          },
        },
      ],
    },
  ],
  failures: [],
  status: 'ready',
  pending: null,
  error: null,
};

const selections = [];
const directory = {
  store: {
    subscribe() {
      return () => {};
    },
    getSnapshot() {
      return state;
    },
  },
  async load() {
    return state;
  },
  async select(selection) {
    selections.push(selection);
    return { ok: true, value: undefined };
  },
};

const models = {
  directoryFor(sessionId) {
    assert.equal(sessionId, 'session-1');
    return directory;
  },
};

let stateIndex = 0;
const portalTarget = { nodeType: 1 };
const stateValues = [directory, portalTarget, null, null, null];
let refIndex = 0;
const refValues = [
  { current: null },
  { current: null },
  { current: { getBoundingClientRect: () => ({ left: 0, width: 100 }) } },
];

const React = {
  createElement(type, props, ...children) {
    return { type, props: props ?? {}, children: children.flat(Infinity) };
  },
  useCallback(fn) {
    return fn;
  },
  useEffect() {},
  useMemo(fn) {
    return fn();
  },
  useRef() {
    return refValues[refIndex++] ?? { current: null };
  },
  useState() {
    return [stateValues[stateIndex++] ?? null, () => {}];
  },
  useSyncExternalStore(_subscribe, getSnapshot) {
    return getSnapshot();
  },
};

const ReactDOM = {
  createPortal(panel, target) {
    assert.equal(target, portalTarget);
    return panel;
  },
};

const plugin = loaded.factory((name) => {
  if (name === 'react') return React;
  if (name === 'react-dom') return ReactDOM;
  throw new Error(`unexpected module: ${name}`);
});

assert.deepEqual(plugin.inject, ['locale', 'slots', 'modelDirectories']);

const registrations = [];
const dictionaries = [];
const effects = [];

const ctx = {
  effect(fn, label) {
    const cleanup = fn();
    effects.push({ label, cleanup });
    return cleanup;
  },
  locale: {
    register(namespace, dicts) {
      dictionaries.push({ namespace, dicts });
      return () => {};
    },
  },
  slots: {
    inject(slotName, callback) {
      assert.equal(slotName, 'conversation.input.left');
      return callback();
    },
    register(options, component) {
      registrations.push({ options, component });
      return () => {};
    },
  },
  modelDirectories: models,
};

plugin.apply(ctx);

assert.equal(dictionaries.length, 1);
assert.equal(dictionaries[0].namespace, 'codex-reasoning-slider');
assert.deepEqual(
  Object.keys(dictionaries[0].dicts.zh).sort(),
  Object.keys(dictionaries[0].dicts.en).sort(),
);
assert.equal(registrations.length, 1);
assert.equal(registrations[0].options.name, 'conversation.input.left');
assert.equal(registrations[0].options.id, 'codex-reasoning-slider');
assert.equal(registrations[0].options.locale, 'codex-reasoning-slider');
assert.equal(typeof registrations[0].component, 'function');
assert.ok(effects.some((entry) => entry.label.includes('dictionaries')));
assert.ok(effects.some((entry) => entry.label.includes('styles')));

function render(node) {
  if (Array.isArray(node)) return node.map(render);
  if (node === null || node === undefined || typeof node !== 'object') return node;
  if (typeof node.type === 'function') return render(node.type(node.props));
  return {
    ...node,
    children: (node.children ?? []).map(render),
  };
}

const tree = render(
  registrations[0].component({
    sessionId: 'session-1',
    models,
    t: (key) => dictionaries[0].dicts.zh[key] ?? key,
  }),
);

function findNode(node, predicate) {
  if (node === null || node === undefined || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  for (const child of node.children ?? []) {
    const found = findNode(child, predicate);
    if (found !== undefined) return found;
  }
  return undefined;
}

const slider = findNode(tree, (node) => node.props?.role === 'slider');
assert.ok(slider, 'slider was not rendered for a reasoning-capable model');
assert.equal(slider.props['aria-valuemin'], 0);
assert.equal(slider.props['aria-valuemax'], 5);
assert.equal(slider.props['aria-valuenow'], 4);
assert.equal(slider.props['aria-valuetext'], 'High');

let prevented = 0;
slider.props.onKeyDown({
  key: 'ArrowRight',
  preventDefault() {
    prevented += 1;
  },
  stopPropagation() {},
});
await Promise.resolve();
assert.equal(prevented, 1);
assert.deepEqual(selections[0], {
  provider: 'test-provider',
  model: 'test-model',
  reasoningEffort: 'max',
});

console.log('client-module-smoke-ok');
