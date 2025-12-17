import Logo from "@/components/Logo";
import Dashboard from "@/components/Dashboard";
import WalletConnect from "@/components/WalletConnect";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="pt-20">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;

