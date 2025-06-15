import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex items-center justify-center h-full w-full">
			<Loader2 className="animate-spin w-6 h-6 text-gray-400" />
			<span className="ml-2 text-gray-500">Loading...</span>
		</div>
	);
}
