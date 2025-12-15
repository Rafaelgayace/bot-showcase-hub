import { Server, Users, MessageCircle, Sparkles } from "lucide-react";

const stats = [
  {
    icon: Server,
    value: "15,000+",
    label: "Servidores",
  },
  {
    icon: Users,
    value: "2M+",
    label: "Usuários",
  },
  {
    icon: MessageCircle,
    value: "50M+",
    label: "Comandos/mês",
  },
  {
    icon: Sparkles,
    value: "99.9%",
    label: "Uptime",
  },
];

export const StatsSection = () => {
  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="glass rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
