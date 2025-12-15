import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl opacity-30 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Pronto para <span className="text-gradient">revolucionar</span> seu servidor?
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
          Junte-se a milhares de comunidades que já confiam no NexusBot para moderação, 
          entretenimento e gerenciamento completo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="xl" className="group">
            Adicionar ao Discord
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="glass" size="xl">
            Servidor de Suporte
            <ExternalLink className="w-5 h-5" />
          </Button>
        </div>
        
        <p className="text-muted-foreground text-sm mt-6">
          ✓ Grátis para sempre &nbsp;&nbsp; ✓ Sem cartão de crédito &nbsp;&nbsp; ✓ Setup instantâneo
        </p>
      </div>
    </section>
  );
};
