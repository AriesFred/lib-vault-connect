import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { useReadingPreference } from "@/hooks/useReadingPreference";

// Reading categories
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

const PreferenceViewer = () => {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { userCategories, decryptedCounts, decryptCategoryCount, isLoading, fhevmStatus, message } = useReadingPreference();

  const handleDecrypt = async (categoryId: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to decrypt preferences.",
        variant: "destructive",
      });
      return;
    }

    try {
      await decryptCategoryCount(categoryId);
      toast({
        title: "Decryption Successful! 🔓",
        description: `Category ${CATEGORIES[categoryId]} count decrypted.`,
      });
    } catch (error: any) {
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt preference",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="border-border bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Reading Preferences
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your encrypted reading preferences
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (userCategories.length === 0) {
    return (
      <Card className="border-border bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Reading Preferences
          </CardTitle>
          <CardDescription>
            No preferences added yet. Add your first reading preference above.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Your Reading Preferences
        </CardTitle>
        <CardDescription>
          View and decrypt your encrypted reading category preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div className="p-3 rounded-md bg-muted/50 text-sm text-muted-foreground">
            {message}
          </div>
        )}

        <div className="space-y-3">
          {userCategories.map((categoryId) => {
            const categoryName = CATEGORIES[categoryId] || `Category ${categoryId}`;
            const decryptedCount = decryptedCounts.get(categoryId);
            const isDecrypted = decryptedCount !== undefined;

            return (
              <div
                key={categoryId}
                className="p-4 rounded-lg border border-border bg-background/50 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{categoryName}</span>
                    {isDecrypted ? (
                      <Unlock className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  {isDecrypted ? (
                    <p className="text-sm text-muted-foreground">
                      Decrypted Count: <span className="font-mono text-foreground font-semibold">{decryptedCount}</span> books
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Encrypted Count: <span className="font-mono">[Encrypted]</span>
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleDecrypt(categoryId)}
                  disabled={isLoading || fhevmStatus !== 'ready'}
                  variant={isDecrypted ? "outline" : "default"}
                  size="sm"
                >
                  {isDecrypted ? "Re-decrypt" : "Decrypt"}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-md bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> The system can count encrypted preferences (e.g., "Encrypted Count: Science Fiction = 5 books") 
            without revealing individual book titles or details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferenceViewer;

