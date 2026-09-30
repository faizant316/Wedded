import { fetchVendorPublicStats, trackVendorActivity } from './vendor-stats';

const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

beforeEach(() => mockRpc.mockReset());

describe('trackVendorActivity', () => {
  it('counts a view once per vendor per session, and every tap', () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    trackVendorActivity('v1', 'view');
    trackVendorActivity('v1', 'view');
    trackVendorActivity('v1', 'call');
    trackVendorActivity('v1', 'call');
    expect(mockRpc.mock.calls.map((c) => c[1].p_kind)).toEqual(['view', 'call', 'call']);
  });

  it('never throws when counting fails', () => {
    mockRpc.mockRejectedValue(new Error('offline'));
    expect(() => trackVendorActivity('v2', 'view')).not.toThrow();
  });
});

describe('fetchVendorPublicStats', () => {
  it('shows nothing below the minimum', async () => {
    mockRpc.mockResolvedValue({
      data: [{ saved_by: null, replied: null, answered: null, booked_by: null }],
      error: null,
    });
    await expect(fetchVendorPublicStats('v1')).resolves.toEqual({
      savedBy: null,
      replied: null,
      bookedBy: null,
    });
  });

  it('passes the numbers through once there are enough', async () => {
    mockRpc.mockResolvedValue({
      data: [{ saved_by: 12, replied: 9, answered: 11, booked_by: 6 }],
      error: null,
    });
    await expect(fetchVendorPublicStats('v1')).resolves.toEqual({
      savedBy: 12,
      replied: { replied: 9, answered: 11 },
      bookedBy: 6,
    });
  });
});
