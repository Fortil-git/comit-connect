import { useState, useEffect } from "react";
import { X, CalendarClock, Calendar, ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hasActiveSession, startComiteSession } from "@/utils/comiteSession";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ComiteFutur {
  id: string;
  date: string;
  entite: string;
  formData: any;
}

export const ComiteToast = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [comitesFuturs, setComitesFuturs] = useState<ComiteFutur[]>([]);
  const [sessionActive, setSessionActive] = useState(hasActiveSession());

  useEffect(() => {
    const load = () => {
      const active = hasActiveSession();
      setSessionActive(active);
      if (active) return;

      // Réafficher quand on revient sans session
      setDismissed(false);

      api.getComites().then(comites => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futurs = comites
          .filter((c: any) => {
            const d = new Date(c.date);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          })
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setComitesFuturs(futurs);
      }).catch(() => {});
    };

    load();

    window.addEventListener("comite-session-changed", load);
    return () => window.removeEventListener("comite-session-changed", load);
  }, []);

  if (sessionActive || dismissed || comitesFuturs.length === 0) return null;

  const prochain = comitesFuturs[0];
  const autres = comitesFuturs.slice(1);

  const getDaysUntil = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const daysUntil = getDaysUntil(prochain.date);

  const handleOpen = async (comite: ComiteFutur) => {
    if (hasActiveSession()) {
      toast.error("Un comité est déjà ouvert. Veuillez le terminer d'abord.");
      return;
    }
    await startComiteSession(comite.formData, comite.id);
    window.dispatchEvent(new Event("comite-session-changed"));
    toast.success(
      `Comité du ${new Date(comite.date).toLocaleDateString("fr-FR")} ouvert !`,
      { position: "top-center" }
    );
    navigate("/dashboard");
  };

  const urgencyLabel =
    daysUntil === 0
      ? "Aujourd'hui"
      : daysUntil === 1
        ? "Demain"
        : `Dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`;

  const urgencyColor =
    daysUntil === 0
      ? "bg-red-500"
      : daysUntil === 1
        ? "bg-orange-500"
        : daysUntil <= 7
          ? "bg-amber-500"
          : "bg-blue-500";

  return (
    <div className="fixed top-4 right-4 z-50 w-[360px] animate-fade-in">
      <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-border/50">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-foreground">
              Comités à venir
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {comitesFuturs.length}
            </Badge>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prochain comité */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Prochain comité
            </span>
            <Badge className={`${urgencyColor} text-white text-[10px] px-1.5 py-0`}>
              {urgencyLabel}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-medium capitalize">{formatDate(prochain.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>{prochain.entite}</span>
          </div>

          <Button
            size="sm"
            onClick={() => handleOpen(prochain)}
            className="w-full mt-1 bg-gradient-to-r from-primary to-secondary gap-2"
          >
            Préparer ce comité
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Autres comités futurs */}
        {autres.length > 0 && (
          <div className="border-t border-border/50 px-4 py-2.5 space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Autres comités planifiés
            </span>
            {autres.slice(0, 3).map((comite) => {
              const days = getDaysUntil(comite.date);
              return (
                <div
                  key={comite.id}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span className="capitalize">{formatDate(comite.date)}</span>
                    <span className="text-muted-foreground/60">-</span>
                    <span>{comite.entite}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
                    {days}j
                  </Badge>
                </div>
              );
            })}
            {autres.length > 3 && (
              <button
                onClick={() => navigate("/comites-futurs")}
                className="text-[11px] text-primary hover:underline"
              >
                + {autres.length - 3} autre{autres.length - 3 > 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
