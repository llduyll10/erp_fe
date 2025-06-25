import type { Company } from "./company.model";
import { Product } from "./product.model";
import {
	ProductSize,
	ProductColor,
	ProductGender,
	ProductUnit,
	ProductStatus,
} from "@/enums/product.enum";

type ProductVariant = {
	// @PrimaryGeneratedColumn('uuid')
	// id: string;

	// @Column({ type: 'uuid' })
	// company_id: string;

	// @Column({ type: 'uuid' })
	// product_id: string;

	// @Column({ type: 'varchar', length: 32 })
	// sku: string; // SKU unique per company

	// @Column({ type: 'varchar', length: MAX_LENGTH_INPUT, nullable: true })
	// variant_name: string; // Tên biến thể (VD: "Áo thun đỏ size M")

	// @Column({
	//   type: 'enum',
	//   enum: ProductSize,
	//   default: ProductSize.FREE_SIZE,
	// })
	// size: ProductSize;

	// @Column({
	//   type: 'enum',
	//   enum: ProductColor,
	//   nullable: true,
	// })
	// color: ProductColor | null; // Màu sắc (từ enum predefined)

	// @Column({
	//   type: 'enum',
	//   enum: ProductGender,
	//   default: ProductGender.UNISEX,
	// })
	// gender: ProductGender; // Giới tính mục tiêu

	// @Column({ type: 'decimal', precision: 10, scale: 2 })
	// price: number; // Giá bán

	// @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	// cost: number; // Giá vốn

	// @Column({
	//   type: 'enum',
	//   enum: ProductUnit,
	//   default: ProductUnit.PIECE, //
	// })
	// unit: ProductUnit; // Đơn vị tính

	// @Column({ type: 'integer', default: 0 })
	// quantity: number; // Tồn kho hiện tại của variant này

	// @Column({
	//   type: 'enum',
	//   enum: ProductStatus,
	//   default: ProductStatus.ACTIVE,
	// })
	// status: ProductStatus;

	// @CreateDateColumn()
	// created_at: Date;

	// @UpdateDateColumn()
	// updated_at: Date;

	// // Relations
	// @ManyToOne(() => Company)
	// @JoinColumn({ name: 'company_id' })
	// company: Company;

	// @ManyToOne(() => Product, (product) => product.variants)
	// @JoinColumn({ name: 'product_id' })
	// product: Product;

	id: string;
	company_id: string;
	product_id: string;
	sku: string;
	variant_name?: string | null;
	size: ProductSize;
	color?: ProductColor | null;
	gender: ProductGender;
	price: number;
	cost?: number | null;
	unit?: ProductUnit | null;
	quantity?: number | null;
	status?: ProductStatus | null;
	created_at: Date;
	updated_at: Date;
	company?: Company | null;
	product?: Product | null;
};

export type { ProductVariant };
