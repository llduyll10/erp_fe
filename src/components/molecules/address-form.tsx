import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { Control } from "react-hook-form";
import { useState, useMemo, useEffect } from "react";
import { level1s, Level1, Level2, Level3, findLevel1ByName } from "dvhcvn";

interface AddressFormProps {
	control: Control<any>;
	prefix?: string;
	titleKey?: string;
	disabled?: boolean;
	onProvinceChange?: (province: Level1 | null) => void;
	onDistrictChange?: (district: Level2 | null) => void;
}

export function AddressForm({
	control,
	prefix = "",
	titleKey,
	disabled = false,
	onProvinceChange,
	onDistrictChange,
}: AddressFormProps) {
	const { t } = useTranslation("customer");
	const [selectedProvince, setSelectedProvince] = useState<Level1 | null>(null);
	const [selectedDistrict, setSelectedDistrict] = useState<Level2 | null>(null);

	const getFieldName = (fieldName: string) => {
		return prefix ? `${prefix}_${fieldName}` : fieldName;
	};

	// Get all provinces (Level1)
	const provinces = useMemo(() => level1s, []);

	// Get districts based on selected province
	const districts = useMemo(() => {
		if (!selectedProvince) return [];
		return selectedProvince.children || [];
	}, [selectedProvince]);

	// Get wards based on selected district
	const wards = useMemo(() => {
		if (!selectedDistrict) return [];
		return selectedDistrict.children || [];
	}, [selectedDistrict]);

	// Convert data to combobox options
	const provinceOptions = useMemo(
		() =>
			provinces.map((province) => ({
				value: province.name,
				label: province.name,
			})),
		[provinces]
	);

	const districtOptions = useMemo(
		() =>
			districts.map((district) => ({
				value: district.name,
				label: district.name,
			})),
		[districts]
	);

	const wardOptions = useMemo(
		() =>
			wards.map((ward) => ({
				value: ward.name,
				label: ward.name,
			})),
		[wards]
	);

	// Sync state with form values (for copy functionality)
	useEffect(() => {
		const currentProvinceName = control._getWatch(
			getFieldName("state_province")
		);

		if (!currentProvinceName) {
			// Reset state when form value is cleared
			setSelectedProvince(null);
			setSelectedDistrict(null);
		} else if (currentProvinceName && !selectedProvince) {
			const province = provinces.find((p) => p.name === currentProvinceName);
			if (province) {
				setSelectedProvince(province);
			}
		}
	}, [
		control._getWatch(getFieldName("state_province")),
		provinces,
		selectedProvince,
	]);

	useEffect(() => {
		const currentDistrictName = control._getWatch(getFieldName("district"));

		if (!currentDistrictName) {
			// Reset district state when form value is cleared
			setSelectedDistrict(null);
		} else if (currentDistrictName && selectedProvince && !selectedDistrict) {
			const district = districts.find((d) => d.name === currentDistrictName);
			if (district) {
				setSelectedDistrict(district);
			}
		}
	}, [
		control._getWatch(getFieldName("district")),
		districts,
		selectedDistrict,
		selectedProvince,
	]);

	return (
		<div className="space-y-4">
			{titleKey && <h3 className="text-lg font-medium">{t(titleKey)}</h3>}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Street Address */}
				<FormField
					control={control}
					name={getFieldName("street_address")}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("streetAddress")}</FormLabel>
							<FormControl>
								<Input {...field} placeholder={t("streetAddressPlaceholder")} disabled={disabled} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Country - Fixed as Vietnam */}
				<FormField
					control={control}
					name={getFieldName("country")}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("country")}</FormLabel>
							<FormControl>
								<Input
									{...field}
									value="Việt Nam"
									readOnly
									disabled={disabled}
									className="bg-gray-50"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Province/City with combobox */}
				<FormField
					control={control}
					name={getFieldName("state_province")}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("stateProvince")}</FormLabel>
							<FormControl>
								<Combobox
									options={provinceOptions}
									value={field.value}
									onValueChange={(value) => {
										const province = provinces.find(
											(p: Level1) => p.name === value
										);
										if (province) {
											setSelectedProvince(province);
											field.onChange(value);
											// Reset district and ward when province changes
											setSelectedDistrict(null);
											onProvinceChange?.(province);
										}
									}}
									placeholder={t("stateProvincePlaceholder")}
									searchPlaceholder={t("searchProvince", "Search province...")}
									emptyText={t("noProvinceFound", "No province found.")}
									className="w-full"
									disabled={disabled}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* District/Town with combobox */}
				<FormField
					control={control}
					name={getFieldName("district")}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("district")}</FormLabel>
							<FormControl>
								<Combobox
									options={districtOptions}
									value={field.value}
									onValueChange={(value) => {
										const district = districts.find(
											(d: Level2) => d.name === value
										);
										if (district) {
											setSelectedDistrict(district);
											field.onChange(value);
											onDistrictChange?.(district);
										}
									}}
									placeholder={t("districtPlaceholder")}
									searchPlaceholder={t("searchDistrict", "Search district...")}
									emptyText={t("noDistrictFound", "No district found.")}
									disabled={disabled || !selectedProvince}
									className="w-full"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Ward/Commune with combobox */}
				<FormField
					control={control}
					name={getFieldName("ward")}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("ward")}</FormLabel>
							<FormControl>
								<Combobox
									options={wardOptions}
									value={field.value}
									onValueChange={field.onChange}
									placeholder={t("wardPlaceholder")}
									searchPlaceholder={t("searchWard", "Search ward...")}
									emptyText={t("noWardFound", "No ward found.")}
									disabled={disabled || !selectedDistrict}
									className="w-full"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Postal Code */}
				<FormField
					control={control}
					name={getFieldName("postal_code")}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("postalCode")}</FormLabel>
							<FormControl>
								<Input {...field} placeholder={t("postalCodePlaceholder")} disabled={disabled} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
