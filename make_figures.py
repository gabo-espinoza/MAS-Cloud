import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

with open("data/metrics.json") as f:
    metrics = json.load(f)

CLASSES = ["Benigno", "Misconfig", "Lateral", "Exfiltracion"]

# 1) Matriz de confusion
cm = np.array(metrics["confusion_matrix"])
fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(cm, cmap="Blues")
ax.set_xticks(range(4)); ax.set_xticklabels(CLASSES, rotation=30, ha="right")
ax.set_yticks(range(4)); ax.set_yticklabels(CLASSES)
ax.set_xlabel("Clase predicha"); ax.set_ylabel("Clase real")
ax.set_title("Matriz de confusion - LogAnalysisAgent (Random Forest)")
for i in range(4):
    for j in range(4):
        ax.text(j, i, str(cm[i, j]), ha="center", va="center",
                 color="white" if cm[i, j] > cm.max()/2 else "black", fontsize=11)
fig.colorbar(im, ax=ax, label="N. de eventos")
fig.tight_layout()
fig.savefig("figures/confusion_matrix.png", dpi=200)
plt.close(fig)

# 2) Metricas macro (barras) - precision, recall, f1, auc
labels = ["Precision", "Recall", "F1-score", "AUC-ROC"]
values = [metrics["precision_macro"], metrics["recall_macro"], metrics["f1_macro"], metrics["auc_macro_ovr"]]
fig, ax = plt.subplots(figsize=(6.2, 5.0))
bars = ax.bar(labels, values, color=["#2563eb", "#16a34a", "#d97706", "#7c3aed"])
ax.set_ylim(0, 1.05)
ax.set_ylabel("Puntaje (0-1)")
ax.set_title("Metricas globales (macro)\nn=1800 eventos de prueba", fontsize=11)
for b, v in zip(bars, values):
    ax.text(b.get_x() + b.get_width()/2, v + 0.02, f"{v:.3f}", ha="center", fontsize=11, fontweight="bold")
fig.tight_layout()
fig.savefig("figures/metrics_bar.png", dpi=200)
plt.close(fig)

# 3) Metricas por clase (precision/recall/f1)
report = metrics["classification_report"]
class_keys = ["benigno", "misconfig", "lateral", "exfiltracion"]
prec = [report[k]["precision"] for k in class_keys]
rec = [report[k]["recall"] for k in class_keys]
f1s = [report[k]["f1-score"] for k in class_keys]

x = np.arange(len(class_keys)); w = 0.25
fig, ax = plt.subplots(figsize=(7.5, 4.8))
ax.bar(x - w, prec, w, label="Precision", color="#2563eb")
ax.bar(x, rec, w, label="Recall", color="#16a34a")
ax.bar(x + w, f1s, w, label="F1-score", color="#d97706")
ax.set_xticks(x); ax.set_xticklabels(CLASSES)
ax.set_ylim(0, 1.05)
ax.set_ylabel("Puntaje (0-1)")
ax.set_title("Metricas por clase de evento - LogAnalysisAgent")
ax.legend()
fig.tight_layout()
fig.savefig("figures/metrics_per_class.png", dpi=200)
plt.close(fig)

# 4) Importancia de features
fi = metrics["feature_importances"]
items = sorted(fi.items(), key=lambda kv: kv[1])
names = [k for k, _ in items]; vals = [v for _, v in items]
fig, ax = plt.subplots(figsize=(7, 5))
ax.barh(names, vals, color="#0891b2")
ax.set_xlabel("Importancia (Gini)")
ax.set_title("Importancia de variables\nRandom Forest (LogAnalysisAgent)", fontsize=11)
fig.tight_layout()
fig.savefig("figures/feature_importance.png", dpi=200)
plt.close(fig)

# 5) Respuesta autonoma vs revision humana
with open("data/response_log.json") as f:
    resp = json.load(f)
statuses = pd.Series([r["status"] for r in resp]).value_counts()
fig, ax = plt.subplots(figsize=(6, 4.5))
colors = ["#16a34a" if s == "EJECUTADA_AUTOMATICAMENTE" else "#f59e0b" for s in statuses.index]
ax.bar(["Autonoma\n(consenso >=2 agentes)", "Revision humana\n(consenso <2)"], statuses.values, color=colors)
ax.set_ylabel("N. de alertas")
ax.set_title("Respuesta coordinada por\nconsenso multiagente", fontsize=11)
for i, v in enumerate(statuses.values):
    ax.text(i, v + 3, str(v), ha="center", fontweight="bold")
fig.tight_layout()
fig.savefig("figures/response_consensus.png", dpi=200)
plt.close(fig)

print("Figuras generadas en ./figures/")
