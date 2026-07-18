import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

fig, ax = plt.subplots(figsize=(13, 7.5))
ax.set_xlim(0, 13); ax.set_ylim(0, 7.5)
ax.axis("off")

def box(x, y, w, h, text, color, fontsize=10.5, textcolor="white"):
    b = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.06,rounding_size=0.12",
                        linewidth=1.4, edgecolor="#1e293b", facecolor=color)
    ax.add_patch(b)
    ax.text(x + w/2, y + h/2, text, ha="center", va="center", fontsize=fontsize,
            color=textcolor, weight="bold", wrap=True)
    return b

def arrow(x1, y1, x2, y2, color="#334155", style="-|>"):
    a = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style, mutation_scale=16,
                         linewidth=1.6, color=color, connectionstyle="arc3,rad=0.05")
    ax.add_patch(a)

# Entorno cloud simulado (fuente de datos)
box(0.3, 6.0, 3.0, 1.1, "Entorno Cloud Simulado\n(EC2 / S3 / IAM / Lambda / EKS)\nCloudTrail-like events", "#0f172a", fontsize=9.5)

# Agentes especializados
box(0.3, 4.2, 2.6, 1.2, "ConfigMonitorAgent\n(reglas OWASP / CSA CCM)\nreactivo", "#2563eb")
box(3.2, 4.2, 2.6, 1.2, "LogAnalysisAgent\n(Random Forest sobre\nlogs tipo CloudTrail)\nproactivo", "#0891b2")
box(6.1, 4.2, 2.6, 1.2, "LateralMovementAgent\n(analisis de grafos\nde acceso)\nreactivo", "#7c3aed")
box(9.0, 4.2, 3.4, 1.2, "MITRE ATT&CK for Cloud\n(TA0004 / TA0008 / TA0010)\nmodelo de referencia", "#475569", fontsize=9.5)

# Fusion / consenso
box(3.0, 2.5, 4.4, 1.1, "ThreatHuntingAgent\ncorrelacion + consenso multiagente\n(sociabilidad)", "#d97706")

# Respuesta
box(3.0, 0.7, 4.4, 1.1, "ResponseAgent\nrespuesta autonoma coordinada\n(revocar credenciales / aislar / snapshot)", "#16a34a")

# Bus de comunicacion (mensajeria estilo FIPA-ACL)
box(8.4, 2.5, 4.0, 1.1, "Bus de coordinacion\n(mensajeria tipo FIPA-ACL /\nStateGraph de LangGraph)", "#be123c", fontsize=9.5)

# Flechas: datos -> agentes
arrow(1.6, 6.0, 1.6, 5.4)
arrow(1.9, 6.0, 4.4, 5.4)
arrow(2.6, 6.0, 7.3, 5.4)

# agentes -> threat hunting
arrow(1.6, 4.2, 4.2, 3.6)
arrow(4.5, 4.2, 5.0, 3.6)
arrow(7.4, 4.2, 5.8, 3.6)

# threat hunting -> response
arrow(5.2, 2.5, 5.2, 1.8)

# bus bidireccional con todos los agentes (sociabilidad / coordinacion)
arrow(7.6, 3.0, 8.4, 3.0, color="#be123c")
arrow(8.4, 3.2, 7.6, 3.2, color="#be123c")

ax.text(6.5, 7.2, "Arquitectura de Sistema Multiagente (MAS) para Seguridad Cloud",
        ha="center", fontsize=15, weight="bold", color="#0f172a")
ax.text(6.5, 0.15, "Notacion: C4-like (contenedores) + flujo de datos. Orquestacion: LangGraph StateGraph.",
        ha="center", fontsize=9, color="#475569", style="italic")

fig.tight_layout()
fig.savefig("figures/architecture_diagram.png", dpi=200, facecolor="white")
print("Diagrama de arquitectura guardado.")
