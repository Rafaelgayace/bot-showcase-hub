import { MousePointer, Settings2, Rocket } from "lucide-react";

const steps = [
  {
    icon: MousePointer,
    step: "01",
    title: "Adicione ao servidor",
    description: "Clique no botão e autorize o bot no seu servidor Discord em poucos segundos.",
  },
  {
    icon: Settings2,
    step: "02",
    title: "Configure do seu jeito",
    description: "Use comandos simples ou acesse o dashboard web para personalizar todas as funções.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Aproveite!",
    description: "Seu servidor está pronto! Explore todos os recursos e eleve a experiência dos membros.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="section-padding" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-semibold text-sm tracking-wider uppercase">
            Como funciona
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Simples como <span className="text-gradient">1, 2, 3</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Configure em menos de um minuto e transforme seu servidor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center">
                    <item.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
