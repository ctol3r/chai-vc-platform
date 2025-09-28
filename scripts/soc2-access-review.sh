#!/bin/bash
# SOC2 Access Review Automation Script
# CHAI•VITALCV Healthcare Credentialing Platform
#
# Automates quarterly user access reviews required for SOC2 CC6.1 compliance.
# Generates access review reports for all systems and applications.

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config/soc2-collector-config.yaml"
OUTPUT_BASE="/var/soc2-evidence/access-reviews"
REVIEW_DATE=$(date +%Y-%m-%d)
REVIEW_QUARTER="Q$((($(date +%m)-1)/3+1))-$(date +%Y)"

# Create output directory
mkdir -p "${OUTPUT_BASE}/${REVIEW_QUARTER}"

# Logging setup
LOG_FILE="${OUTPUT_BASE}/${REVIEW_QUARTER}/access-review-${REVIEW_DATE}.log"
exec 1> >(tee -a "${LOG_FILE}")
exec 2>&1

echo "=== SOC2 Access Review - ${REVIEW_QUARTER} ==="
echo "Review Date: ${REVIEW_DATE}"
echo "Output Directory: ${OUTPUT_BASE}/${REVIEW_QUARTER}"
echo ""

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
error_exit() {
    log "ERROR: $1" >&2
    exit 1
}

# Check required tools
check_dependencies() {
    log "Checking dependencies..."

    command -v aws >/dev/null 2>&1 || error_exit "AWS CLI not found"
    command -v kubectl >/dev/null 2>&1 || error_exit "kubectl not found"
    command -v psql >/dev/null 2>&1 || error_exit "PostgreSQL client not found"
    command -v jq >/dev/null 2>&1 || error_exit "jq not found"
    command -v yq >/dev/null 2>&1 || error_exit "yq not found"

    log "Dependencies check completed"
}

# AWS IAM Access Review
review_aws_iam() {
    log "Starting AWS IAM access review..."

    local output_file="${OUTPUT_BASE}/${REVIEW_QUARTER}/aws-iam-review.json"

    # Get all IAM users
    aws iam list-users --output json > "${output_file}.users.tmp"

    # Get all IAM roles
    aws iam list-roles --output json > "${output_file}.roles.tmp"

    # Get all IAM groups
    aws iam list-groups --output json > "${output_file}.groups.tmp"

    # Process users with their policies and groups
    local iam_review='{"review_date": "'${REVIEW_DATE}'", "review_type": "aws_iam", "users": [], "roles": [], "groups": []}'

    # Process IAM users
    while IFS= read -r user; do
        local username=$(echo "$user" | jq -r '.UserName')
        local created_date=$(echo "$user" | jq -r '.CreateDate')
        local last_activity=$(aws iam get-user-detail --user-name "$username" --query 'User.Tags[?Key==`LastActivity`].Value' --output text 2>/dev/null || echo "N/A")

        # Get user's attached policies
        local attached_policies=$(aws iam list-attached-user-policies --user-name "$username" --output json | jq -c '.AttachedPolicies')

        # Get user's inline policies
        local inline_policies=$(aws iam list-user-policies --user-name "$username" --output json | jq -c '.PolicyNames')

        # Get user's groups
        local user_groups=$(aws iam get-groups-for-user --user-name "$username" --output json | jq -c '.Groups')

        # Get last login date
        local last_login=$(aws iam get-user --user-name "$username" --query 'User.PasswordLastUsed' --output text 2>/dev/null || echo "N/A")

        # Determine review status
        local review_status="pending_review"
        if [[ "$last_login" == "N/A" ]] || [[ "$last_activity" == "N/A" ]]; then
            review_status="requires_attention"
        fi

        # Add to review data
        local user_data=$(jq -n \
            --arg username "$username" \
            --arg created_date "$created_date" \
            --arg last_login "$last_login" \
            --arg last_activity "$last_activity" \
            --arg review_status "$review_status" \
            --argjson attached_policies "$attached_policies" \
            --argjson inline_policies "$inline_policies" \
            --argjson groups "$user_groups" \
            '{
                username: $username,
                created_date: $created_date,
                last_login: $last_login,
                last_activity: $last_activity,
                review_status: $review_status,
                attached_policies: $attached_policies,
                inline_policies: $inline_policies,
                groups: $groups
            }')

        iam_review=$(echo "$iam_review" | jq ".users += [$user_data]")

        log "  Processed user: $username"
    done < <(jq -c '.Users[]' "${output_file}.users.tmp")

    # Process IAM roles (similar structure)
    while IFS= read -r role; do
        local rolename=$(echo "$role" | jq -r '.RoleName')
        local created_date=$(echo "$role" | jq -r '.CreateDate')
        local assume_role_policy=$(echo "$role" | jq -c '.AssumeRolePolicyDocument')

        # Get role's attached policies
        local attached_policies=$(aws iam list-attached-role-policies --role-name "$rolename" --output json | jq -c '.AttachedPolicies')

        # Get role's inline policies
        local inline_policies=$(aws iam list-role-policies --role-name "$rolename" --output json | jq -c '.PolicyNames')

        local role_data=$(jq -n \
            --arg rolename "$rolename" \
            --arg created_date "$created_date" \
            --argjson assume_role_policy "$assume_role_policy" \
            --argjson attached_policies "$attached_policies" \
            --argjson inline_policies "$inline_policies" \
            '{
                rolename: $rolename,
                created_date: $created_date,
                assume_role_policy: $assume_role_policy,
                attached_policies: $attached_policies,
                inline_policies: $inline_policies,
                review_status: "pending_review"
            }')

        iam_review=$(echo "$iam_review" | jq ".roles += [$role_data]")

        log "  Processed role: $rolename"
    done < <(jq -c '.Roles[]' "${output_file}.roles.tmp")

    # Save final IAM review
    echo "$iam_review" | jq '.' > "$output_file"

    # Cleanup temp files
    rm -f "${output_file}".*.tmp

    log "AWS IAM access review completed: $output_file"
}

# Kubernetes RBAC Access Review
review_k8s_rbac() {
    log "Starting Kubernetes RBAC access review..."

    local output_file="${OUTPUT_BASE}/${REVIEW_QUARTER}/k8s-rbac-review.json"

    # Get all service accounts
    local service_accounts=$(kubectl get serviceaccounts --all-namespaces -o json | jq -c '.items[]')

    # Get all role bindings
    local role_bindings=$(kubectl get rolebindings --all-namespaces -o json | jq -c '.items[]')

    # Get all cluster role bindings
    local cluster_role_bindings=$(kubectl get clusterrolebindings -o json | jq -c '.items[]')

    local k8s_review='{"review_date": "'${REVIEW_DATE}'", "review_type": "kubernetes_rbac", "service_accounts": [], "role_bindings": [], "cluster_role_bindings": []}'

    # Process service accounts
    while IFS= read -r sa; do
        local sa_name=$(echo "$sa" | jq -r '.metadata.name')
        local sa_namespace=$(echo "$sa" | jq -r '.metadata.namespace')
        local created_date=$(echo "$sa" | jq -r '.metadata.creationTimestamp')

        # Skip system service accounts
        if [[ "$sa_name" == "default" ]] || [[ "$sa_name" =~ ^system: ]]; then
            continue
        fi

        local sa_data=$(jq -n \
            --arg name "$sa_name" \
            --arg namespace "$sa_namespace" \
            --arg created_date "$created_date" \
            '{
                name: $name,
                namespace: $namespace,
                created_date: $created_date,
                review_status: "pending_review"
            }')

        k8s_review=$(echo "$k8s_review" | jq ".service_accounts += [$sa_data]")

        log "  Processed service account: $sa_namespace/$sa_name"
    done < <(echo "$service_accounts")

    # Process role bindings
    while IFS= read -r rb; do
        local rb_name=$(echo "$rb" | jq -r '.metadata.name')
        local rb_namespace=$(echo "$rb" | jq -r '.metadata.namespace')
        local role_ref=$(echo "$rb" | jq -c '.roleRef')
        local subjects=$(echo "$rb" | jq -c '.subjects // []')
        local created_date=$(echo "$rb" | jq -r '.metadata.creationTimestamp')

        local rb_data=$(jq -n \
            --arg name "$rb_name" \
            --arg namespace "$rb_namespace" \
            --arg created_date "$created_date" \
            --argjson role_ref "$role_ref" \
            --argjson subjects "$subjects" \
            '{
                name: $name,
                namespace: $namespace,
                created_date: $created_date,
                role_ref: $role_ref,
                subjects: $subjects,
                review_status: "pending_review"
            }')

        k8s_review=$(echo "$k8s_review" | jq ".role_bindings += [$rb_data]")

        log "  Processed role binding: $rb_namespace/$rb_name"
    done < <(echo "$role_bindings")

    # Save K8s RBAC review
    echo "$k8s_review" | jq '.' > "$output_file"

    log "Kubernetes RBAC access review completed: $output_file"
}

# Database Access Review
review_database_access() {
    log "Starting database access review..."

    local output_file="${OUTPUT_BASE}/${REVIEW_QUARTER}/database-access-review.json"

    # Database connection parameters from config
    local db_host=$(yq e '.database.host' "$CONFIG_FILE")
    local db_port=$(yq e '.database.port' "$CONFIG_FILE")
    local db_name=$(yq e '.database.name' "$CONFIG_FILE")
    local db_user=$(yq e '.database.user' "$CONFIG_FILE")

    # Export password from environment
    export PGPASSWORD="${DB_PASSWORD:-}"

    # Query database users and their permissions
    local query="
    SELECT
        r.rolname as username,
        r.rolsuper as is_superuser,
        r.rolcreaterole as can_create_roles,
        r.rolcreatedb as can_create_databases,
        r.rolcanlogin as can_login,
        r.rolreplication as replication_privilege,
        r.rolvaliduntil as password_expiry,
        ARRAY_AGG(DISTINCT m.rolname) as member_of_roles,
        ARRAY_AGG(DISTINCT d.datname) as databases_owned
    FROM pg_roles r
    LEFT JOIN pg_auth_members am ON r.oid = am.member
    LEFT JOIN pg_roles m ON am.roleid = m.oid
    LEFT JOIN pg_database d ON r.oid = d.datdba
    WHERE r.rolname NOT LIKE 'pg_%'
      AND r.rolname NOT LIKE 'rds%'
      AND r.rolname != 'postgres'
    GROUP BY r.rolname, r.rolsuper, r.rolcreaterole, r.rolcreatedb,
             r.rolcanlogin, r.rolreplication, r.rolvaliduntil
    ORDER BY r.rolname;
    "

    local db_users=$(psql -h "$db_host" -p "$db_port" -d "$db_name" -U "$db_user" \
        -t -c "$query" --csv 2>/dev/null || echo "")

    local db_review='{"review_date": "'${REVIEW_DATE}'", "review_type": "database_access", "users": []}'

    # Process database users
    while IFS=',' read -r username is_superuser can_create_roles can_create_databases can_login replication_privilege password_expiry member_of_roles databases_owned; do
        # Skip header row
        if [[ "$username" == "username" ]]; then
            continue
        fi

        # Remove quotes from CSV fields
        username=$(echo "$username" | tr -d '"')
        is_superuser=$(echo "$is_superuser" | tr -d '"')

        # Determine review status based on privileges
        local review_status="pending_review"
        if [[ "$is_superuser" == "t" ]]; then
            review_status="high_priority_review"
        fi

        local user_data=$(jq -n \
            --arg username "$username" \
            --arg is_superuser "$is_superuser" \
            --arg can_create_roles "$can_create_roles" \
            --arg can_create_databases "$can_create_databases" \
            --arg can_login "$can_login" \
            --arg replication_privilege "$replication_privilege" \
            --arg password_expiry "$password_expiry" \
            --arg member_of_roles "$member_of_roles" \
            --arg databases_owned "$databases_owned" \
            --arg review_status "$review_status" \
            '{
                username: $username,
                is_superuser: ($is_superuser == "t"),
                can_create_roles: ($can_create_roles == "t"),
                can_create_databases: ($can_create_databases == "t"),
                can_login: ($can_login == "t"),
                replication_privilege: ($replication_privilege == "t"),
                password_expiry: $password_expiry,
                member_of_roles: $member_of_roles,
                databases_owned: $databases_owned,
                review_status: $review_status
            }')

        db_review=$(echo "$db_review" | jq ".users += [$user_data]")

        log "  Processed database user: $username"
    done <<< "$db_users"

    # Save database access review
    echo "$db_review" | jq '.' > "$output_file"

    log "Database access review completed: $output_file"
}

# Application Access Review
review_application_access() {
    log "Starting application access review..."

    local output_file="${OUTPUT_BASE}/${REVIEW_QUARTER}/application-access-review.json"

    # This would typically integrate with application user management systems
    # For now, create a template structure

    local app_review=$(jq -n \
        --arg review_date "$REVIEW_DATE" \
        '{
            review_date: $review_date,
            review_type: "application_access",
            applications: [
                {
                    name: "CHAI•VITALCV Web Portal",
                    user_count: 0,
                    admin_count: 0,
                    inactive_users: 0,
                    review_status: "pending_manual_review"
                },
                {
                    name: "Healthcare Provider API",
                    user_count: 0,
                    admin_count: 0,
                    inactive_users: 0,
                    review_status: "pending_manual_review"
                },
                {
                    name: "Credential Verification Portal",
                    user_count: 0,
                    admin_count: 0,
                    inactive_users: 0,
                    review_status: "pending_manual_review"
                }
            ],
            manual_review_required: true,
            review_instructions: "Manual review required for application-specific user accounts. Contact application owners to provide user lists and access levels."
        }')

    echo "$app_review" | jq '.' > "$output_file"

    log "Application access review template created: $output_file"
}

# Generate consolidated access review report
generate_consolidated_report() {
    log "Generating consolidated access review report..."

    local consolidated_file="${OUTPUT_BASE}/${REVIEW_QUARTER}/consolidated-access-review.json"

    # Combine all review results
    local consolidated_report=$(jq -n \
        --arg review_date "$REVIEW_DATE" \
        --arg review_quarter "$REVIEW_QUARTER" \
        '{
            review_metadata: {
                review_date: $review_date,
                review_quarter: $review_quarter,
                review_scope: ["aws_iam", "kubernetes_rbac", "database_access", "application_access"],
                compliance_framework: "SOC2 CC6.1 - Logical and Physical Access Controls"
            },
            reviews: {},
            summary: {
                total_users_reviewed: 0,
                high_risk_findings: 0,
                pending_reviews: 0,
                completed_reviews: 0
            },
            recommendations: [],
            next_review_date: ""
        }')

    # Add individual review results
    for review_file in aws-iam-review.json k8s-rbac-review.json database-access-review.json application-access-review.json; do
        local full_path="${OUTPUT_BASE}/${REVIEW_QUARTER}/${review_file}"
        if [[ -f "$full_path" ]]; then
            local review_type=$(basename "$review_file" .json | tr '-' '_')
            local review_data=$(cat "$full_path")
            consolidated_report=$(echo "$consolidated_report" | jq ".reviews[\"$review_type\"] = $review_data")

            log "  Added $review_type to consolidated report"
        fi
    done

    # Calculate summary statistics
    consolidated_report=$(echo "$consolidated_report" | jq '
        .summary.total_users_reviewed = (
            (.reviews.aws_iam_review.users // [] | length) +
            (.reviews.k8s_rbac_review.service_accounts // [] | length) +
            (.reviews.database_access_review.users // [] | length)
        ) |
        .summary.pending_reviews = [
            .reviews[]? | objects |
            (.users[]? // .service_accounts[]? // empty) |
            select(.review_status == "pending_review")
        ] | length |
        .summary.high_risk_findings = [
            .reviews[]? | objects |
            (.users[]? // .service_accounts[]? // empty) |
            select(.review_status == "high_priority_review" or .review_status == "requires_attention")
        ] | length
    ')

    # Add recommendations based on findings
    local recommendations='[
        "Review and validate all high-privilege accounts (superuser, admin roles)",
        "Remove or disable inactive user accounts that have not logged in within 90 days",
        "Ensure all privileged access is properly justified and documented",
        "Validate that role-based access controls align with job responsibilities",
        "Review and update access control policies based on organizational changes"
    ]'

    consolidated_report=$(echo "$consolidated_report" | jq ".recommendations = $recommendations")

    # Set next review date (quarterly)
    local next_review_date=$(date -d "+3 months" +%Y-%m-%d)
    consolidated_report=$(echo "$consolidated_report" | jq ".next_review_date = \"$next_review_date\"")

    echo "$consolidated_report" | jq '.' > "$consolidated_file"

    log "Consolidated access review report generated: $consolidated_file"
}

# Generate CSV export for review workflows
generate_csv_export() {
    log "Generating CSV exports for review workflows..."

    local csv_dir="${OUTPUT_BASE}/${REVIEW_QUARTER}/csv-exports"
    mkdir -p "$csv_dir"

    # AWS IAM Users CSV
    local iam_file="${OUTPUT_BASE}/${REVIEW_QUARTER}/aws-iam-review.json"
    if [[ -f "$iam_file" ]]; then
        jq -r '
            ["Username", "Created Date", "Last Login", "Review Status", "Attached Policies Count", "Groups Count"],
            (.users[] | [
                .username,
                .created_date,
                .last_login,
                .review_status,
                (.attached_policies | length),
                (.groups | length)
            ]) | @csv
        ' "$iam_file" > "${csv_dir}/aws-iam-users-review.csv"

        log "  Generated AWS IAM users CSV"
    fi

    # Database Users CSV
    local db_file="${OUTPUT_BASE}/${REVIEW_QUARTER}/database-access-review.json"
    if [[ -f "$db_file" ]]; then
        jq -r '
            ["Username", "Is Superuser", "Can Login", "Password Expiry", "Review Status"],
            (.users[] | [
                .username,
                .is_superuser,
                .can_login,
                .password_expiry,
                .review_status
            ]) | @csv
        ' "$db_file" > "${csv_dir}/database-users-review.csv"

        log "  Generated database users CSV"
    fi

    log "CSV exports generated in: $csv_dir"
}

# Main execution
main() {
    log "Starting SOC2 access review automation"

    # Check dependencies
    check_dependencies

    # Perform access reviews
    review_aws_iam
    review_k8s_rbac
    review_database_access
    review_application_access

    # Generate reports
    generate_consolidated_report
    generate_csv_export

    log "SOC2 access review automation completed successfully"
    log "Review artifacts saved to: ${OUTPUT_BASE}/${REVIEW_QUARTER}"

    # Display summary
    echo ""
    echo "=== Access Review Summary ==="
    echo "Review Quarter: ${REVIEW_QUARTER}"
    echo "Output Location: ${OUTPUT_BASE}/${REVIEW_QUARTER}"
    echo ""

    if [[ -f "${OUTPUT_BASE}/${REVIEW_QUARTER}/consolidated-access-review.json" ]]; then
        echo "Summary Statistics:"
        jq -r '
            "  Total Users Reviewed: " + (.summary.total_users_reviewed | tostring) + "\n" +
            "  High Risk Findings: " + (.summary.high_risk_findings | tostring) + "\n" +
            "  Pending Reviews: " + (.summary.pending_reviews | tostring) + "\n" +
            "  Next Review Date: " + .next_review_date
        ' "${OUTPUT_BASE}/${REVIEW_QUARTER}/consolidated-access-review.json"
    fi

    echo ""
    echo "Manual Review Required:"
    echo "  1. Review high-risk findings and pending reviews"
    echo "  2. Validate application-specific user access"
    echo "  3. Update access control documentation"
    echo "  4. Schedule remediation for identified issues"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi