import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyReadingList } from "@/components/ui/empty-state";
import { Lock, Unlock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { useReadingPreference } from "@/hooks/useReadingPreference";

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

interface ReadingListProps {
  searchQuery?: string;
}

const ReadingList = ({ searchQuery = "" }: ReadingListProps) => {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { userCategories, decryptedCounts, decryptCategoryCount, isLoading, fhevmStatus } = useReadingPreference();

  // Filter categories based on search query
  const filteredCategories = userCategories.filter(categoryId => {
    if (!searchQuery) return true;
    const categoryName = CATEGORIES[categoryId] || `Category ${categoryId}`;
    return categoryName.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
    return null;
  }

  if (userCategories.length === 0) {
    return <EmptyReadingList />;
  }

  return (
    <Card variant="elevated" hover={false} className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Eye className="w-5 h-5 text-primary-foreground" />
          </div>
          Your Reading Preferences
        </CardTitle>
        <CardDescription>
          View and decrypt your encrypted reading categories ({userCategories.length} total{searchQuery && `, ${filteredCategories.length} shown`})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((categoryId, index) => {
            const categoryName = CATEGORIES[categoryId] || `Category ${categoryId}`;
            const decryptedCount = decryptedCounts.get(categoryId);
            const isDecrypted = decryptedCount !== undefined;

            return (
              <div
                key={categoryId}
                className={`group relative p-5 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card-muted/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/20 transition-all duration-normal cursor-pointer overflow-hidden animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-normal ${
                  isDecrypted
                    ? 'from-success/5 to-success/10'
                    : 'from-primary/5 to-primary/10'
                }`} />
                {/* Card content */}
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-2 text-foreground group-hover:text-primary transition-colors duration-normal">
                        {categoryName}
                      </h3>
                      <div className="flex items-center gap-2">
                        {isDecrypted ? (
                          <>
                            <div className="p-1 bg-success/10 rounded-full">
                              <Unlock className="w-3 h-3 text-success" />
                            </div>
                            <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                              Decrypted
                            </Badge>
                          </>
                        ) : (
                          <>
                            <div className="p-1 bg-muted rounded-full">
                              <Lock className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <Badge variant="outline" className="text-xs border-border">
                              Encrypted
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isDecrypted ? (
                      <div className="text-center p-4 bg-success/5 rounded-lg border border-success/10">
                        <div className="text-3xl font-bold text-success mb-1 animate-bounce-in">
                          {decryptedCount}
                        </div>
                        <p className="text-xs text-success/70 font-medium">books read</p>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-muted/50 rounded-lg border border-border/50">
                        <div className="text-2xl font-bold text-muted-foreground mb-1">[Encrypted]</div>
                        <p className="text-xs text-muted-foreground">count hidden</p>
                      </div>
                    )}

                    <Button
                      onClick={() => handleDecrypt(categoryId)}
                      disabled={isLoading || fhevmStatus !== 'ready'}
                      variant={isDecrypted ? "outline" : "gradient"}
                      size="sm"
                      className="w-full group/btn relative overflow-hidden"
                    >
                      {isDecrypted ? (
                        <>
                          <Unlock className="w-4 h-4 mr-2 text-success" />
                          <span className="relative z-10">Already Decrypted</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-fast" />
                          <span className="relative z-10">Decrypt Now</span>
                        </>
                      )}

                      {/* Button hover effect */}
                      {!isDecrypted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-normal" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Privacy Note</p>
              <p>
                Your reading preferences are stored encrypted on the blockchain.
                Only you can decrypt and view your actual book counts using your private key.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingList;
