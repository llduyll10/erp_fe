import { UserRoleEnum } from "@/enums/user.enums";

export const USER_ROLE_OPTIONS = [
	// System Level
	{
		label: "Super Admin",
		value: UserRoleEnum.SUPERADMIN,
		group: "System"
	},
	
	// Company Level
	{
		label: "Company Admin",
		value: UserRoleEnum.ADMIN_COMPANY,
		group: "Company"
	},
	{
		label: "Admin",
		value: UserRoleEnum.ADMIN,
		group: "Company"
	},
	{
		label: "Member",
		value: UserRoleEnum.MEMBER,
		group: "Company"
	},
	
	// Sales Department
	{
		label: "Sales Admin",
		value: UserRoleEnum.SALE_ADMIN,
		group: "Sales"
	},
	{
		label: "Sales Member",
		value: UserRoleEnum.SALE_MEMBER,
		group: "Sales"
	},
	
	// Production Department
	{
		label: "Workshop Admin",
		value: UserRoleEnum.WORKSHOP_ADMIN,
		group: "Production"
	},
	{
		label: "Workshop Member",
		value: UserRoleEnum.WORKSHOP_MEMBER,
		group: "Production"
	},
	
	// Finance Department
	{
		label: "Accounting Admin",
		value: UserRoleEnum.ACCOUNTING_ADMIN,
		group: "Finance"
	},
	{
		label: "Accounting Member",
		value: UserRoleEnum.ACCOUNTING_MEMBER,
		group: "Finance"
	},
	
	// Legacy
	{
		label: "User (Legacy)",
		value: UserRoleEnum.USER,
		group: "Legacy"
	},
];

// Helper functions for role management
export const ROLE_HIERARCHY = {
	[UserRoleEnum.SUPERADMIN]: 10,
	[UserRoleEnum.ADMIN_COMPANY]: 9,
	[UserRoleEnum.ADMIN]: 8,
	[UserRoleEnum.SALE_ADMIN]: 7,
	[UserRoleEnum.WORKSHOP_ADMIN]: 7,
	[UserRoleEnum.ACCOUNTING_ADMIN]: 7,
	[UserRoleEnum.MEMBER]: 6,
	[UserRoleEnum.SALE_MEMBER]: 5,
	[UserRoleEnum.WORKSHOP_MEMBER]: 5,
	[UserRoleEnum.ACCOUNTING_MEMBER]: 5,
	[UserRoleEnum.USER]: 1,
};

// Check if user has permission level
export const hasMinimumRole = (userRole: UserRoleEnum, requiredRole: UserRoleEnum): boolean => {
	return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Get roles by department
export const DEPARTMENT_ROLES = {
	SALES: [UserRoleEnum.SALE_ADMIN, UserRoleEnum.SALE_MEMBER],
	PRODUCTION: [UserRoleEnum.WORKSHOP_ADMIN, UserRoleEnum.WORKSHOP_MEMBER],
	FINANCE: [UserRoleEnum.ACCOUNTING_ADMIN, UserRoleEnum.ACCOUNTING_MEMBER],
	COMPANY: [UserRoleEnum.ADMIN_COMPANY, UserRoleEnum.ADMIN, UserRoleEnum.MEMBER],
	SYSTEM: [UserRoleEnum.SUPERADMIN],
};

// Check if user belongs to department
export const isInDepartment = (userRole: UserRoleEnum, department: keyof typeof DEPARTMENT_ROLES): boolean => {
	return DEPARTMENT_ROLES[department].includes(userRole);
};
