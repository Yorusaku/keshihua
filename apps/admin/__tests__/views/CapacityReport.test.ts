import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as S2 from '@antv/s2';
import CapacityReport from '@/views/CapacityReport.vue';

vi.mock('@antv/s2/dist/s2.min.css', () => ({}));
vi.mock('ant-design-vue', () => ({
  default: {
    install: () => undefined,
  },
}));

const mockEnsureSharedProvider = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/composables', () => ({
  ensureSharedProvider: (...args: unknown[]) => mockEnsureSharedProvider(...args),
}));

vi.mock('@packages/shared', async () => {
  const actual = await vi.importActual<typeof import('@packages/shared')>('@packages/shared');
  return {
    ...actual,
    useFeedback: () => ({
      toast: {
        error: mockToastError,
      },
    }),
    SkeletonCard: {
      template: '<div data-test-id="skeleton-card" />',
      props: ['lines'],
    },
    SkeletonChart: {
      template: '<div data-test-id="skeleton-chart" />',
    },
  };
});

vi.mock('@antv/s2', () => ({
  PivotSheet: vi.fn(() => ({
    render: vi.fn(),
    destroy: vi.fn(),
    setDataCfg: vi.fn(),
    changeSheetSize: vi.fn(),
  })),
}));

const getS2Mocks = () => {
  const ctor = vi.mocked(S2.PivotSheet);
  const instance = ctor.mock.results[0]?.value as {
    render: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    setDataCfg: ReturnType<typeof vi.fn>;
    changeSheetSize: ReturnType<typeof vi.fn>;
  } | undefined;
  return { ctor, instance };
};

const sampleRows = [
  { factory: 'F1', line: 'L1', date: '2026-01-01', yield: 100, defectRate: 0.02 },
  { factory: 'F1', line: 'L2', date: '2026-01-01', yield: 200, defectRate: 0.04 },
];

const sharedProvider = {
  runtimeStatus: { sourceLabel: '模拟数据' },
  getCapacityReport: vi.fn().mockResolvedValue(sampleRows),
};

const flushMicrotasks = async (times = 4) => {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
};

describe('CapacityReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureSharedProvider.mockResolvedValue(sharedProvider);
    sharedProvider.getCapacityReport.mockResolvedValue(sampleRows);
  });

  it('加载后应使用完整数据，不再截断到 80 行', async () => {
    const wrapper = mount(CapacityReport, {
      global: {
        stubs: {
          'a-card': { template: '<div><slot /><slot name="extra" /></div>' },
          'a-spin': { template: '<div><slot /></div>' },
        },
      },
    });
    await flushMicrotasks();

    expect(mockEnsureSharedProvider).toHaveBeenCalledTimes(1);
    expect(sharedProvider.getCapacityReport).toHaveBeenCalledTimes(1);
    await flushMicrotasks();
    expect(wrapper.text()).toContain('模拟数据');
    const { instance } = getS2Mocks();
    const setDataArg = instance?.setDataCfg.mock.calls.at(-1)?.[0];
    if (setDataArg) {
      expect(setDataArg.data.length).toBe(sampleRows.length);
    } else {
      const ctorDataArg = getS2Mocks().ctor.mock.calls.at(-1)?.[1];
      expect(ctorDataArg?.data.length).toBe(sampleRows.length);
    }
  });

  it('挂载时应实例化并渲染 PivotSheet', async () => {
    mount(CapacityReport, {
      global: {
        stubs: {
          'a-card': { template: '<div><slot /><slot name="extra" /></div>' },
          'a-spin': { template: '<div><slot /></div>' },
        },
      },
    });
    await flushMicrotasks();

    const { ctor, instance } = getS2Mocks();
    expect(ctor).toHaveBeenCalledTimes(1);
    expect(instance?.render).toHaveBeenCalled();
  });

  it('卸载时应 destroy PivotSheet，避免内存泄漏', async () => {
    const wrapper = mount(CapacityReport, {
      global: {
        stubs: {
          'a-card': { template: '<div><slot /><slot name="extra" /></div>' },
          'a-spin': { template: '<div><slot /></div>' },
        },
      },
    });
    await flushMicrotasks();

    wrapper.unmount();
    const { instance } = getS2Mocks();
    expect(instance?.destroy).toHaveBeenCalled();
  });

  it('请求失败时应提示错误', async () => {
    mockEnsureSharedProvider.mockRejectedValueOnce(new Error('boom'));
    mount(CapacityReport, {
      global: {
        stubs: {
          'a-card': { template: '<div><slot /><slot name="extra" /></div>' },
          'a-spin': { template: '<div><slot /></div>' },
        },
      },
    });
    await flushMicrotasks();

    expect(mockToastError).toHaveBeenCalled();
  });
});
