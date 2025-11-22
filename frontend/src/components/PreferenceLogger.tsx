import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Lock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { useReadingPreference } from "@/hooks/useReadingPreference";

// Reading categories
const CATEGORIES = [
  { id: 1, name: "Science Fiction" },
  { id: 2, name: "Mystery" },
  { id: 3, name: "Romance" },
  { id: 4, name: "Fantasy" },
  { id: 5, name: "Thriller" },
  { id: 6, name: "Non-Fiction" },
  { id: 7, name: "Biography" },
  { id: 8, name: "History" },
];

const PreferenceLogger = () => {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { addCategoryPreference, isLoading, fhevmStatus } = useReadingPreference();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [count, setCount] = useState<number>(1);

  const handleAddPreference = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add preferences.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        title: "Category Required",
        description: "Please select a reading category.",
        variant: "destructive",
      });
      return;
    }

    try {
      const categoryId = parseInt(selectedCategory);
      await addCategoryPreference(categoryId, count);

      toast({
        title: "Preference Added Successfully! 🎉",
        description: `Category preference encrypted and recorded on the blockchain.`,
      });

      setSelectedCategory("");
      setCount(1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add preference",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Add Reading Preference
        </CardTitle>
        <CardDescription className="text-base">
          Select a category and add your encrypted reading preference
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select a reading category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Count</label>
          <input
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background/50"
          />
          <p className="text-xs text-muted-foreground">
            Number of books in this category
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Encryption:</span>
            <span className="font-mono text-foreground">FHE (euint32)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Your preference will be encrypted before blockchain storage
          </p>
        </div>

        <Button
          onClick={handleAddPreference}
          disabled={isLoading || !isConnected || !selectedCategory || fhevmStatus !== 'ready'}
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground"
          size="lg"
        >
          {isLoading || fhevmStatus !== 'ready' ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {isLoading ? 'Encrypting & Submitting...' : 'Initializing FHEVM...'}
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              {isConnected ? (selectedCategory ? "Add Preference" : "Select Category First") : "Connect Wallet First"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PreferenceLogger;

