import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { VariantForm } from "../VariantForm";
import { FormMode } from "@/constants/common.constant";
import { useState } from "react";

interface VariantModalProps {
	onSuccess?: () => void;
}

export function VariantModal({ onSuccess }: VariantModalProps) {
	const [open, setOpen] = useState(false);

	const handleSuccess = () => {
		setOpen(false); // Close modal
		onSuccess?.(); // Call parent callback
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-fit">
					Add Variant
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<VariantForm mode={FormMode.CREATE} onSuccess={handleSuccess} />
			</DialogContent>
		</Dialog>
	);
}
