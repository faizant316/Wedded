import { useMemo } from 'react';
import { View } from 'react-native';

import { makeStyles } from '@/constants/theme';
import { darkRuns, QR_QUIET_ZONE, qrMatrix } from '@/features/tent/table-tent';

/**
 * A QR code drawn with plain views (no SVG library), black on white with its
 * quiet zone. Each run of dark modules in a row is one view.
 */
export function QrCode({
  value,
  size,
  accessibilityLabel,
}: {
  value: string;
  /** Roughly this many points wide; rounded down so modules stay whole. */
  size: number;
  accessibilityLabel: string;
}) {
  const styles = useStyles();
  const matrix = useMemo(() => qrMatrix(value), [value]);
  const modules = matrix.length + QR_QUIET_ZONE * 2;
  const unit = Math.max(1, Math.floor(size / modules));
  const side = unit * modules;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.code, { width: side, height: side }]}
    >
      {matrix.map((row, y) =>
        darkRuns(row).map(({ start, length }) => (
          <View
            key={`${y}-${start}`}
            style={[
              styles.module,
              {
                left: (start + QR_QUIET_ZONE) * unit,
                top: (y + QR_QUIET_ZONE) * unit,
                width: length * unit,
                height: unit,
              },
            ]}
          />
        )),
      )}
    </View>
  );
}

const useStyles = makeStyles((Colors) => ({
  code: {
    backgroundColor: Colors.qrLight,
  },
  module: {
    position: 'absolute',
    backgroundColor: Colors.qrDark,
  },
}));
