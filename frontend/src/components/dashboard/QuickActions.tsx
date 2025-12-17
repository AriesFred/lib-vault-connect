import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { Plus, Zap, BookOpen, Loader2 } from "lucide-react";
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

interface QuickActionsProps {
  expanded?: boolean;
}

const QuickActions = ({ expanded = false }: QuickActionsProps) => {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { addCategoryPreference, batchAddPreferences, isLoading, fhevmStatus, userCategories, decryptedCounts } = useReadingPreference();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [count, setCount] = useState<number>(1);
  const [batchItems, setBatchItems] = useState<Array<{ categoryId: number; count: number }>>([]);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);

  const handleQuickAdd = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
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
        title: "Success! 🎉",
        description: `Added ${count} book${count > 1 ? 's' : ''} to ${CATEGORIES.find(c => c.id === categoryId)?.name}`,
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

  const addToBatch = () => {
    if (!selectedCategory) {
      toast({
        title: "Category Required",
        description: "Please select a category first.",
        variant: "destructive",
      });
      return;
    }

    const categoryId = parseInt(selectedCategory);
    const existingIndex = batchItems.findIndex(item => item.categoryId === categoryId);

    if (existingIndex >= 0) {
      // Update existing item
      const newBatchItems = [...batchItems];
      newBatchItems[existingIndex].count += count;
      setBatchItems(newBatchItems);
    } else {
      // Add new item
      setBatchItems([...batchItems, { categoryId, count }]);
    }

    toast({
      title: "Added to Batch",
      description: `Added ${count} book${count > 1 ? 's' : ''} to batch`,
    });

    setSelectedCategory("");
    setCount(1);
  };

  const removeFromBatch = (index: number) => {
    setBatchItems(batchItems.filter((_, i) => i !== index));
  };

  const handleBatchSubmit = async () => {
    if (batchItems.length === 0) return;

    try {
      const categoryIds = batchItems.map(item => item.categoryId);
      const counts = batchItems.map(item => item.count);

      await batchAddPreferences(categoryIds, counts);

      toast({
        title: "Batch Success! 🎉",
        description: `Added ${batchItems.length} categories in batch`,
      });

      setBatchItems([]);
      setIsBatchDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Batch Error",
        description: error.message || "Failed to submit batch",
        variant: "destructive",
      });
    }
  };


  if (!isConnected) {
    return null;
  }

  if (expanded) {
    return (
      <div className="space-y-6">
        {/* Quick Add Section */}
        <Card variant="elevated" hover={true} className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              Quick Add Preference
            </CardTitle>
            <CardDescription>
              Add a single reading preference with FHE encryption
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Reading Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a genre" />
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
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Number of Books</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter book count"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleQuickAdd}
                disabled={isLoading || !selectedCategory || fhevmStatus !== 'ready'}
                className="w-full h-12 text-base font-medium relative overflow-hidden group"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    Encrypting and adding to blockchain...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-normal" />
                    Add Reading Preference
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your data will be encrypted using FHE technology
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Batch Operations */}
        <Card variant="elevated" hover={true} className="animate-fade-in animation-delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              Batch Operations
            </CardTitle>
            <CardDescription>
              Add multiple preferences in a single FHE-encrypted transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="number"
                min="1"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 rounded-md border border-input bg-background text-center"
                placeholder="1"
              />
              <Button onClick={addToBatch} variant="outline" size="sm">
                Add
              </Button>
            </div>

            {batchItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Batch Items ({batchItems.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {batchItems.map((item, index) => {
                    const category = CATEGORIES.find(c => c.id === item.categoryId);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <span>{category?.name}: {item.count} books</span>
                        <Button
                          onClick={() => removeFromBatch(index)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <Button
                  onClick={handleBatchSubmit}
                  disabled={isLoading || fhevmStatus !== 'ready'}
                  className="w-full"
                >
                  {isLoading ? "Submitting Batch..." : `Submit Batch (${batchItems.length} items)`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    );
  }

  // Compact version for dashboard overview
  return (
    <Card className="border-border bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-medium">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select" />
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
          <div className="space-y-1">
            <label className="text-xs font-medium">Count</label>
            <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full h-8 px-2 text-sm rounded-md border border-input bg-background"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleQuickAdd}
            disabled={isLoading || !selectedCategory || fhevmStatus !== 'ready'}
            size="sm"
            className="flex-1"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>

          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Zap className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batch Operations</DialogTitle>
                <DialogDescription>
                  Add multiple preferences in a single transaction
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="number"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-2 rounded-md border border-input bg-background"
                  />
                  <Button onClick={addToBatch} size="sm">Add</Button>
                </div>

                {batchItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Batch Items ({batchItems.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {batchItems.map((item, index) => {
                        const category = CATEGORIES.find(c => c.id === item.categoryId);
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span>{category?.name}: {item.count} books</span>
                            <Button onClick={() => removeFromBatch(index)} variant="ghost" size="sm">×</Button>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      onClick={handleBatchSubmit}
                      disabled={isLoading || fhevmStatus !== 'ready'}
                      className="w-full"
                    >
                      Submit Batch ({batchItems.length} items)
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
