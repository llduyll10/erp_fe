import { FormMode } from "@/constants/common.constant";
import { CustomerForm } from "../CustomerForm";

export function CreateCustomerPage() {
	return <CustomerForm mode={FormMode.CREATE} />;
}
