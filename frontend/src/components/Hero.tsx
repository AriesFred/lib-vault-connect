import { BookOpen, Lock, BarChart3 } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Encrypted Reading Preferences
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Store and manage your reading preferences with fully homomorphic encryption
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-lg bg-card border border-border">
            <BookOpen className="w-8 h-8 text-primary mb-4 mx-auto" />
            <h3 className="font-semibold mb-2">Category Selection</h3>
            <p className="text-sm text-muted-foreground">
              Choose your reading categories privately
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border border-border">
            <Lock className="w-8 h-8 text-primary mb-4 mx-auto" />
            <h3 className="font-semibold mb-2">FHE Encryption</h3>
            <p className="text-sm text-muted-foreground">
              Your preferences are encrypted on-chain
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border border-border">
            <BarChart3 className="w-8 h-8 text-primary mb-4 mx-auto" />
            <h3 className="font-semibold mb-2">Private Statistics</h3>
            <p className="text-sm text-muted-foreground">
              View encrypted counts without revealing data
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

