import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SearchInput } from "@/components/ui/search";
import { QuickActions } from "@/components/ui/quick-actions";
import { SettingsPanel } from "@/components/ui/settings";
import { BookOpen, TrendingUp, Award, Plus, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { useAccount } from "wagmi";
import StatsCards from "./dashboard/StatsCards";
import ReadingChart from "./dashboard/ReadingChart";
import CategoryChart from "./dashboard/CategoryChart";
import ProgressRing from "./dashboard/ProgressRing";
import AchievementCard from "./dashboard/AchievementCard";
import QuickActionsForm from "./dashboard/QuickActions";
import ReadingList from "./dashboard/ReadingList";

const Dashboard = () => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const quickActions = [
    {
      id: "add-category",
      label: "Add Category",
      description: "Add a new reading category",
      icon: Plus,
      color: "text-primary",
      onClick: () => setActiveTab("manage"),
    },
    {
      id: "view-stats",
      label: "View Statistics",
      description: "Check your reading analytics",
      icon: TrendingUp,
      color: "text-success",
      onClick: () => setActiveTab("analytics"),
    },
    {
      id: "decrypt-all",
      label: "Decrypt Data",
      description: "Unlock your encrypted preferences",
      icon: BookOpen,
      color: "text-warning",
      onClick: () => setActiveTab("manage"),
    },
    {
      id: "achievements",
      label: "Achievements",
      description: "View your reading milestones",
      icon: Award,
      color: "text-purple-500",
      onClick: () => setActiveTab("achievements"),
    },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-muted/20">
        <Card
          variant="gradient"
          className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-xl animate-bounce-in"
        >
          <CardHeader className="text-center pb-6">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-warning-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">Welcome to Liib Vault</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Connect your wallet to start managing your encrypted reading preferences with cutting-edge privacy technology
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Powered by FHEVM</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-8">
            <SkeletonCard />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Privacy-First Reading Analytics
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight animate-slide-in">
              Your Reading Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed animate-fade-in animation-delay-200">
              Track, analyze, and manage your encrypted reading preferences with beautiful visualizations and cutting-edge privacy technology
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Liib Vault
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">
                  {activeTab === "overview" ? "Dashboard" :
                   activeTab === "analytics" ? "Analytics" :
                   activeTab === "achievements" ? "Achievements" :
                   activeTab === "manage" ? "Management" :
                   activeTab === "settings" ? "Settings" : "Dashboard"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search and Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Search categories, books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              showClear={!!searchQuery}
              onClear={() => setSearchQuery("")}
            />
          </div>
          <QuickActions
            actions={quickActions}
            variant="list"
            className="sm:w-auto"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6 md:mb-12 h-auto bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg animate-fade-in animation-delay-300 p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm py-2.5 md:py-3 px-2 md:px-4 rounded-lg transition-all duration-normal hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:scale-105"
            >
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden xs:inline">Overview</span>
              <span className="xs:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm py-2.5 md:py-3 px-2 md:px-4 rounded-lg transition-all duration-normal hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:scale-105"
            >
              <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm py-2.5 md:py-3 px-2 md:px-4 rounded-lg transition-all duration-normal hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:scale-105"
            >
              <Award className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden xs:inline">Achievements</span>
              <span className="xs:hidden">Awards</span>
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm py-2.5 md:py-3 px-2 md:px-4 rounded-lg transition-all duration-normal hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:scale-105"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden xs:inline">Manage</span>
              <span className="xs:hidden">Add</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm py-2.5 md:py-3 px-2 md:px-4 rounded-lg transition-all duration-normal hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:scale-105"
            >
              <SettingsIcon className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden xs:inline">Settings</span>
              <span className="xs:hidden">Prefs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <StatsCards />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <CategoryChart />
              <QuickActions
                actions={quickActions}
                variant="grid"
                title="Quick Actions"
              />
            </div>
            <ReadingList searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 md:space-y-6">
            <StatsCards detailed />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <ReadingChart />
              <CategoryChart />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
              <ProgressRing />
              <AchievementCard />
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementCard />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <QuickActionsForm expanded />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default Dashboard;
