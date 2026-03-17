---
name: aws-compliance-checker
description: "Automated compliance checking against CIS, PCI-DSS, HIPAA, and SOC 2 benchmarks"
category: security
risk: safe
source: community
tags: "[aws, compliance, audit, cis, pci-dss, hipaa]"
date_added: "2026-02-27"
---

# AWS Compliance Checker

Automated compliance validation against industry standards including CIS AWS Foundations, PCI-DSS, HIPAA, and SOC 2.

## When to Use

Use this skill when you need to validate AWS compliance against industry standards, prepare for audits, or maintain continuous compliance monitoring.

## Supported Frameworks

**CIS AWS Foundations Benchmark**
- Identity and Access Management
- Logging and Monitoring
- Networking
- Data Protection

**PCI-DSS (Payment Card Industry)**
- Network security
- Access controls
- Encryption
- Monitoring and logging

**HIPAA (Healthcare)**
- Access controls
- Audit controls
- Data encryption
- Transmission security

**SOC 2**
- Security
- Availability
- Confidentiality
- Privacy

## CIS AWS Foundations Checks

### Identity & Access Management (1.x)

```bash
#!/bin/bash
# cis-iam-checks.sh

echo "=== CIS IAM Compliance Checks ==="

# 1.1: Root account usage
echo "1.1: Checking root account usage..."
root_usage=$(aws iam get-credential-report --output text | \
  awk -F, 'NR==2 {print $5,$11}')
echo "  Root password last used: $root_usage"

# 1.2: MFA on root account
echo "1.2: Checking root MFA..."
root_mfa=$(aws iam get-account-summary \
  --query 'SummaryMap.AccountMFAEnabled' --output text)
echo "  Root MFA enabled: $root_mfa"

# 1.3: Unused credentials
echo "1.3: Checking for unused credentials (>90 days)..."
aws iam get-credential-report --output text | \
  awk -F, 'NR>1 {
    if ($5 != "N/A" && $5 != "no_information") {
      cmd = "date -d \"" $5 "\" +%s"
      cmd | getline last_used
      close(cmd)
      now = systime()
      days = (now - last_used) / 86400
      if (days > 90) print "  ⚠️  " $1 ": " int(days) " days inactive"
    }
  }'

# 1.4: Access keys rotated
echo "1.4: Checking access key age..."
aws iam list-users --query 'Users[*].UserName' --output text | \
while read user; do
  aws iam list-access-keys --user-name "$user" \
    --query 'AccessKeyMetadata[*].[AccessKeyId,CreateDate]' \
    --output text | \
  while read key_id create_date; do
    age_days=$(( ($(date +%s) - $(date -d "$create_date" +%s)) / 86400 ))
    if [ $age_days -gt 90 ]; then
      echo "  ⚠️  $user: Key $key_id is $age_days days old"
    fi
  done
done

# 1.5-1.11: Password policy
echo "1.5-1.11: Checking password policy..."
policy=$(aws iam get-account-password-policy 2>&1)
if echo "$policy" | grep -q "NoSuchEntity"; then
  echo "  ❌ No password policy configured"
else
  echo "  ✓ Password policy exists"
fi

# 1.12-1.14: MFA for IAM users
echo "1.12-1.14: Checking IAM user MFA..."
aws iam get-credential-report --output text | \
  awk -F, 'NR>1 && $4=="false" {print "  ⚠️  " $1 ": No MFA"}'
```

### Logging (2.x)

```bash
#!/bin/bash
# cis-logging-checks.sh

echo "=== CIS Logging Compliance Checks ==="

# 2.1: CloudTrail enabled
echo "2.1: Checking CloudTrail..."
trails=$(aws cloudtrail describe-trails \
  --query 'trailList[*].[Name,IsMultiRegionTrail,LogFileValidationEnabled]' \
  --output text)

if [ -z "$trails" ]; then
  echo "  ❌ No CloudTrail configured"
else
  echo "$trails" | while read name multi_region validation; do
    echo "  Trail: $name"
    echo "    Multi-region: $multi_region"
    echo "    Log validation: $validation"
    status=$(aws cloudtrail get-trail-status --name "$name" \
      --query 'IsLogging' --output text)
    echo "    Is logging: $status"
  done
fi

# 2.5: AWS Config enabled
echo "2.5: Checking AWS Config..."
recorders=$(aws configservice describe-configuration-recorders \
  --query 'ConfigurationRecorders[*].name' --output text)
if [ -z "$recorders" ]; then
  echo "  ❌ AWS Config not enabled"
else
  echo "  ✓ AWS Config enabled: $recorders"
fi

# 2.7: VPC Flow Logs
echo "2.7: Checking VPC Flow Logs..."
aws ec2 describe-vpcs --query 'Vpcs[*].VpcId' --output text | \
while read vpc; do
  flow_logs=$(aws ec2 describe-flow-logs \
    --filter "Name=resource-id,Values=$vpc" \
    --query 'FlowLogs[*].FlowLogId' --output text)
  if [ -z "$flow_logs" ]; then
    echo "  ⚠️  $vpc: No flow logs enabled"
  else
    echo "  ✓ $vpc: Flow logs enabled"
  fi
done
```

### Networking (4.x)

```bash
#!/bin/bash
# cis-networking-checks.sh

echo "=== CIS Networking Compliance Checks ==="

# 4.1: No security groups allow 0.0.0.0/0 ingress to port 22
echo "4.1: Checking SSH access (port 22)..."
aws ec2 describe-security-groups \
  --query 'SecurityGroups[*].[GroupId,GroupName,IpPermissions]' \
  --output json | \
jq -r '.[] | select(.[2][]? |
  select(.FromPort == 22 and .IpRanges[]?.CidrIp == "0.0.0.0/0")) |
  "  ⚠️  \(.[0]): \(.[1]) allows SSH from 0.0.0.0/0"'

# 4.2: No security groups allow 0.0.0.0/0 ingress to port 3389
echo "4.2: Checking RDP access (port 3389)..."
aws ec2 describe-security-groups \
  --query 'SecurityGroups[*].[GroupId,GroupName,IpPermissions]' \
  --output json | \
jq -r '.[] | select(.[2][]? |
  select(.FromPort == 3389 and .IpRanges[]?.CidrIp == "0.0.0.0/0")) |
  "  ⚠️  \(.[0]): \(.[1]) allows RDP from 0.0.0.0/0"'
```

## PCI-DSS Compliance Checks

```python
#!/usr/bin/env python3
import boto3

def check_pci_compliance():
    ec2 = boto3.client('ec2')
    rds = boto3.client('rds')
    iam = boto3.client('iam')
    cloudtrail = boto3.client('cloudtrail')

    issues = []

    # Requirement 1: Network security
    sgs = ec2.describe_security_groups()
    for sg in sgs['SecurityGroups']:
        for perm in sg.get('IpPermissions', []):
            for ip_range in perm.get('IpRanges', []):
                if ip_range.get('CidrIp') == '0.0.0.0/0':
                    issues.append(f"PCI 1.2: {sg['GroupId']} open to internet")

    # Requirement 3: Protect cardholder data
    volumes = ec2.describe_volumes()
    for vol in volumes['Volumes']:
        if not vol['Encrypted']:
            issues.append(f"PCI 3.4: Volume {vol['VolumeId']} not encrypted")

    # Requirement 8: Access controls
    users = iam.list_users()
    for user in users['Users']:
        mfa = iam.list_mfa_devices(UserName=user['UserName'])
        if not mfa['MFADevices']:
            issues.append(f"PCI 8.3: {user['UserName']} no MFA")

    # Requirement 10: Logging
    trails = cloudtrail.describe_trails()
    if not trails['trailList']:
        issues.append("PCI 10.1: No CloudTrail enabled")

    return issues

if __name__ == "__main__":
    print("PCI-DSS Compliance Check")
    print("=" * 50)
    issues = check_pci_compliance()
    if not issues:
        print("✓ No PCI-DSS issues found")
    else:
        print(f"Found {len(issues)} issues:\n")
        for issue in issues:
            print(f"  ⚠️  {issue}")
```

## HIPAA Compliance Checks

```bash
#!/bin/bash
echo "=== HIPAA Compliance Checks ==="

# Access Controls (164.308(a)(3))
echo "Access Controls:"
aws iam get-credential-report --output text | \
  awk -F, 'NR>1 && $4=="false" {print "  ⚠️  " $1 ": No MFA (164.312(a)(2)(i))"}'

# Audit Controls (164.312(b))
echo ""
echo "Audit Controls:"
trails=$(aws cloudtrail describe-trails --query 'trailList[*].Name' --output text)
if [ -z "$trails" ]; then
  echo "  ❌ No CloudTrail (164.312(b))"
else
  echo "  ✓ CloudTrail enabled"
fi

# Encryption (164.312(a)(2)(iv))
echo ""
echo "Encryption at Rest:"
aws ec2 describe-volumes \
  --query 'Volumes[?Encrypted==`false`].VolumeId' \
  --output text | \
while read vol; do
  echo "  ⚠️  $vol: Not encrypted (164.312(a)(2)(iv))"
done
```

## Example Prompts

- "Run CIS AWS Foundations compliance check"
- "Generate a PCI-DSS compliance report"
- "Check HIPAA compliance for my AWS account"
- "Audit against SOC 2 requirements"
- "Create a compliance dashboard"

## Best Practices

- Run compliance checks weekly
- Automate with Lambda/EventBridge
- Track compliance trends over time
- Document exceptions with justification
- Integrate with AWS Security Hub
- Use AWS Config Rules for continuous monitoring

## Additional Resources

- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)
- [AWS Security Hub](https://aws.amazon.com/security-hub/)
- [AWS Compliance Programs](https://aws.amazon.com/compliance/programs/)
