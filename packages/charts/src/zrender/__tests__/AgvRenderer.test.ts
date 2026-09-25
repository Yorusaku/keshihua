/**
 * AgvRenderer 行为测试
 * 文件路径：@packages/charts/src/zrender/__tests__/AgvRenderer.test.ts
 *
 * 覆盖点：
 * - 构造函数初始化 ZRender 并绑定上下文丢失监听
 * - 每帧从数据源取快照、创建/复用节点
 * - 状态变化时更新填充色
 * - 按帧间隔回收离线节点
 * - dispose 释放动画帧与渲染实例
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const circles: Array<{ attr: ReturnType<typeof vi.fn> }> = [];
  const rendererInstance = {
    add: vi.fn(),
    remove: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    dom: null as HTMLCanvasElement | null,
  };

  const init = vi.fn(() => rendererInstance);
  // 使用普通函数，保证 `new zrender.Circle()` 能返回自建对象
  const Circle = vi.fn(function (this: unknown) {
    const circle = {
      attr: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };
    circles.push(circle);
    return circle;
  });

  return { circles, rendererInstance, init, Circle };
});

vi.mock('zrender', () => ({
  init: mocks.init,
  Circle: mocks.Circle,
}));

import { AgvRenderer } from '../AgvRenderer';
import type { GetDataSnapshot } from '../types';

let rafCallbacks: FrameRequestCallback[] = [];

function runNextFrame(): void {
  const callback = rafCallbacks.shift();
  if (!callback) {
    throw new Error('没有待执行的动画帧回调');
  }
  callback(0);
}

function createSnapshotSource(): { getSnapshot: GetDataSnapshot; setSnapshot: (next: ReturnType<GetDataSnapshot>) => void } {
  let current: ReturnType<GetDataSnapshot> = [];
  return {
    getSnapshot: () => current,
    setSnapshot: (next) => {
      current = next;
    },
  };
}

describe('AgvRenderer - Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.circles.length = 0;
    rafCallbacks = [];

    const canvas = document.createElement('canvas');
    mocks.rendererInstance.dom = canvas;

    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      rafCallbacks.push(callback);
      return rafCallbacks.length;
    }) as typeof requestAnimationFrame;
    global.cancelAnimationFrame = vi.fn() as typeof cancelAnimationFrame;
  });

  it('实例化时初始化 ZRender 并监听上下文丢失', () => {
    const container = document.createElement('div');
    const canvas = mocks.rendererInstance.dom as HTMLCanvasElement;
    const addEventListener = vi.spyOn(canvas, 'addEventListener');

    new AgvRenderer(container, { offlineReapIntervalFrames: 1 });

    expect(mocks.init).toHaveBeenCalledWith(container);
    expect(addEventListener).toHaveBeenCalledWith('webglcontextlost', expect.any(Function));
    expect(addEventListener).toHaveBeenCalledWith('canvascontextlost', expect.any(Function));
  });

  it('每帧取快照，同一节点只创建一次并持续更新坐标', () => {
    const container = document.createElement('div');
    const renderer = new AgvRenderer(container);
    const source = createSnapshotSource();

    renderer.startAnimationLoop(source.getSnapshot);

    source.setSnapshot([
      { id: 'agv-001', x: 100, y: 200, status: 'moving', timestamp: 1000 },
    ]);
    runNextFrame();

    expect(mocks.rendererInstance.add).toHaveBeenCalledTimes(1);
    const circle = mocks.circles[0];
    expect(circle.attr).toHaveBeenCalledTimes(1);

    source.setSnapshot([
      { id: 'agv-001', x: 150, y: 260, status: 'moving', timestamp: 2000 },
    ]);
    runNextFrame();

    expect(mocks.rendererInstance.add).toHaveBeenCalledTimes(1);
    expect(circle.attr).toHaveBeenCalledTimes(2);
    expect(circle.attr).toHaveBeenLastCalledWith({
      shape: { cx: 150, cy: 260 },
    });
    expect(mocks.rendererInstance.render).not.toHaveBeenCalled();
  });

  it('状态变化时只更新填充色', () => {
    const container = document.createElement('div');
    const renderer = new AgvRenderer(container);
    const source = createSnapshotSource();

    renderer.startAnimationLoop(source.getSnapshot);

    source.setSnapshot([
      { id: 'agv-001', x: 10, y: 10, status: 'idle', timestamp: 1 },
    ]);
    runNextFrame();

    source.setSnapshot([
      { id: 'agv-001', x: 20, y: 20, status: 'error', timestamp: 2 },
    ]);
    runNextFrame();

    const circle = mocks.circles[0];
    const fillUpdates = circle.attr.mock.calls.filter(
      (call) => call[0]?.style?.fill === '#F44336'
    );
    expect(fillUpdates).toHaveLength(1);
  });

  it('按帧间隔回收离线节点，节点重新出现时重建', () => {
    const container = document.createElement('div');
    const renderer = new AgvRenderer(container, {
      offlineReapIntervalFrames: 2,
    });
    const source = createSnapshotSource();

    renderer.startAnimationLoop(source.getSnapshot);

    source.setSnapshot([
      { id: 'agv-001', x: 10, y: 10, status: 'idle', timestamp: 1 },
    ]);
    runNextFrame();
    expect(mocks.rendererInstance.add).toHaveBeenCalledTimes(1);

    // 第 2 帧：AGV 全部离线，触发回收
    source.setSnapshot([]);
    runNextFrame();
    expect(mocks.rendererInstance.remove).toHaveBeenCalledTimes(1);

    // 第 3 帧：AGV 重新出现，应重新创建节点
    source.setSnapshot([
      { id: 'agv-001', x: 30, y: 30, status: 'idle', timestamp: 3 },
    ]);
    runNextFrame();
    expect(mocks.rendererInstance.add).toHaveBeenCalledTimes(2);
  });

  it('dispose 时取消动画帧并销毁渲染实例', () => {
    const container = document.createElement('div');
    const renderer = new AgvRenderer(container);
    const source = createSnapshotSource();

    renderer.startAnimationLoop(source.getSnapshot);
    renderer.dispose();

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
    expect(mocks.rendererInstance.dispose).toHaveBeenCalledTimes(1);

    // 重复销毁不应再次调用
    renderer.dispose();
    expect(mocks.rendererInstance.dispose).toHaveBeenCalledTimes(1);
  });
});
