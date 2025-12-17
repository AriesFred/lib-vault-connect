import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonStats } from "@/components/ui/skeleton";
import { BookOpen, Hash, TrendingUp, Lock, Eye, EyeOff } from "lucide-react";
import { useReadingPreference } from "@/hooks/useReadingPreference";
import { useAccount } from "wagmi";

interface StatsCardsProps {
  detailed?: boolean;
}

const StatsCards = ({ detailed = false }: StatsCardsProps) => {
  const { isConnected } = useAccount();
  const { userCategories, decryptedCounts, encryptedCounts, isLoading } = useReadingPreference();

  if (!isConnected) return null;

  if (isLoading) {
    return <SkeletonStats />;
  }

  const totalCategories = userCategories.length;
  const decryptedCategories = Array.from(decryptedCounts.keys()).length;
  const totalDecryptedBooks = Array.from(decryptedCounts.values()).reduce((sum, count) => sum + count, 0);
  const encryptedCategories = Array.from(encryptedCounts.keys()).filter(id => !decryptedCounts.has(id)).length;

  const stats = [
    {
      title: "Total Categories",
      value: totalCategories,
      icon: BookOpen,
      description: "Reading categories explored",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
      trend: totalCategories > 0 ? "up" : null,
    },
    {
      title: "Decrypted Categories",
      value: decryptedCategories,
      icon: Eye,
      description: "Categories with decrypted counts",
      gradient: "from-success to-success/80",
      bgColor: "bg-success/10",
      iconColor: "text-success",
      trend: decryptedCategories > 0 ? "up" : null,
    },
    {
      title: "Encrypted Categories",
      value: encryptedCategories,
      icon: EyeOff,
      description: "Categories with encrypted data only",
      gradient: "from-warning to-warning/80",
      bgColor: "bg-warning/10",
      iconColor: "text-warning",
      trend: null,
    },
    {
      title: "Total Books",
      value: totalDecryptedBooks,
      icon: Hash,
      description: "Books counted across decrypted categories",
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600",
      trend: totalDecryptedBooks > 0 ? "up" : null,
    },
  ];

  const StatCard = ({ stat, index }: { stat: typeof stats[0]; index: number }) => (
    <Card
      variant="elevated"
      hover={true}
      className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card-muted/50"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/5 opacity-50" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${stat.bgColor} ring-1 ring-border/20`}>
            <stat.icon className={`w-5 h-5 ${stat.iconColor} group-hover:scale-110 transition-transform duration-fast`} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {stat.value}
            </div>
            {stat.trend && (
              <div className="flex items-center text-success text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardTitle className="text-sm font-semibold mb-1">{stat.title}</CardTitle>
        <p className="text-xs text-muted-foreground leading-relaxed">{stat.description}</p>

        {/* Progress indicator for completion */}
        {stat.title === "Decrypted Categories" && totalCategories > 0 && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round((decryptedCategories / totalCategories) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className="bg-gradient-to-r from-success to-success/80 h-1 rounded-full transition-all duration-normal"
                style={{ width: `${(decryptedCategories / totalCategories) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-normal rounded-xl" />
    </Card>
  );

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
};

export default StatsCards;
