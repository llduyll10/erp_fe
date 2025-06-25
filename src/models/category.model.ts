import type { Company } from "./company.model";

type Category = {
	id: string;
	company_id: string;
	name: string;
	description?: string | null;
	parent_id?: string | null;
	sort_order: number;
	created_at: Date;
	updated_at: Date;
	company?: Company | null;
	parent?: Category | null;
	children?: Category[];
};

export type { Category };
