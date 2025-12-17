import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Trophy } from "lucide-react";
import { useReadingPreference } from "@/hooks/useReadingPreference";
import { useAccount } from "wagmi";

const ProgressRing = () => {
  const { isConnected } = useAccount();
  const { userCategories, decryptedCounts } = useReadingPreference();

  if (!isConnected || userCategories.length === 0) return null;

  const decryptedCount = decryptedCounts.size;
  const totalCount = userCategories.length;
  const percentage = totalCount > 0 ? Math.round((decryptedCount / totalCount) * 100) : 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-blue-500";
    if (percentage >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 80) return "stroke-green-500";
    if (percentage >= 60) return "stroke-blue-500";
    if (percentage >= 40) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  const getAchievementLevel = (percentage: number) => {
    if (percentage >= 100) return { level: "Master Decrypter", icon: "🏆", color: "text-yellow-500" };
    if (percentage >= 80) return { level: "Privacy Expert", icon: "⭐", color: "text-blue-500" };
    if (percentage >= 60) return { level: "Data Explorer", icon: "🔍", color: "text-green-500" };
    if (percentage >= 40) return { level: "Curious Reader", icon: "📚", color: "text-purple-500" };
    return { level: "Privacy Learner", icon: "🌱", color: "text-gray-500" };
  };

  const achievement = getAchievementLevel(percentage);

  return (
    <Card className="border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Decryption Progress
        </CardTitle>
        <CardDescription>
          Your journey through encrypted reading data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Progress Ring */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted-foreground/20"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`${getProgressBgColor(percentage)} transition-all duration-500 ease-in-out`}
              />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${getProgressColor(percentage)}`}>
                {percentage}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              {decryptedCount} of {totalCount} categories decrypted
            </p>
          </div>

          {/* Achievement Badge */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <span className="text-2xl">{achievement.icon}</span>
            <div className="text-left">
              <p className={`font-medium text-sm ${achievement.color}`}>
                {achievement.level}
              </p>
              <p className="text-xs text-muted-foreground">
                {percentage >= 100 ? "All data decrypted!" :
                 percentage >= 80 ? "Almost there!" :
                 percentage >= 60 ? "Making great progress!" :
                 "Keep exploring your data!"}
              </p>
            </div>
          </div>

          {/* Next milestone */}
          {percentage < 100 && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {totalCount - decryptedCount} more to reach 100%
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressRing;
