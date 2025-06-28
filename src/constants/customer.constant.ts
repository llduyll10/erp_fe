import {
	CustomerGroup,
	CustomerSource,
	CustomerStatus,
	CustomerType,
} from "@/enums/customer.enum";

export const CUSTOMER_GROUP_OPTIONS = Object.values(CustomerGroup).map(
	(group) => ({
		value: group,
		label: group,
	})
);

export const CUSTOMER_TYPE_OPTIONS = Object.values(CustomerType).map(
	(type) => ({
		value: type,
		label: type,
	})
);

export const CUSTOMER_SOURCE_OPTIONS = Object.values(CustomerSource).map(
	(source) => ({
		value: source,
		label: source,
	})
);

export const CUSTOMER_STATUS_OPTIONS = Object.values(CustomerStatus).map(
	(status) => ({
		value: status,
		label: status,
	})
);
