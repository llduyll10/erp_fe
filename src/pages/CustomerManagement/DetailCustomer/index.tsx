import { FormMode } from "@/constants/common.constant";
import { CustomerForm } from "../CustomerForm";

export function DetailCustomerPage() {
	return <CustomerForm mode={FormMode.DETAILS} />;
}
