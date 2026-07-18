"""
generate_data.py
Genera un dataset sintetico que imita eventos de control-plane tipo
AWS CloudTrail / Azure Activity Log para un entorno cloud simulado.

Etiquetas:
  0 = benigno
  1 = misconfiguration (ACL publica, IAM excesivo, cifrado deshabilitado)
  2 = movimiento lateral (uso anomalo de credenciales entre recursos)
  3 = exfiltracion de datos (descargas masivas / transferencias inusuales)

Datos sinteticos por razones eticas y de confidencialidad; generador
estocastico con semilla fija, inspirado en los patrones descritos por
MITRE ATT&CK for Cloud (TA0004 Privilege Escalation, TA0008 Lateral
Movement, TA0010 Exfiltration) y en el caso Capital One (2019).
"""
import numpy as np
import pandas as pd

RNG_SEED = 42
N_EVENTS = 6000

ACTIONS = [
    "GetObject", "PutObject", "ListBuckets", "AssumeRole", "PutBucketAcl",
    "CreateAccessKey", "DescribeInstances", "RunInstances", "AttachRolePolicy",
    "PutBucketPolicy", "GetCallerIdentity", "CopyObject", "InvokeFunction",
    "ConsoleLogin", "DeleteTrail", "PutObjectAcl"
]

def _benign_probs():
    p = np.array([12, 12, 8, 8, 3, 3, 12, 8, 3, 3, 10, 6, 6, 4, 1, 1], dtype=float)
    return p / p.sum()

def generate_dataset(n=N_EVENTS, seed=RNG_SEED):
    rng = np.random.default_rng(seed)

    n_benign = int(n * 0.82)
    n_misconf = int(n * 0.08)
    n_lateral = int(n * 0.06)
    n_exfil = n - n_benign - n_misconf - n_lateral

    rows = []

    for _ in range(n_benign):
        rows.append(dict(
            action=rng.choice(ACTIONS, p=_benign_probs()),
            source_ip_entropy=rng.normal(2.0, 0.4),
            requests_per_min=rng.poisson(4),
            distinct_resources_touched=rng.integers(1, 3),
            is_public_acl=0,
            iam_wildcard_permissions=0,
            data_transfer_mb=rng.exponential(5),
            new_role_assumed=0,
            off_hours=rng.choice([0, 1], p=[0.85, 0.15]),
            mfa_present=rng.choice([0, 1], p=[0.05, 0.95]),
            label=0,
        ))

    for _ in range(n_misconf):
        rows.append(dict(
            action=rng.choice(["PutBucketAcl", "PutBucketPolicy", "AttachRolePolicy", "PutObjectAcl"]),
            source_ip_entropy=rng.normal(2.2, 0.5),
            requests_per_min=rng.poisson(3),
            distinct_resources_touched=rng.integers(1, 4),
            is_public_acl=rng.choice([0, 1], p=[0.25, 0.75]),
            iam_wildcard_permissions=rng.choice([0, 1], p=[0.3, 0.7]),
            data_transfer_mb=rng.exponential(3),
            new_role_assumed=rng.choice([0, 1], p=[0.6, 0.4]),
            off_hours=rng.choice([0, 1], p=[0.6, 0.4]),
            mfa_present=rng.choice([0, 1], p=[0.5, 0.5]),
            label=1,
        ))

    for _ in range(n_lateral):
        rows.append(dict(
            action=rng.choice(["AssumeRole", "CreateAccessKey", "DescribeInstances", "GetCallerIdentity"]),
            source_ip_entropy=rng.normal(4.2, 0.6),
            requests_per_min=rng.poisson(18),
            distinct_resources_touched=rng.integers(5, 15),
            is_public_acl=0,
            iam_wildcard_permissions=rng.choice([0, 1], p=[0.4, 0.6]),
            data_transfer_mb=rng.exponential(8),
            new_role_assumed=rng.choice([0, 1], p=[0.2, 0.8]),
            off_hours=rng.choice([0, 1], p=[0.35, 0.65]),
            mfa_present=rng.choice([0, 1], p=[0.8, 0.2]),
            label=2,
        ))

    for _ in range(n_exfil):
        rows.append(dict(
            action=rng.choice(["GetObject", "CopyObject", "ListBuckets", "InvokeFunction"]),
            source_ip_entropy=rng.normal(4.8, 0.7),
            requests_per_min=rng.poisson(30),
            distinct_resources_touched=rng.integers(3, 10),
            is_public_acl=rng.choice([0, 1], p=[0.7, 0.3]),
            iam_wildcard_permissions=rng.choice([0, 1], p=[0.5, 0.5]),
            data_transfer_mb=rng.exponential(400) + 50,
            new_role_assumed=rng.choice([0, 1], p=[0.5, 0.5]),
            off_hours=rng.choice([0, 1], p=[0.3, 0.7]),
            mfa_present=rng.choice([0, 1], p=[0.85, 0.15]),
            label=3,
        ))

    df = pd.DataFrame(rows)
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)
    df["event_id"] = [f"EVT-{i:06d}" for i in range(len(df))]
    df["resource_type"] = rng.choice(["EC2", "S3", "IAM", "Lambda", "EKS"], size=len(df))

    # Cuentas: benigno/misconfig se reparten entre muchas cuentas distintas;
    # lateral/exfiltracion se agrupan en un pool pequeno de "cuentas
    # comprometidas" que generan multiples eventos hacia distintos recursos
    # en poco tiempo (patron de pivoteo / campana de ataque), replicando
    # TA0008 Lateral Movement de MITRE ATT&CK for Cloud.
    account_ids = np.empty(len(df), dtype=np.int64)
    compromised_pool = rng.integers(700000, 799999, size=25)
    benign_idx = df.index[df["label"].isin([0, 1])]
    attack_idx = df.index[df["label"].isin([2, 3])]

    account_ids[benign_idx] = rng.integers(100000, 699999, size=len(benign_idx))
    account_ids[attack_idx] = rng.choice(compromised_pool, size=len(attack_idx))
    df["account_id"] = account_ids
    return df


if __name__ == "__main__":
    df = generate_dataset()
    df.to_csv("data/cloudtrail_synthetic.csv", index=False)
    print(f"Dataset generado: {len(df)} eventos -> data/cloudtrail_synthetic.csv")
    print(df["label"].value_counts().rename({0: "benigno", 1: "misconfig", 2: "lateral", 3: "exfiltracion"}))
