export enum ProductStatus {
	ACTIVE = "active",
	INACTIVE = "inactive",
	DISCONTINUED = "discontinued",
}

export enum ProductItemType {
	CLOTHING = "CLOTHING", // Clothing items - Áo, Quần, Đầm, Váy, ...
	PANTS = "PANTS", // Pants/Trousers - Quần, Quần tây, Quần jean, ...
	SET = "SET", // Clothing sets - Bộ đồ, Bộ đồ công sở, Bộ đồ phụ kiện, ...
	SHOES = "SHOES", // Footwear - Giày, Dép, ...
	ACCESSORIES = "ACCESSORIES", // Accessories - Phụ kiện, ...
	OFFICE_SUPPLIES = "OFFICE_SUPPLIES", // Office supplies - Văn phòng phẩm, ...
	OTHER = "OTHER", // Other items - Khác
}

export enum ProductSize {
	XS = "XS",
	S = "S",
	M = "M",
	L = "L",
	XL = "XL",
	XXL = "XXL",
	FREE_SIZE = "FREE_SIZE",
}

export enum ProductUnit {
	PIECE = "PIECE", // Individual pieces - 1 cái
	SET = "SET", // Sets/Collections - 1 bộ
	PAIR = "PAIR", // Pairs (shoes, etc.) - 1 đôi
}

/**
 * Predefined colors for product variants
 * Each color has a 3-character code for SKU generation
 */
export enum ProductColor {
	// Basic Colors - Màu cơ bản
	BLACK = "BLACK", // BLK
	WHITE = "WHITE", // WHT
	GRAY = "GRAY", // GRY
	GREY = "GREY", // GRY (alternative spelling)

	// Primary Colors - Màu chính
	RED = "RED", // RED
	BLUE = "BLUE", // BLU
	GREEN = "GREEN", // GRN
	YELLOW = "YELLOW", // YEL

	// Secondary Colors - Màu phụ
	PURPLE = "PURPLE", // PUR
	ORANGE = "ORANGE", // ORG
	PINK = "PINK", // PNK
	BROWN = "BROWN", // BRN

	// Metallic Colors - Màu kim loại
	SILVER = "SILVER", // SLV
	GOLD = "GOLD", // GLD
	BRONZE = "BRONZE", // BRZ
	COPPER = "COPPER", // CPR

	// Fashion Colors - Màu thời trang
	NAVY = "NAVY", // NVY
	MAROON = "MAROON", // MAR
	TEAL = "TEAL", // TEL
	LIME = "LIME", // LIM
	MAGENTA = "MAGENTA", // MAG
	CYAN = "CYAN", // CYN

	// Neutral Colors - Màu trung tính
	BEIGE = "BEIGE", // BEG
	CREAM = "CREAM", // CRM
	KHAKI = "KHAKI", // KHK
	IVORY = "IVORY", // IVY

	// Pastel Colors - Màu pastel
	LIGHT_BLUE = "LIGHT_BLUE", // LBL
	LIGHT_PINK = "LIGHT_PINK", // LPK
	LIGHT_GREEN = "LIGHT_GREEN", // LGR
	LIGHT_YELLOW = "LIGHT_YELLOW", // LYL

	// Dark Colors - Màu tối
	DARK_BLUE = "DARK_BLUE", // DBL
	DARK_GREEN = "DARK_GREEN", // DGR
	DARK_RED = "DARK_RED", // DRD
	DARK_GRAY = "DARK_GRAY", // DGY

	// Mixed/Pattern - Màu phối/họa tiết
	MULTICOLOR = "MULTICOLOR", // MUL
	TRANSPARENT = "TRANSPARENT", // TRP
	RAINBOW = "RAINBOW", // RBW
}

/**
 * Product Gender Classification
 * Used to categorize products by target gender
 */
export enum ProductGender {
	MALE = "MALE", // Nam giới - MAL
	FEMALE = "FEMALE", // Nữ giới - FEM
	CHILDREN = "CHILDREN", // Trẻ em - CHI
	UNISEX = "UNISEX", // Unisex - UNI
	BABY = "BABY", // Em bé - BAB
	TEEN = "TEEN", // Thanh thiếu niên - TEE
}
