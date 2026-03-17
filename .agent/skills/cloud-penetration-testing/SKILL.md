---
name: cloud-penetration-testing
description: "Conduct comprehensive security assessments of cloud infrastructure across Azure, AWS, and GCP. Covers reconnaissance, authentication testing, resource enumeration, privilege escalation, and persistence techniques for authorized cloud security engagements."
risk: unknown
source: community
date_added: "2026-02-27"
---

# Cloud Penetration Testing

## Purpose

Conduct comprehensive security assessments of cloud infrastructure across Microsoft Azure, Amazon Web Services (AWS), and Google Cloud Platform (GCP). This skill covers reconnaissance, authentication testing, resource enumeration, privilege escalation, data extraction, and persistence techniques for authorized cloud security engagements.

## Prerequisites

### Required Tools
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# GCP CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Additional tools
pip install scoutsuite pacu
```

### Required Access
- Written authorization for testing
- Test credentials or access tokens
- Defined scope and rules of engagement

## Outputs and Deliverables

1. **Cloud Security Assessment Report** - Comprehensive findings and risk ratings
2. **Resource Inventory** - Enumerated services, storage, and compute instances
3. **Credential Findings** - Exposed secrets, keys, and misconfigurations
4. **Remediation Recommendations** - Hardening guidance per platform

## Core Workflow

### Phase 1: Reconnaissance

```bash
# Enumerate cloud resources by company name
python3 cloud_enum.py -k targetcompany

# Check IP against cloud providers
cat ips.txt | python3 ip2provider.py
```

### Phase 2: AWS Authentication

```bash
# Configure AWS CLI
aws configure

# Test credentials
aws sts get-caller-identity
```

### Phase 3: AWS Enumeration

```bash
# Account information
aws sts get-caller-identity
aws iam list-users
aws iam list-roles

# S3 Buckets
aws s3 ls
aws s3 ls s3://bucket-name/

# EC2 Instances
aws ec2 describe-instances

# RDS Databases
aws rds describe-db-instances --region us-east-1

# Lambda Functions
aws lambda list-functions --region us-east-1

# EKS Clusters
aws eks list-clusters --region us-east-1

# Networking
aws ec2 describe-subnets
aws ec2 describe-security-groups --group-ids <sg-id>
```

### Phase 4: AWS Exploitation

```bash
# Check for public RDS snapshots
aws rds describe-db-snapshots --snapshot-type manual --query=DBSnapshots[*].DBSnapshotIdentifier
aws rds describe-db-snapshot-attributes --db-snapshot-identifier <id>

# Extract Lambda environment variables (may contain secrets)
aws lambda get-function --function-name <name> | jq '.Configuration.Environment'

# Access metadata service (from compromised EC2)
curl http://169.254.169.254/latest/meta-data/
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# IMDSv2 access
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl http://169.254.169.254/latest/meta-data/profile -H "X-aws-ec2-metadata-token: $TOKEN"
```

### Phase 5: GCP Enumeration

```bash
# Authentication
gcloud auth login
gcloud auth activate-service-account --key-file creds.json
gcloud auth list

# Account information
gcloud config list
gcloud organizations list
gcloud projects list

# IAM Policies
gcloud organizations get-iam-policy <org-id>
gcloud projects get-iam-policy <project-id>

# Enabled services
gcloud services list

# Compute instances
gcloud compute instances list
gcloud beta compute ssh --zone "region" "instance" --project "project"

# Storage buckets
gsutil ls
gsutil ls -r gs://bucket-name
gsutil cp gs://bucket/file ./local

# SQL instances
gcloud sql instances list
gcloud sql databases list --instance <id>

# Kubernetes
gcloud container clusters list
gcloud container clusters get-credentials <cluster> --region <region>
kubectl cluster-info
```

### Phase 6: GCP Exploitation

```bash
# Get metadata service data
curl "http://metadata.google.internal/computeMetadata/v1/?recursive=true&alt=text" -H "Metadata-Flavor: Google"

# Check access scopes
curl http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/scopes -H 'Metadata-Flavor:Google'

# Serverless function analysis
gcloud functions list
gcloud functions describe <name>
gcloud functions logs read <name> --limit 100

# Find stored credentials
sudo find /home -name "credentials.db"
```

## Quick Reference

### AWS Key Commands

| Action | Command |
|--------|---------|
| Configure | `aws configure` |
| Caller identity | `aws sts get-caller-identity` |
| List users | `aws iam list-users` |
| List S3 buckets | `aws s3 ls` |
| List EC2 | `aws ec2 describe-instances` |
| List Lambda | `aws lambda list-functions` |
| Metadata | `curl http://169.254.169.254/latest/meta-data/` |

### GCP Key Commands

| Action | Command |
|--------|---------|
| Login | `gcloud auth login` |
| List projects | `gcloud projects list` |
| List instances | `gcloud compute instances list` |
| List buckets | `gsutil ls` |
| List clusters | `gcloud container clusters list` |
| IAM policy | `gcloud projects get-iam-policy <project>` |
| Metadata | `curl -H "Metadata-Flavor: Google" http://metadata.google.internal/...` |

### Metadata Service URLs

| Provider | URL |
|----------|-----|
| AWS | `http://169.254.169.254/latest/meta-data/` |
| Azure | `http://169.254.169.254/metadata/instance?api-version=2018-02-01` |
| GCP | `http://metadata.google.internal/computeMetadata/v1/` |

### Useful Tools

| Tool | Purpose |
|------|---------|
| ScoutSuite | Multi-cloud security auditing |
| Pacu | AWS exploitation framework |
| AzureHound | Azure AD attack path mapping |
| WeirdAAL | AWS service enumeration |

## Constraints and Limitations

### Legal Requirements
- Only test with explicit written authorization
- Respect scope boundaries between cloud accounts
- Do not access production customer data
- Document all testing activities

### Detection Considerations
- Cloud providers log all API activity
- Unusual access patterns trigger alerts
- Use slow, deliberate enumeration
- Consider GuardDuty, Security Center, Cloud Armor

## When to Use

This skill should be used when the user asks to "perform cloud penetration testing", "assess Azure or AWS or GCP security", "enumerate cloud resources", or "exploit cloud misconfigurations" — always in an authorized testing context.
