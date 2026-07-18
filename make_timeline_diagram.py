import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

events = [
    ("Mar 2019", "WAF mal configurado en EC2\npermite SSRF hacia\nel servicio de metadatos", "#dc2626"),
    ("Mar 2019", "SSRF obtiene credenciales\nIAM temporales con\npermisos excesivos", "#ea580c"),
    ("Mar-Jul 2019", "Atacante lista y descarga\n>700 buckets S3\n(106M registros)", "#d97706"),
    ("Jul 17 2019", "Atacante publica\nevidencia en GitHub/Slack", "#65a30d"),
    ("Jul 19 2019", "Investigador externo\nalerta a Capital One", "#0891b2"),
    ("Jul 29 2019", "Divulgacion publica\ndel incidente", "#2563eb"),
    ("2020", "Multa OCC de USD 80M;\nremediacion y refuerzo\nde controles cloud", "#7c3aed"),
]

fig, ax = plt.subplots(figsize=(13, 4.8))
ax.set_xlim(0, 14); ax.set_ylim(0, 4)
ax.axis("off")

n = len(events)
xs = [1.0 + i * 1.9 for i in range(n)]
ax.plot([xs[0]-0.3, xs[-1]+0.3], [2.0, 2.0], color="#94a3b8", linewidth=3, zorder=1)

for x, (date, text, color) in zip(xs, events):
    ax.scatter([x], [2.0], s=140, color=color, zorder=3, edgecolor="#1e293b", linewidth=1.2)
    y_text = 2.6 if xs.index(x) % 2 == 0 else 1.4
    va = "bottom" if y_text > 2 else "top"
    box = FancyBboxPatch((x-0.85, y_text-0.05 if va=="bottom" else y_text-0.75), 1.7, 0.8,
                          boxstyle="round,pad=0.05,rounding_size=0.08",
                          linewidth=1.2, edgecolor=color, facecolor="white", zorder=2)
    ax.add_patch(box)
    ax.text(x, y_text + (0.35 if va=="bottom" else -0.35), text, ha="center", va="center", fontsize=8.3, zorder=4)
    ax.text(x, 2.0 - 0.35 if va=="bottom" else 2.0 + 0.35, date, ha="center", fontsize=9, weight="bold", color=color, zorder=4)

ax.set_title("Linea de tiempo — Brecha Capital One (2019): SSRF + IAM excesivo + S3 publico",
             fontsize=13.5, weight="bold", pad=14)
fig.tight_layout()
fig.savefig("figures/capitalone_timeline.png", dpi=200, facecolor="white")
print("Timeline guardado.")
