import type { DashboardTrendPoint } from '@dw/shared';

/** 近 7 天新增用户/穿搭趋势：纯 SVG 分组柱状图，零额外依赖、随容器自适应 */
const VIEW_W = 720;
const VIEW_H = 260;
const PAD = { top: 18, right: 16, bottom: 30, left: 28 };
const CHART_W = VIEW_W - PAD.left - PAD.right;
const CHART_H = VIEW_H - PAD.top - PAD.bottom;
const BASELINE = PAD.top + CHART_H;

const USER_COLOR = '#FFD93D';
const OUTFIT_COLOR = '#3D2C1E';
const BAR_W = 26;
const BAR_GAP = 8;

export default function TrendChart({ data }: { data: DashboardTrendPoint[] }) {
  const maxValue = Math.max(1, ...data.flatMap((d) => [d.newUsers, d.newOutfits]));
  const groupW = CHART_W / data.length;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      role="img"
      aria-label="近7天新增用户与穿搭趋势"
    >
      {/* 基线 */}
      <line
        x1={PAD.left}
        y1={BASELINE}
        x2={VIEW_W - PAD.right}
        y2={BASELINE}
        stroke="#E8DDD0"
        strokeWidth={1}
      />

      {data.map((d, i) => {
        const groupX = PAD.left + groupW * i;
        const userH = (d.newUsers / maxValue) * CHART_H;
        const outfitH = (d.newOutfits / maxValue) * CHART_H;
        const userX = groupX + groupW / 2 - BAR_W - BAR_GAP / 2;
        const outfitX = groupX + groupW / 2 + BAR_GAP / 2;
        const shortDate = d.date.slice(5); // MM-DD

        return (
          <g key={d.date}>
            {/* 新增用户柱 */}
            <rect
              x={userX}
              y={BASELINE - userH}
              width={BAR_W}
              height={userH}
              rx={5}
              fill={USER_COLOR}
            />
            {d.newUsers > 0 && (
              <text
                x={userX + BAR_W / 2}
                y={BASELINE - userH - 5}
                textAnchor="middle"
                fontSize={12}
                fill="#3D2C1E"
              >
                {d.newUsers}
              </text>
            )}

            {/* 新增穿搭柱 */}
            <rect
              x={outfitX}
              y={BASELINE - outfitH}
              width={BAR_W}
              height={outfitH}
              rx={5}
              fill={OUTFIT_COLOR}
            />
            {d.newOutfits > 0 && (
              <text
                x={outfitX + BAR_W / 2}
                y={BASELINE - outfitH - 5}
                textAnchor="middle"
                fontSize={12}
                fill="#3D2C1E"
              >
                {d.newOutfits}
              </text>
            )}

            {/* 日期 */}
            <text
              x={groupX + groupW / 2}
              y={BASELINE + 18}
              textAnchor="middle"
              fontSize={12}
              fill="#9C8271"
            >
              {shortDate}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
