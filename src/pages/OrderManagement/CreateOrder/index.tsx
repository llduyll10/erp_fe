import { FormMode } from "@/constants/common.constant";
import { OrderForm } from "../OrderForm";

export function CreateOrderPage() {
	return <OrderForm mode={FormMode.CREATE} />;
}
