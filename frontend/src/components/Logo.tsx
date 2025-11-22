const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.svg" alt="Liib Vault" className="h-8 w-8" />
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Liib Vault
      </span>
    </div>
  );
};

export default Logo;

