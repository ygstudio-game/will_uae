import { RoleType } from "@prisma/client";

const VALID_ROLES = new Set<string>([
  "TESTATOR",
  "EXECUTOR_PRIMARY",
  "EXECUTOR_SUBSTITUTE",
  "EXECUTOR_FURTHER",
  "BENEFICIARY",
  "BENEFICIARY_PRIMARY",
  "BENEFICIARY_SUBSTITUTE",
  "GUARDIAN_PERMANENT",
  "GUARDIAN_SUBSTITUTE_PERM",
  "GUARDIAN_TEMPORARY",
  "CHILD",
]);

export function normalizeRoleType(role: any): RoleType | null {
  if (!role || typeof role !== "string") return null;
  const upper = role.toUpperCase().trim();

  if (VALID_ROLES.has(upper)) {
    return upper as RoleType;
  }

  // Common aliases and fallbacks
  switch (upper) {
    case "EXECUTOR":
    case "PRIMARY_EXECUTOR":
      return "EXECUTOR_PRIMARY" as RoleType;
    case "SUBSTITUTE_EXECUTOR":
      return "EXECUTOR_SUBSTITUTE" as RoleType;
    case "FURTHER_EXECUTOR":
      return "EXECUTOR_FURTHER" as RoleType;
    case "PRIMARY_BENEFICIARY":
      return "BENEFICIARY_PRIMARY" as RoleType;
    case "SUBSTITUTE_BENEFICIARY":
      return "BENEFICIARY_SUBSTITUTE" as RoleType;
    case "GUARDIAN":
    case "PERMANENT_GUARDIAN":
      return "GUARDIAN_PERMANENT" as RoleType;
    case "TEMPORARY_GUARDIAN":
    case "INTERIM_GUARDIAN":
      return "GUARDIAN_TEMPORARY" as RoleType;
    case "SUBSTITUTE_GUARDIAN":
    case "BACKUP_GUARDIAN":
    case "BACKUP_PERMANENT_GUARDIAN":
      return "GUARDIAN_SUBSTITUTE_PERM" as RoleType;
    default:
      return null;
  }
}
