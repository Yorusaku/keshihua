import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as S2 from '@antv/s2';
import CapacityPivotSheet from '@/views/components/CapacityPivotSheet.vue';

vi.mock('@antv/s2/dist/s2.min.css', () => ({}));

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

describe('CapacityPivotSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('挂载时应实例化 PivotSheet 并 render', async () => {
    mount(CapacityPivotSheet, {
      props: {
        rows: [{ factory: 'F1', line: 'L1', date: '2026-01-01', yield: 100, defectRate: 0.01 }],
      },
    });

    await Promise.resolve();
    const { ctor, instance } = getS2Mocks();
    expect(ctor).toHaveBeenCalledTimes(1);
    expect(instance?.render).toHaveBeenCalled();
  });

  it('props 更新时应 setDataCfg + render', async () => {
    const wrapper = mount(CapacityPivotSheet, {
      props: {
        rows: [{ factory: 'F1', line: 'L1', date: '2026-01-01', yield: 100, defectRate: 0.01 }],
      },
    });
    await Promise.resolve();

    await wrapper.setProps({
      rows: [
        { factory: 'F1', line: 'L1', date: '2026-01-01', yield: 100, defectRate: 0.01 },
        { factory: 'F1', line: 'L2', date: '2026-01-02', yield: 120, defectRate: 0.02 },
      ],
    });
    await Promise.resolve();

    const { instance } = getS2Mocks();
    expect(instance?.setDataCfg).toHaveBeenCalled();
    expect(instance?.render).toHaveBeenCalled();
  });

  it('卸载时应 destroy', async () => {
    const wrapper = mount(CapacityPivotSheet, {
      props: {
        rows: [],
      },
    });
    await Promise.resolve();

    wrapper.unmount();
    const { instance } = getS2Mocks();
    expect(instance?.destroy).toHaveBeenCalled();
  });
});
