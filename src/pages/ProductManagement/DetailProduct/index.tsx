import { FormMode } from "@/constants/common.constant";
import { ProductForm } from "../ProductForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VariantForm } from "../Variant/VariantForm";

export function ProductDetailPage() {
	return (
		<div className="w-full flex flex-col gap-4 p-8">
			<Tabs defaultValue="product" className="w-full">
				<TabsList>
					<TabsTrigger value="product">Product</TabsTrigger>
					<TabsTrigger value="variant">Variant</TabsTrigger>
				</TabsList>
				<TabsContent value="product">
					<ProductForm mode={FormMode.DETAILS} />
				</TabsContent>
				<TabsContent value="variant">
					<VariantForm mode={FormMode.DETAILS} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
