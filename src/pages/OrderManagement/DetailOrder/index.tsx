import { FormMode } from "@/constants/common.constant";
import { OrderForm } from "../OrderForm";

export function DetailOrderPage() {
	return <OrderForm mode={FormMode.DETAILS} />;
}
