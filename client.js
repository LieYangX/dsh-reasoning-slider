window.__ModuleLoader__.load({
  id: 'dsh-codex-reasoning-slider',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;

    const NS = 'codex-reasoning-slider';
    const STYLE_ID = 'dsh-codex-reasoning-slider/styles';

    const zh = {
      label: '推理等级',
      default: '默认',
      hint: '拖动调整推理等级',
      failed: '切换推理等级失败',
    };

    const en = {
      label: 'Effort',
      default: 'Default',
      hint: 'Drag to change reasoning effort',
      failed: 'Failed to change reasoning effort',
    };

    const EMPTY_STATE = Object.freeze({
      current: null,
      retainedEffort: undefined,
      routable: null,
      groups: [],
      failures: [],
      status: 'idle',
      pending: null,
      error: null,
    });

    const PARTICLE_SEEDS = Array.from({ length: 48 }, (_, index) => {
      const x = 4 + ((index * 37 + 11) % 92);
      const y = 16 + ((index * 53 + 7) % 68);
      const size = 1.2 + ((index * 17) % 4) * 0.6;
      const duration = 2.4 + ((index * 7) % 13) / 10;
      const delay = -((index * 0.31) % 3.2);
      return [x, y, size, duration, delay];
    });

    const CSS = `
.dsh-rs-anchor {
  display: none;
}
.dsh-rs-menu-slot {
  box-sizing: border-box;
  width: 100%;
  padding: 0 4px 6px;
}
.dsh-rs-panel {
  box-sizing: border-box;
  padding: 2px 8px 4px;
  border-radius: var(--dsw-radius-sm, 6px);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 20px;
  user-select: none;
  -webkit-user-select: none;
}
.dsh-rs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 20px;
}
.dsh-rs-title {
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}
.dsh-rs-current {
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-rs-panel[data-error="true"] .dsh-rs-current {
  color: var(--dsw-alias-state-error-primary);
}
.dsh-rs-track {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-width: 180px;
  height: 24px;
  cursor: grab;
  touch-action: none;
  outline: none;
}
.dsh-rs-track:focus-visible {
  box-shadow: 0 0 0 2px var(--dsw-alias-brand-primary);
  border-radius: 999px;
}
.dsh-rs-track[data-busy="true"] {
  cursor: progress;
  opacity: 0.58;
}
.dsh-rs-track[data-dragging="true"] {
  cursor: grabbing;
}
.dsh-rs-rail {
  position: absolute;
  left: 6px;
  right: 6px;
  top: 50%;
  height: 6px;
  overflow: hidden;
  transform: translateY(-50%);
  border-radius: 999px;
  background: var(--dsw-alias-border-l1);
}
.dsh-rs-fill {
  position: relative;
  width: calc(var(--dsh-rs-p, 0) * 100%);
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  background: #4d93f8;
  transition: width 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.dsh-rs-particle {
  position: absolute;
  top: 50%;
  left: -4%;
  width: 3px;
  height: 3px;
  margin-top: -1.5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.88);
  opacity: 0;
  pointer-events: none;
  animation: dsh-rs-particle-flow 2.2s linear infinite;
  animation-delay: var(--dsh-rs-delay, 0s);
  will-change: left, opacity;
}
.dsh-rs-ticks {
  position: absolute;
  left: 6px;
  right: 6px;
  top: 50%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  pointer-events: none;
}
.dsh-rs-tick {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--dsw-alias-label-secondary);
  opacity: 0.34;
}
.dsh-rs-tick[data-active="true"] {
  background: var(--dsw-alias-label-primary);
  opacity: 0.88;
}
.dsh-rs-thumb {
  position: absolute;
  left: calc(6px + (100% - 12px) * var(--dsh-rs-p, 0));
  top: 50%;
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  transform: translate(-50%, -50%);
  border: 2px solid var(--dsw-alias-bg-overlay);
  border-radius: 50%;
  background: #4d93f8;
  transition: left 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.dsh-rs-track[data-max="true"] .dsh-rs-fill {
  background: linear-gradient(90deg, #7c3aed 0%, #a855f7 55%, #d8b4fe 100%);
}
.dsh-rs-track[data-max="true"] .dsh-rs-thumb {
  background: #8b5cf6;
}
.dsh-rs-track[data-max="true"] .dsh-rs-rail {
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.45);
}
.dsh-rs-track[data-max="true"] .dsh-rs-particle {
  background: #f5eaff;
  box-shadow: 0 0 7px rgba(216, 180, 254, 0.95);
}
.dsh-rs-panel[data-max="true"] .dsh-rs-current {
  color: #8b5cf6;
}
.dsh-rs-track[data-dragging="true"] .dsh-rs-fill,
.dsh-rs-track[data-dragging="true"] .dsh-rs-thumb {
  transition: none;
}
@keyframes dsh-rs-particle-flow {
  0% {
    left: -4%;
    opacity: 0;
  }
  18% {
    opacity: 0.92;
  }
  78% {
    opacity: 0.92;
  }
  100% {
    left: 104%;
    opacity: 0;
  }
}
.dsh-rs-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
/* Codex 风格外观：单一推理行、大号白色拨片、蓝紫渐变和星尘粒子。 */
.dsh-rs-menu-slot {
  flex: 0 0 100%;
  order: 10;
  width: 100%;
  padding: 0;
}
.dsh-rs-host-row {
  height: auto !important;
  min-height: 34px;
  margin-top: 8px;
  flex-wrap: wrap !important;
  row-gap: 6px;
  padding: 8px !important;
  border: 1px solid transparent;
  border-radius: 16px;
  background: transparent !important;
  transition: border-color 180ms ease;
}
.dsh-rs-host-row:hover:not(:disabled) {
  background: transparent !important;
}
.dsh-rs-model-switch {
  border-radius: 16px;
}
.dsh-rs-model-switch:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2)) !important;
}
.dsh-rs-host-row[data-dsh-tone="low"] > span:nth-of-type(2) {
  color: #6aa7ff;
}
.dsh-rs-host-row[data-dsh-tone="high"] > span:nth-of-type(2) {
  color: #b69cff;
}
.dsh-rs-host-row[data-dsh-tone="max"] > span:nth-of-type(2) {
  color: transparent;
  background: linear-gradient(90deg, #a855f7 0%, #d8b4fe 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
.dsh-rs-host-row[data-dsh-tone="low"] > svg {
  color: #6aa7ff;
}
.dsh-rs-host-row[data-dsh-tone="high"] > svg {
  color: #b69cff;
}
.dsh-rs-host-row[data-dsh-tone="max"] > svg {
  color: #e9d5ff;
}
.dsh-rs-panel {
  padding: 10px 10px 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.14));
  border-radius: 14px;
  background: var(--dsw-alias-bg-layer-1, #2f2f32);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 20px;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}
.dsh-rs-head {
  min-height: 20px;
  padding: 0 2px 9px;
  align-items: center;
}
.dsh-rs-title {
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-weight: 400;
}
.dsh-rs-current {
  color: var(--dsw-alias-label-tertiary);
  font-size: 13px;
  font-weight: 400;
}
.dsh-rs-host-row[data-dsh-tone="off"] .dsh-rs-current {
  color: var(--dsw-alias-label-primary);
}
.dsh-rs-host-row[data-dsh-tone="low"] .dsh-rs-current {
  color: #6aa7ff;
}
.dsh-rs-host-row[data-dsh-tone="high"] .dsh-rs-current {
  color: #b69cff;
}
.dsh-rs-host-row[data-dsh-tone="max"] .dsh-rs-current {
  color: transparent;
  background: linear-gradient(90deg, #a855f7 0%, #d8b4fe 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
.dsh-rs-panel[data-error="true"] .dsh-rs-current {
  color: var(--dsw-alias-state-error-primary);
}
.dsh-rs-host-row[data-dsh-tone="low"] {
  border-color: rgba(77, 147, 248, 0.55);
}
.dsh-rs-host-row[data-dsh-tone="high"] {
  border-color: rgba(139, 92, 246, 0.68);
}
.dsh-rs-host-row[data-dsh-tone="max"] {
  border-color: rgba(168, 85, 247, 0.9);
}
.dsh-rs-track {
  height: 32px;
  min-width: 0;
  overflow: hidden;
  border-radius: 16px;
  background: var(--dsw-alias-border-l1, #3a3a3e);
  cursor: pointer;
  transition: box-shadow 180ms ease;
}
.dsh-rs-host-row[data-dsh-tone="high"] .dsh-rs-track {
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.36);
}
.dsh-rs-host-row[data-dsh-tone="max"] .dsh-rs-track {
  box-shadow: 0 0 10px 1px rgba(168, 85, 247, 0.44);
}
.dsh-rs-menu-surface {
  width: min(310px, calc(100vw - 32px)) !important;
  min-width: 0 !important;
  max-width: min(310px, calc(100vw - 32px)) !important;
  border-radius: 16px !important;
}
.dsh-rs-track:focus-visible {
  border-radius: 16px;
  box-shadow:
    0 0 0 2px rgba(139, 92, 246, 0.62),
    inset 0 1px 0 rgba(255, 255, 255, 0.035);
}
.dsh-rs-rail {
  inset: 0;
  width: auto;
  height: auto;
  transform: none;
  border-radius: inherit;
  background: transparent;
}
.dsh-rs-fill {
  position: absolute;
  inset: 0;
  width: calc(14px + (100% - 28px) * var(--dsh-rs-p, 0));
  height: auto;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    #4d93f8 0%,
    #4d93f8 40%,
    #8b5cf6 72%,
    #d8b4fe 100%
  );
  clip-path: none;
  transition:
    width 160ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 180ms ease,
    opacity 180ms ease;
}
.dsh-rs-host-row[data-dsh-tone="low"] .dsh-rs-fill {
  background: #4d93f8;
}
.dsh-rs-host-row[data-dsh-tone="high"] .dsh-rs-fill {
  background: linear-gradient(90deg, #4d93f8 0%, #8b5cf6 68%, #b06cff 100%);
}
.dsh-rs-host-row[data-dsh-tone="max"] .dsh-rs-fill {
  width: 100%;
  clip-path: none;
  opacity: 1;
  background: linear-gradient(90deg, #7c3aed 0%, #a855f7 55%, #d8b4fe 100%);
}
.dsh-rs-host-row[data-dsh-tone="off"] .dsh-rs-fill {
  opacity: 0;
}
.dsh-rs-particle {
  position: absolute;
  top: var(--dsh-rs-y);
  left: -4%;
  width: var(--dsh-rs-size);
  height: var(--dsh-rs-size);
  margin: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
  opacity: 0;
  animation: dsh-rs-star-flow var(--dsh-rs-duration) linear infinite;
  animation-delay: var(--dsh-rs-delay);
  will-change: left, opacity;
}
.dsh-rs-host-row[data-dsh-tone="off"] .dsh-rs-particle {
  display: none;
}
.dsh-rs-host-row[data-dsh-tone="low"] .dsh-rs-particle:nth-child(n + 15) {
  display: none;
}
.dsh-rs-host-row[data-dsh-tone="high"] .dsh-rs-particle:nth-child(n + 31) {
  display: none;
}
.dsh-rs-host-row[data-dsh-tone="max"] .dsh-rs-particle {
  box-shadow: 0 0 6px rgba(245, 234, 255, 0.9);
}
.dsh-rs-ticks {
  z-index: 4;
  top: 0;
  right: 14px;
  bottom: 0;
  left: 14px;
  align-items: center;
  transform: none;
}
.dsh-rs-tick {
  width: 3px;
  height: 3px;
  background: #ffffff;
  opacity: 0.8;
}
.dsh-rs-tick[data-active="true"] {
  background: #ffffff;
  opacity: 0.8;
}
.dsh-rs-thumb {
  z-index: 5;
  top: 50%;
  left: calc(2px + (100% - 28px) * var(--dsh-rs-p, 0));
  width: 24px;
  height: 24px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.35),
    0 5px 12px rgba(0, 0, 0, 0.22);
  transform: translateY(-50%);
  transition: left 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.dsh-rs-track[data-dragging="true"] .dsh-rs-fill,
.dsh-rs-track[data-dragging="true"] .dsh-rs-thumb {
  transition: none;
}
@keyframes dsh-rs-star-flow {
  0% {
    left: -4%;
    opacity: 0;
  }
  12% {
    opacity: 0.96;
  }
  88% {
    opacity: 0.96;
  }
  100% {
    left: 104%;
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-rs-fill,
  .dsh-rs-thumb {
    transition: none;
  }
  .dsh-rs-particle {
    animation: none;
  }
  .dsh-rs-particle {
    opacity: 0.55;
  }
}
`;

    function installStyles() {
      if (typeof document === 'undefined') return () => {};
      if (document.querySelector(`style[data-dsh-plugin-style="${STYLE_ID}"]`) !== null) {
        return () => {};
      }
      const style = document.createElement('style');
      style.dataset.dshPluginStyle = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
      return () => style.remove();
    }

    function messageOf(value) {
      if (typeof value === 'string') return value;
      if (value !== null && typeof value === 'object' && typeof value.message === 'string') {
        return value.message;
      }
      return '';
    }

    function levelsFor(reasoning, t) {
      if (reasoning === undefined || reasoning === null || !Array.isArray(reasoning.efforts)) {
        return [];
      }
      const levels = reasoning.efforts.map((effort) => ({
        effort: effort.id,
        name: effort.name || effort.id,
      }));
      if (levels.length === 0) return levels;
      if (reasoning.defaultEffort === undefined || reasoning.defaultEffort === null) {
        levels.unshift({ effort: undefined, name: t('default') });
      }
      return levels;
    }

    function isOffLevel(level) {
      if (level === undefined) return false;
      const effort = String(level.effort ?? '').toLowerCase();
      const name = String(level.name ?? '').toLowerCase();
      return (
        effort === 'off' ||
        effort === 'none' ||
        name === 'off' ||
        name === 'none' ||
        name === '关闭' ||
        name === '无'
      );
    }

    function toneFor(level, index, count) {
      if (index === 0 || isOffLevel(level)) return 'off';
      if (count <= 1) return 'max';
      const ratio = index / (count - 1);
      if (ratio >= 1) return 'max';
      if (ratio >= 0.6) return 'high';
      return 'low';
    }

    function toneColor(tone) {
      if (tone === 'low') return '#6aa7ff';
      if (tone === 'high') return '#b69cff';
      return '#d4d4d8';
    }

    function useDirectory(models, sessionId) {
      const [directory, setDirectory] = React.useState(null);
      React.useEffect(() => {
        let alive = true;
        let attempts = 0;
        let timer = null;
        const resolve = () => {
          if (!alive) return;
          try {
            const next = models.directoryFor(sessionId);
            setDirectory(next);
            next.load().catch(() => {});
          } catch (_error) {
            attempts += 1;
            if (attempts <= 20) {
              timer = window.setTimeout(resolve, 100);
            }
          }
        };
        setDirectory(null);
        resolve();
        return () => {
          alive = false;
          if (timer !== null) window.clearTimeout(timer);
        };
      }, [models, sessionId]);
      return directory;
    }

    /**
     * 把滑条挂到官方模型菜单里：隐藏锚点用于定位当前 composer，
     * 打开菜单后找到“模型 / 推理等级”根菜单，在推理等级行后插入一个容器。
     */
    function useMenuPortal(anchorRef, sessionId, label) {
      const [portalTarget, setPortalTarget] = React.useState(null);
      React.useEffect(() => {
        if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
          return undefined;
        }
        const anchor = anchorRef.current;
        if (anchor === null) return undefined;

        let disposed = false;
        let frame = 0;
        let container = null;
        let containerMenu = null;
        let menuObserver = null;
        let observedMenu = null;
        let keyTarget = null;
        let decoratedRow = null;
        let decoratedModelRow = null;
        let decoratedMenu = null;

        const findMenu = () => {
          const card = anchor.closest('[data-composer-card]');
          const scope = card === null ? document : card;
          const triggers = scope.querySelectorAll(
            'button[aria-haspopup="menu"][aria-expanded="true"]',
          );
          for (const trigger of triggers) {
            const menuId = trigger.getAttribute('aria-controls');
            if (menuId === null || menuId === '') continue;
            const menu = document.getElementById(menuId);
            if (menu === null) continue;
            const rows = Array.from(
              menu.querySelectorAll('button[role="menuitem"]'),
            );
            const effortRow = rows.find((row) =>
              (row.textContent ?? '').includes(label)
            );
            if (effortRow !== undefined) {
              const modelRow = rows.find((row) => row !== effortRow);
              return { menu, effortRow, modelRow };
            }
          }
          return null;
        };

        const restoreOfficialRow = () => {
          if (decoratedRow === null) return;
          decoratedRow.classList.remove('dsh-rs-host-row');
          decoratedRow.removeAttribute('data-dsh-reasoning-slider');
          decoratedRow.removeAttribute('data-dsh-tone');
          decoratedRow = null;
        };

        const restoreModelRow = () => {
          if (decoratedModelRow === null) return;
          decoratedModelRow.classList.remove('dsh-rs-model-switch');
          decoratedModelRow = null;
        };

        const decorateMenu = (menu) => {
          if (decoratedMenu === menu) return;
          restoreMenu();
          decoratedMenu = menu;
          menu.classList.add('dsh-rs-menu-surface');
        };

        const restoreMenu = () => {
          if (decoratedMenu === null) return;
          decoratedMenu.classList.remove('dsh-rs-menu-surface');
          decoratedMenu = null;
        };

        const decorateOfficialRow = (row) => {
          if (decoratedRow === row) return;
          restoreOfficialRow();
          decoratedRow = row;
          row.classList.add('dsh-rs-host-row');
          row.setAttribute('data-dsh-reasoning-slider', 'true');
        };

        const decorateModelRow = (row) => {
          if (row === undefined || decoratedModelRow === row) return;
          restoreModelRow();
          decoratedModelRow = row;
          row.classList.add('dsh-rs-model-switch');
        };

        const drop = () => {
          restoreOfficialRow();
          restoreModelRow();
          restoreMenu();
          if (container === null) return;
          const previous = container;
          container = null;
          containerMenu = null;
          previous.remove();
          if (!disposed) {
            setPortalTarget((current) => (current === previous ? null : current));
          }
        };

        const onMenuKeyDown = (event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          const track = container === null
            ? null
            : container.querySelector('[role="slider"]');
          if (track === null || document.activeElement === track) return;
          const active = document.activeElement;
          if (
            active instanceof HTMLElement &&
            active.getAttribute('role') === 'menuitem'
          ) {
            event.preventDefault();
            event.stopPropagation();
            track.focus({ preventScroll: true });
          }
        };

        const observeMenu = (menu) => {
          if (observedMenu === menu) return;
          if (menuObserver !== null) menuObserver.disconnect();
          if (keyTarget !== null) {
            keyTarget.removeEventListener('keydown', onMenuKeyDown, true);
          }
          observedMenu = menu;
          keyTarget = menu;
          keyTarget.addEventListener('keydown', onMenuKeyDown, true);
          menuObserver = new MutationObserver(schedule);
          menuObserver.observe(menu, { childList: true, subtree: true });
        };

        const ensure = () => {
          if (disposed) return;
          const found = findMenu();
          if (found === null) {
            drop();
            return;
          }
          observeMenu(found.menu);
          decorateMenu(found.menu);
          const effortRow = found.effortRow;
          decorateOfficialRow(effortRow);
          decorateModelRow(found.modelRow);
          if (
            container !== null &&
            container.isConnected &&
            containerMenu === found.menu &&
            container.parentElement === effortRow
          ) {
            return;
          }
          drop();
          decorateOfficialRow(effortRow);
          const next = document.createElement('div');
          next.className = 'dsh-rs-menu-slot';
          next.dataset.dshReasoningSlider = 'true';
          effortRow.appendChild(next);
          container = next;
          containerMenu = found.menu;
          setPortalTarget(next);
          window.dispatchEvent(new Event('resize'));
        };

        const schedule = () => {
          if (disposed || frame !== 0) return;
          frame = window.requestAnimationFrame(() => {
            frame = 0;
            ensure();
          });
        };

        const bodyObserver = new MutationObserver(schedule);
        bodyObserver.observe(document.body, { childList: true });
        const card = anchor.closest('[data-composer-card]');
        const cardObserver = new MutationObserver(schedule);
        cardObserver.observe(card === null ? document.body : card, {
          attributes: true,
          attributeFilter: ['aria-expanded', 'aria-controls'],
          childList: true,
        });
        schedule();

        return () => {
          disposed = true;
          if (frame !== 0) window.cancelAnimationFrame(frame);
          bodyObserver.disconnect();
          cardObserver.disconnect();
          if (menuObserver !== null) menuObserver.disconnect();
          if (keyTarget !== null) {
            keyTarget.removeEventListener('keydown', onMenuKeyDown, true);
          }
          if (container !== null) container.remove();
          restoreOfficialRow();
          restoreModelRow();
          restoreMenu();
          container = null;
          containerMenu = null;
          observedMenu = null;
          keyTarget = null;
        };
      }, [anchorRef, label, sessionId]);
      return portalTarget;
    }

    function MenuSlider({ models, sessionId, t }) {
      const tr = typeof t === 'function' ? t : (key) => key;
      const directory = useDirectory(models, sessionId);
      const subscribe = React.useCallback(
        (callback) => (directory === null ? () => {} : directory.store.subscribe(callback)),
        [directory],
      );
      const getSnapshot = React.useCallback(
        () => (directory === null ? EMPTY_STATE : directory.store.getSnapshot()),
        [directory],
      );
      const state = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
      const anchorRef = React.useRef(null);
      const portalTarget = useMenuPortal(anchorRef, sessionId, tr('label'));

      const current = state.current;
      const group = current === null
        ? undefined
        : state.groups.find((entry) => entry.id === current.provider);
      const model = group === undefined
        ? undefined
        : group.models.find((entry) => entry.id === current.model);
      const reasoning = model === undefined ? undefined : model.reasoning;
      const levels = React.useMemo(() => levelsFor(reasoning, tr), [reasoning, tr]);

      const modelKey = current === null ? '' : `${current.provider}/${current.model}`;
      const activeEffort = current === null
        ? undefined
        : current.reasoningEffort ?? reasoning?.defaultEffort;
      const foundIndex = levels.findIndex((level) => level.effort === activeEffort);
      const currentIndex = foundIndex >= 0 ? foundIndex : 0;
      const committedTone = toneFor(levels[currentIndex], currentIndex, levels.length);

      const [dragIndex, setDragIndex] = React.useState(null);
      const [pendingIndex, setPendingIndex] = React.useState(null);
      const [error, setError] = React.useState(null);
      const dragRef = React.useRef(null);
      const trackRef = React.useRef(null);

      const busy = state.pending !== null || state.status === 'selecting';
      const shownIndex = dragIndex ?? pendingIndex ?? currentIndex;
      const safeIndex = levels.length === 0
        ? 0
        : Math.max(0, Math.min(levels.length - 1, shownIndex));
      const ratio = levels.length <= 1 ? 0 : safeIndex / (levels.length - 1);
      const flowDuration = 3.6 - 2.7 * ratio;
      const particleScale = flowDuration / 2.4;
      const shownName = levels.length === 0 ? '' : levels[safeIndex].name;
      const errorText = error || state.error;
      const dragging = dragIndex !== null;
      const tone = levels.length === 0
        ? 'off'
        : toneFor(levels[safeIndex], safeIndex, levels.length);

      React.useEffect(() => {
        setDragIndex(null);
        setPendingIndex(null);
        setError(null);
        dragRef.current = null;
      }, [modelKey, sessionId]);

      React.useEffect(() => {
        if (pendingIndex === null) return undefined;
        if (currentIndex === pendingIndex) {
          setPendingIndex(null);
          return undefined;
        }
        const timer = window.setTimeout(() => setPendingIndex(null), 1600);
        return () => window.clearTimeout(timer);
      }, [pendingIndex, currentIndex]);

      React.useEffect(() => {
        if (portalTarget === null || typeof window === 'undefined') return undefined;
        const frame = window.requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
        });
        return () => window.cancelAnimationFrame(frame);
      }, [portalTarget, levels.length]);

      React.useEffect(() => {
        const anchor = anchorRef.current;
        if (anchor === null || current === null || levels.length === 0) return undefined;
        const card = anchor.closest('[data-composer-card]');
        if (card === null) return undefined;
        const labelSpan = card.querySelector(
          'button[aria-haspopup="menu"] span[data-provider-id]',
        );
        const trigger = labelSpan === null ? null : labelSpan.closest('button');
        if (trigger === null) return undefined;
        const candidates = Array.from(trigger.querySelectorAll('span')).filter(
          (span) => span !== labelSpan && !span.contains(labelSpan) && !labelSpan.contains(span),
        );
        const committedName = levels[currentIndex]?.name;
        const effortSpan = candidates.find((span) => {
          const text = (span.textContent ?? '').trim();
          return text === committedName || text.includes(committedName);
        }) ?? candidates.find((span) => {
          const text = (span.textContent ?? '').trim();
          return levels.some(
            (level) => text === level.name || text.includes(level.name),
          );
        });
        if (effortSpan === undefined) return undefined;
        const previous = {
          color: effortSpan.style.color,
          background: effortSpan.style.background,
          webkitBackgroundClip: effortSpan.style.webkitBackgroundClip,
          backgroundClip: effortSpan.style.backgroundClip,
        };
        if (committedTone === 'max') {
          effortSpan.style.color = 'transparent';
          effortSpan.style.background = 'linear-gradient(90deg, #a855f7 0%, #d8b4fe 100%)';
          effortSpan.style.webkitBackgroundClip = 'text';
          effortSpan.style.backgroundClip = 'text';
        } else {
          effortSpan.style.color = toneColor(committedTone);
          effortSpan.style.background = '';
          effortSpan.style.webkitBackgroundClip = '';
          effortSpan.style.backgroundClip = '';
        }
        return () => {
          effortSpan.style.color = previous.color;
          effortSpan.style.background = previous.background;
          effortSpan.style.webkitBackgroundClip = previous.webkitBackgroundClip;
          effortSpan.style.backgroundClip = previous.backgroundClip;
        };
      }, [anchorRef, committedTone, current, currentIndex, levels, sessionId]);

      React.useEffect(() => {
        if (portalTarget === null) return undefined;
        const row = portalTarget.closest('button[role="menuitem"]');
        if (row === null) return undefined;
        row.setAttribute('data-dsh-tone', tone);
        return () => {
          if (row.getAttribute('data-dsh-tone') === tone) {
            row.removeAttribute('data-dsh-tone');
          }
        };
      }, [portalTarget, tone]);

      const commit = React.useCallback(
        async (index) => {
          const level = levels[index];
          if (level === undefined || current === null || directory === null) return;
          const selection = {
            provider: current.provider,
            model: current.model,
          };
          if (level.effort !== undefined) selection.reasoningEffort = level.effort;
          setError(null);
          setPendingIndex(index);
          try {
            const result = await directory.select(selection);
            if (result !== undefined && result.ok === false) {
              setPendingIndex(null);
              setError(messageOf(result.error) || tr('failed'));
            }
          } catch (reason) {
            setPendingIndex(null);
            setError(messageOf(reason) || tr('failed'));
          }
        },
        [current, directory, levels, tr],
      );

      const indexAt = React.useCallback(
        (clientX) => {
          const track = trackRef.current;
          if (track === null || levels.length <= 1) return 0;
          const rect = track.getBoundingClientRect();
          const usable = Math.max(1, rect.width - 28);
          const ratio = Math.max(0, Math.min(1, (clientX - rect.left - 14) / usable));
          return Math.round(ratio * (levels.length - 1));
        },
        [levels.length],
      );

      const finishDrag = React.useCallback(
        (event, shouldCommit) => {
          const drag = dragRef.current;
          if (drag === null || drag.pointerId !== event.pointerId) return;
          dragRef.current = null;
          setDragIndex(null);
          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch (_error) {
            // 指针捕获可能已被浏览器释放，这里无需处理。
          }
          event.preventDefault();
          event.stopPropagation();
          if (shouldCommit && drag.index !== currentIndex) {
            commit(drag.index);
          }
        },
        [commit, currentIndex],
      );

      const anchor = h('span', {
        ref: anchorRef,
        className: 'dsh-rs-anchor',
        hidden: true,
        'aria-hidden': true,
      });

      if (directory === null || current === null || levels.length === 0 || portalTarget === null) {
        return anchor;
      }

      const onPointerDown = (event) => {
        if (busy || levels.length <= 1) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.focus({ preventScroll: true });
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch (_error) {
          // 键盘和点击仍然可用，不因指针捕获失败阻断交互。
        }
        const index = indexAt(event.clientX);
        dragRef.current = { pointerId: event.pointerId, index };
        setDragIndex(index);
      };

      const onPointerMove = (event) => {
        const drag = dragRef.current;
        if (drag === null || drag.pointerId !== event.pointerId) return;
        event.preventDefault();
        event.stopPropagation();
        const index = indexAt(event.clientX);
        if (index === drag.index) return;
        drag.index = index;
        setDragIndex(index);
      };

      const onPointerUp = (event) => finishDrag(event, true);
      const onPointerCancel = (event) => finishDrag(event, false);

      const onLostPointerCapture = (event) => {
        const drag = dragRef.current;
        if (drag === null || drag.pointerId !== event.pointerId) return;
        dragRef.current = null;
        setDragIndex(null);
      };

      const onKeyDown = (event) => {
        if (busy || levels.length <= 1) return;
        let next = currentIndex;
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next += 1;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next -= 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = levels.length - 1;
        else return;
        event.preventDefault();
        event.stopPropagation();
        next = Math.max(0, Math.min(levels.length - 1, next));
        if (next !== currentIndex) commit(next);
      };

      const slider = h(
        'div',
        {
          ref: trackRef,
          className: 'dsh-rs-track',
          role: 'slider',
          tabIndex: busy ? -1 : 0,
          'aria-label': tr('label'),
          'aria-orientation': 'horizontal',
          'aria-valuemin': 0,
          'aria-valuemax': levels.length - 1,
          'aria-valuenow': safeIndex,
          'aria-valuetext': shownName,
          'aria-disabled': busy ? 'true' : undefined,
          'aria-busy': busy ? 'true' : undefined,
          'data-busy': busy ? 'true' : 'false',
          'data-dragging': dragging ? 'true' : 'false',
          style: {
            '--dsh-rs-p': String(ratio),
          },
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel,
          onLostPointerCapture,
          onKeyDown,
          onClick: (event) => {
            event.preventDefault();
            event.stopPropagation();
          },
          onDoubleClick: (event) => {
            event.preventDefault();
            event.stopPropagation();
          },
        },
        h(
          'div',
          { className: 'dsh-rs-rail', 'aria-hidden': true },
          h(
            'div',
            { className: 'dsh-rs-fill' },
            PARTICLE_SEEDS.map(([x, y, size, duration, delay], index) =>
              h('span', {
                key: index,
                className: 'dsh-rs-particle',
                style: {
                  '--dsh-rs-x': `${x}%`,
                  '--dsh-rs-y': `${y}%`,
                  '--dsh-rs-size': `${size}px`,
                  '--dsh-rs-duration': `${(duration * particleScale).toFixed(2)}s`,
                  '--dsh-rs-delay': `${delay}s`,
                },
              })
            ),
          ),
        ),
        h(
          'div',
          { className: 'dsh-rs-ticks', 'aria-hidden': true },
          levels.map((level, index) =>
            h('span', {
              key: level.effort === undefined ? 'default' : `effort:${level.effort}`,
              className: 'dsh-rs-tick',
              'data-active': index <= safeIndex ? 'true' : 'false',
            })
          ),
        ),
        h('div', { className: 'dsh-rs-thumb', 'aria-hidden': true }),
      );

      return h(
        React.Fragment,
        null,
        anchor,
        ReactDOM.createPortal(
          h(
            React.Fragment,
            null,
            slider,
            errorText
              ? h('span', { className: 'dsh-rs-sr', role: 'status' }, errorText)
              : null,
          ),
          portalTarget,
        ),
      );
    }

    return {
      inject: ['locale', 'slots', 'modelDirectories'],
      apply(ctx) {
        ctx.effect(
          () => ctx.locale.register(NS, { zh, en }),
          'codex-reasoning-slider: dictionaries',
        );
        ctx.effect(installStyles, 'codex-reasoning-slider: styles');
        ctx.slots.inject('conversation.input.left', () =>
          ctx.slots.register(
            {
              name: 'conversation.input.left',
              id: 'codex-reasoning-slider',
              order: 30,
              locale: NS,
            },
            (props) => h(MenuSlider, { ...props, models: ctx.modelDirectories }),
          )
        );
      },
    };
  },
});
