import { BookOpen, Lock, BarChart3, Shield, Sparkles } from "lucide-react";

const Hero = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Category Selection",
      description: "Choose your reading categories privately with full control",
      gradient: "from-blue-500 to-blue-600",
      delay: "animation-delay-100",
    },
    {
      icon: Shield,
      title: "FHE Encryption",
      description: "Your preferences are encrypted on-chain with mathematical privacy",
      gradient: "from-success to-success/80",
      delay: "animation-delay-200",
    },
    {
      icon: BarChart3,
      title: "Private Analytics",
      description: "View encrypted statistics without revealing your personal data",
      gradient: "from-purple-500 to-purple-600",
      delay: "animation-delay-300",
    },
  ];

  return (
    <section className="relative py-12 md:py-20 lg:py-24 px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow animation-delay-500" />

      <div className="container mx-auto max-w-6xl relative">
        {/* Main heading */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Privacy-First Reading Analytics
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 md:mb-8 leading-tight animate-slide-in">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Encrypted Reading
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Preferences
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4 animate-fade-in animation-delay-200">
            Store and manage your reading preferences with fully homomorphic encryption.
            <span className="hidden sm:inline"> Your data remains private while enabling powerful analytics.</span>
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 animate-fade-in animation-delay-300">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-normal hover:shadow-xl hover:-translate-y-1 ${feature.delay}`}
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />

              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex p-3 md:p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-normal`}>
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-foreground group-hover:text-primary transition-colors duration-normal">
                  {feature.title}
                </h3>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover indicator */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-12 md:mt-16 lg:mt-20 text-center animate-fade-in animation-delay-500">
          <div className="inline-flex items-center gap-6 px-6 md:px-8 py-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">100%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Private</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-success">FHE</div>
              <div className="text-xs md:text-sm text-muted-foreground">Powered</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-warning">∞</div>
              <div className="text-xs md:text-sm text-muted-foreground">Analytics</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

