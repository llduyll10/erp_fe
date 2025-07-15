/**
 * PDF Font Configuration
 * Centralized font management for PDF generation with Vietnamese support
 * Uses local fonts for reliability
 */

import { Font } from "@react-pdf/renderer";

// Font configuration state
let fontsRegistered = false;

/**
 * Register fonts for Vietnamese support using local font files
 */
export const registerPDFFonts = () => {
	if (fontsRegistered) {
		return;
	}

	try {
		// Register Noto Sans from local files
		Font.register({
			family: "NotoSans",
			fonts: [
				{
					src: "/fonts/NotoSans-Regular.ttf",
					fontWeight: "normal",
				},
				{
					src: "/fonts/NotoSans-Bold.ttf",
					fontWeight: "bold",
				},
			],
		});

		fontsRegistered = true;
		console.log("Local PDF fonts registered successfully");
	} catch (error) {
		console.error("Failed to register PDF fonts:", error);
		// Fallback to system fonts
		try {
			Font.register({
				family: "NotoSans",
				src: "Helvetica",
			});
			fontsRegistered = true;
			console.log("Fallback to system fonts");
		} catch (fallbackError) {
			console.error("Failed to register fallback fonts:", fallbackError);
		}
	}
};

// Font family names
export const PDF_FONTS = {
	PRIMARY: "NotoSans",
	FALLBACK: "Helvetica",
	SYSTEM: "Times-Roman",
} as const;

export type PDFFont = (typeof PDF_FONTS)[keyof typeof PDF_FONTS];