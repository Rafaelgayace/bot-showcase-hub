import { Bot, Zap, Shield, Users, MessageSquare, Settings } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Moderação Inteligente",
    description: "Sistema de moderação automática com detecção de spam, palavras proibidas e flood em tempo real.",
  },
  {
    icon: Zap,
    title: "Comandos Rápidos",
    description: "Mais de 100 comandos otimizados para diversão, utilidades e gerenciamento do servidor.",
  },
  {
    icon: Shield,
    title: "Anti-Raid Protection",
    description: "Proteção avançada contra invasões e ataques coordenados ao seu servidor.",
  },
  {
    icon: Users,
    title: "Sistema de Welcome",
    description: "Mensagens personalizadas de boas-vindas com imagens, cargos automáticos e muito mais.",
  },
  {
    icon: MessageSquare,
    title: "Logs Completos",
    description: "Registre todas as ações do servidor: edições, exclusões, entradas e saídas de membros.",
  },
  {
    icon: Settings,
    title: "Dashboard Web",
    description: "Configure tudo pelo navegador com nosso painel intuitivo e responsivo.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="section-padding relative" id="features">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm tracking-wider uppercase">
            Recursos
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Tudo que seu servidor <span className="text-gradient">precisa</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Funcionalidades poderosas desenvolvidas para transformar a experiência do seu servidor Discord.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass rounded-xl p-6 hover-lift group cursor-default"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
