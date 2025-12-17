import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonChart } from "@/components/ui/skeleton";
import { EmptyChart } from "@/components/ui/empty-state";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieChartIcon, TrendingUp, BookOpen, Eye } from "lucide-react";
import { useReadingPreference } from "@/hooks/useReadingPreference";
import { useAccount } from "wagmi";

// Reading categories mapping
const CATEGORIES: Record<number, string> = {
  1: "Science Fiction",
  2: "Mystery",
  3: "Romance",
  4: "Fantasy",
  5: "Thriller",
  6: "Non-Fiction",
  7: "Biography",
  8: "History",
};

// Enhanced color palette using design system
const COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))",
  "hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))"
];

const CategoryChart = () => {
  const { isConnected } = useAccount();
  const { userCategories, decryptedCounts, isLoading } = useReadingPreference();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (isLoading) {
    return <SkeletonChart />;
  }

  if (!isConnected || userCategories.length === 0) {
    return (
      <Card variant="elevated" hover={true} className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PieChartIcon className="w-5 h-5 text-primary" />
            </div>
            Reading Categories
          </CardTitle>
          <CardDescription>
            Distribution of your reading preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center px-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center animate-bounce-in">
                <PieChartIcon className="w-10 h-10 text-primary/60" />
              </div>
              <h3 className="font-semibold mb-3 text-lg">No chart data available</h3>
              <p className="text-sm leading-relaxed max-w-sm">
                Add and decrypt some reading preferences to visualize your reading distribution
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                <span>Start by adding your favorite genres</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData = userCategories
    .filter(categoryId => decryptedCounts.has(categoryId))
    .map((categoryId, index) => ({
      name: CATEGORIES[categoryId] || `Category ${categoryId}`,
      value: decryptedCounts.get(categoryId) || 0,
      color: COLORS[index % COLORS.length],
      categoryId,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value); // Sort by value descending

  const totalBooks = chartData.reduce((sum, item) => sum + item.value, 0);
  const topCategory = chartData.length > 0 ? chartData[0] : null;

  if (chartData.length === 0) {
    return <EmptyChart />;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalBooks) * 100).toFixed(1);
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            <p className="font-semibold text-foreground">{data.payload.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {data.value} books
            </p>
            <p className="text-xs text-muted-foreground">
              {percentage}% of total collection
            </p>
          </div>
          {data.payload.name === topCategory?.name && (
            <div className="mt-2 flex items-center gap-1 text-xs text-success">
              <TrendingUp className="w-3 h-3" />
              Your favorite genre
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card variant="elevated" hover={true} className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <PieChartIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          Reading Categories
        </CardTitle>
        <CardDescription className="flex items-center gap-4">
          <span>Distribution of your {totalBooks} decrypted books</span>
          {topCategory && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Top:</span>
              <span className="font-medium text-foreground">{topCategory.name}</span>
              <span className="text-muted-foreground">({topCategory.value} books)</span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={activeIndex !== null ? 110 : 100}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              onMouseEnter={handlePieEnter}
              onMouseLeave={handlePieLeave}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={activeIndex === index ? entry.color : "transparent"}
                  strokeWidth={activeIndex === index ? 3 : 0}
                  style={{
                    filter: activeIndex === index ? "brightness(1.1)" : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={40}
              formatter={(value, entry: any) => (
                <span
                  className="text-sm cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    color: activeIndex !== null && entry.payload.categoryId === chartData[activeIndex]?.categoryId
                      ? entry.color
                      : entry.color
                  }}
                >
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{chartData.length}</div>
            <div className="text-sm text-muted-foreground">Active Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{totalBooks}</div>
            <div className="text-sm text-muted-foreground">Total Books</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
