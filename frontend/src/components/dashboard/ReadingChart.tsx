import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";
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

const ReadingChart = () => {
  const { isConnected } = useAccount();
  const { userCategories, decryptedCounts, encryptedCounts } = useReadingPreference();

  if (!isConnected || userCategories.length === 0) {
    return (
      <Card className="border-border bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Reading Statistics
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your reading habits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="font-medium mb-2">No statistics available</h3>
              <p className="text-sm">Add reading preferences and decrypt them to see detailed statistics and comparisons</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart - show decrypted vs encrypted status
  const chartData = userCategories.map(categoryId => {
    const categoryName = CATEGORIES[categoryId] || `Category ${categoryId}`;
    const decryptedCount = decryptedCounts.get(categoryId) || 0;
    const hasEncryptedData = encryptedCounts.has(categoryId);

    return {
      name: categoryName.length > 12 ? categoryName.substring(0, 12) + "..." : categoryName,
      fullName: categoryName,
      decrypted: decryptedCount,
      hasEncryptedData: hasEncryptedData,
      status: decryptedCount > 0 ? "Decrypted" : (hasEncryptedData ? "Encrypted" : "Not Set"),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.fullName}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} books
            </p>
          ))}
          <p className="text-xs text-muted-foreground mt-1">
            Status: {data.status}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Reading Statistics
        </CardTitle>
        <CardDescription>
          Comparison of encrypted vs decrypted reading counts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="decrypted"
              fill="#82ca9d"
              name="Decrypted Books"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#82ca9d] rounded"></div>
            <span>Decrypted Books</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 border-2 border-dashed border-[#8884d8] rounded"></div>
            <span>Encrypted (Hidden)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingChart;
