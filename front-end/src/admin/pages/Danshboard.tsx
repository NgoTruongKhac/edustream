import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Users, Video, TrendingUp, TrendingDown } from "lucide-react";
import { getDashboard } from "@/api/dashboardApi";

interface DashboardData {
  totalUsers: number;
  totalVideos: number;
  usersGrowth: Record<string, number>;
  videosGrowth: Record<string, number>;
}

interface ChartDataPoint {
  date: string;
  users: number;
  videos: number;
}

function mergeGrowthData(
  usersGrowth: Record<string, number>,
  videosGrowth: Record<string, number>,
): ChartDataPoint[] {
  const allDates = new Set([
    ...Object.keys(usersGrowth),
    ...Object.keys(videosGrowth),
  ]);

  return Array.from(allDates)
    .sort()
    .map((date) => ({
      date: new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      users: usersGrowth[date] ?? 0,
      videos: videosGrowth[date] ?? 0,
    }));
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  growth?: number;
  color: "primary" | "secondary" | "accent" | "info" | "success";
}

function StatCard({ title, value, icon, growth, color }: StatCardProps) {
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-base-content/60 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-base-content">
              {value.toLocaleString("vi-VN")}
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
            {icon}
          </div>
        </div>

        {growth !== undefined && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-base-200">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-error" />
            )}
            <span
              className={`text-sm font-medium ${isPositive ? "text-success" : "text-error"}`}
            >
              {isPositive ? "+" : ""}
              {growth}%
            </span>
            <span className="text-sm text-base-content/50">so với hôm qua</span>
          </div>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-base-content mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-base-content/70">{entry.name}:</span>
            <span className="font-medium text-base-content">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getDashboard();
        setData(result);
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-base-content">
            Thống kê tổng quan
          </h1>
        </div>
        {/* Stat card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="card bg-base-100 border border-base-300 shadow-sm"
            >
              <div className="card-body p-5">
                <div className="skeleton h-4 w-28 mb-2" />
                <div className="skeleton h-8 w-20" />
                <div className="skeleton h-4 w-40 mt-3" />
              </div>
            </div>
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="skeleton h-5 w-40 mb-4" />
            <div className="skeleton h-64 w-full rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="card bg-base-100 border border-base-300 shadow-sm"
            >
              <div className="card-body p-5">
                <div className="skeleton h-5 w-36 mb-4" />
                <div className="skeleton h-52 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="font-semibold">Lỗi tải dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            className="btn btn-sm"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const chartData = mergeGrowthData(data.usersGrowth, data.videosGrowth);

  // Tính tổng user/video mới hôm qua để hiện growth (nếu có data)
  const sortedDates = Object.keys(data.usersGrowth).sort();
  const latestUserGrowth =
    sortedDates.length > 0
      ? data.usersGrowth[sortedDates[sortedDates.length - 1]]
      : undefined;

  const sortedVideoDates = Object.keys(data.videosGrowth).sort();
  const latestVideoGrowth =
    sortedVideoDates.length > 0
      ? data.videosGrowth[sortedVideoDates[sortedVideoDates.length - 1]]
      : undefined;

  // Tính % growth so với ngày trước (nếu có ít nhất 2 điểm)
  const userGrowthPct =
    sortedDates.length >= 2
      ? Math.round(
          ((data.usersGrowth[sortedDates[sortedDates.length - 1]] -
            data.usersGrowth[sortedDates[sortedDates.length - 2]]) /
            (data.usersGrowth[sortedDates[sortedDates.length - 2]] || 1)) *
            100,
        )
      : latestUserGrowth !== undefined
        ? 100
        : undefined;

  const videoGrowthPct =
    sortedVideoDates.length >= 2
      ? Math.round(
          ((data.videosGrowth[sortedVideoDates[sortedVideoDates.length - 1]] -
            data.videosGrowth[sortedVideoDates[sortedVideoDates.length - 2]]) /
            (data.videosGrowth[sortedVideoDates[sortedVideoDates.length - 2]] ||
              1)) *
            100,
        )
      : latestVideoGrowth !== undefined
        ? 100
        : undefined;

  // CSS variable colors for recharts (tailwind/daisy doesn't expose oklch easily, use safe fallbacks)
  // We'll use oklab-compatible hex that matches common daisy themes
  const primaryColor = "oklch(var(--p))";
  const secondaryColor = "oklch(var(--s))";

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">
          Thống kê tổng quan
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Tổng số người dùng"
          value={data.totalUsers}
          icon={<Users className="w-6 h-6" />}
          growth={userGrowthPct}
          color="primary"
        />
        <StatCard
          title="Tổng số video"
          value={data.totalVideos}
          icon={<Video className="w-6 h-6" />}
          growth={videoGrowthPct}
          color="secondary"
        />
      </div>

      {/* Combined Growth Chart */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-5">
          <h2 className="text-base font-semibold text-base-content mb-1">
            Tăng trưởng theo ngày
          </h2>
          <p className="text-xs text-base-content/50 mb-4">
            Số lượng người dùng và video mới theo ngày
          </p>

          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-base-content/40">
              <p>Không có dữ liệu tăng trưởng</p>
            </div>
          ) : (
            <div className="w-full h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorVideos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    strokeOpacity={0.08}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
                    formatter={(value) =>
                      value === "users" ? "Người dùng mới" : "Video mới"
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="users"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#colorUsers)"
                    dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="videos"
                    name="videos"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fill="url(#colorVideos)"
                    dot={{ fill: "#f43f5e", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Individual charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Users Growth */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-base-content">
                Người dùng mới
              </h2>
            </div>
            <p className="text-xs text-base-content/50 mb-4">
              Số người dùng đăng ký theo ngày
            </p>

            {Object.keys(data.usersGrowth).length === 0 ? (
              <div className="flex items-center justify-center h-52 text-base-content/40">
                <p>Không có dữ liệu</p>
              </div>
            ) : (
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData.filter((d) => d.users > 0 || true)}
                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      strokeOpacity={0.08}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                        fill: "currentColor",
                        opacity: 0.5,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "currentColor",
                        opacity: 0.5,
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      name="users"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Videos Growth */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-secondary" />
              <h2 className="text-base font-semibold text-base-content">
                Video mới
              </h2>
            </div>
            <p className="text-xs text-base-content/50 mb-4">
              Số video được đăng tải theo ngày
            </p>

            {Object.keys(data.videosGrowth).length === 0 ? (
              <div className="flex items-center justify-center h-52 text-base-content/40">
                <p>Không có dữ liệu</p>
              </div>
            ) : (
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      strokeOpacity={0.08}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                        fill: "currentColor",
                        opacity: 0.5,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "currentColor",
                        opacity: 0.5,
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="videos"
                      name="videos"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={{ fill: "#f43f5e", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Growth data table */}
      {chartData.length > 0 && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <h2 className="text-base font-semibold text-base-content mb-4">
              Chi tiết theo ngày
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th className="text-base-content/60">Ngày</th>
                    <th className="text-base-content/60 text-right">
                      Người dùng mới
                    </th>
                    <th className="text-base-content/60 text-right">
                      Video mới
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...chartData].reverse().map((row, i) => (
                    <tr key={i} className="hover">
                      <td className="text-base-content font-medium">
                        {row.date}
                      </td>
                      <td className="text-right">
                        {row.users > 0 ? (
                          <span className="badge badge-primary badge-outline badge-sm">
                            {row.users}
                          </span>
                        ) : (
                          <span className="text-base-content/30">—</span>
                        )}
                      </td>
                      <td className="text-right">
                        {row.videos > 0 ? (
                          <span className="badge badge-secondary badge-outline badge-sm">
                            {row.videos}
                          </span>
                        ) : (
                          <span className="text-base-content/30">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
