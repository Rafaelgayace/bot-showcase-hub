import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-20 animate-pulse-glow" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl opacity-20 animate-pulse-glow" style={{ animationDelay: "1s" }} />
      
      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-up">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">
            Mais de <span className="text-foreground font-semibold">15.000 servidores</span> já confiam
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          O bot definitivo para
          <br />
          <span className="text-gradient">seu servidor Discord</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "200ms" }}>
          Moderação inteligente, comandos divertidos, sistema de welcome, logs completos 
          e muito mais. Tudo em um único bot gratuito e poderoso.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "300ms" }}>
          <Button variant="hero" size="xl" className="group">
            Adicionar ao Discord
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="glass" size="xl">
            Ver comandos
          </Button>
        </div>
        
        {/* Floating bot preview */}
        <div className="mt-16 relative animate-fade-up" style={{ animationDelay: "400ms" }}>
          <div className="glass rounded-2xl p-6 max-w-md mx-auto animate-float">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🤖</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">NexusBot</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary font-medium">BOT</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Olá! 👋 Estou pronto para turbinar seu servidor. Use <span className="text-accent font-mono">/help</span> para ver todos os comandos!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
