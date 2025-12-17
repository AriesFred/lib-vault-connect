import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, CheckCircle } from "lucide-react";
import { useReadingPreference } from "@/hooks/useReadingPreference";
import { useAccount } from "wagmi";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const AchievementCard = () => {
  const { isConnected } = useAccount();
  const { userCategories, decryptedCounts } = useReadingPreference();

  if (!isConnected) return null;

  const totalCategories = userCategories.length;
  const decryptedCount = decryptedCounts.size;
  const totalDecryptedBooks = Array.from(decryptedCounts.values()).reduce((sum, count) => sum + count, 0);

  const achievements: Achievement[] = [
    {
      id: "first-category",
      title: "First Steps",
      description: "Add your first reading category",
      icon: "🌱",
      requirement: "Add 1 category",
      isUnlocked: totalCategories >= 1,
    },
    {
      id: "explorer",
      title: "Genre Explorer",
      description: "Explore 3 different reading categories",
      icon: "🗺️",
      requirement: "Add 3 categories",
      isUnlocked: totalCategories >= 3,
    },
    {
      id: "bookworm",
      title: "Bookworm",
      description: "Record 10 books across your categories",
      icon: "📚",
      requirement: "Record 10 total books",
      isUnlocked: totalDecryptedBooks >= 10,
      progress: totalDecryptedBooks,
      maxProgress: 10,
    },
    {
      id: "decryptor",
      title: "Master Decryptor",
      description: "Decrypt all your reading categories",
      icon: "🔓",
      requirement: "Decrypt all categories",
      isUnlocked: totalCategories > 0 && decryptedCount === totalCategories && totalCategories >= 3,
    },
    {
      id: "collector",
      title: "Data Collector",
      description: "Build a collection of 25 books",
      icon: "🏆",
      requirement: "Record 25 total books",
      isUnlocked: totalDecryptedBooks >= 25,
      progress: totalDecryptedBooks,
      maxProgress: 25,
    },
    {
      id: "privacy-advocate",
      title: "Privacy Advocate",
      description: "Maintain encrypted data privacy",
      icon: "🛡️",
      requirement: "Keep data encrypted",
      isUnlocked: totalCategories > decryptedCount && totalCategories >= 5,
    },
  ];

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <Card className="border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Reading Achievements
        </CardTitle>
        <CardDescription>
          Unlock achievements as you explore your reading data ({unlockedCount}/{achievements.length} unlocked)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all ${
                achievement.isUnlocked
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${achievement.isUnlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium text-sm ${
                      achievement.isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </h3>
                    {achievement.isUnlocked ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-xs mb-2 ${
                    achievement.isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
                  }`}>
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={achievement.isUnlocked ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {achievement.requirement}
                    </Badge>
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {unlockedCount === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start your reading journey to unlock achievements!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
