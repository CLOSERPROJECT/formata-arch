import z from 'zod';

//

export const OrganizationSchema = z.object({
	slug: z.string(),
	name: z.string()
});

export type Organization = z.infer<typeof OrganizationSchema>;

export const RoleSchema = z.object({
	orgSlug: z.string(),
	name: z.string(),
	slug: z.string(),
	palette: z.string().optional()
});

export type Role = z.infer<typeof RoleSchema>;

export const SubCategorySchema = z.object({
	slug: z.string(),
	name: z.string(),
	icon: z.string().optional(),
	iconURL: z.string().optional(),
	sortOrder: z.number().optional(),
	description: z.string().optional()
});

export type SubCategory = z.infer<typeof SubCategorySchema>;

export const CategorySchema = z.object({
	slug: z.string(),
	name: z.string(),
	icon: z.string().optional(),
	iconURL: z.string().optional(),
	sortOrder: z.number().optional(),
	subCategories: z.array(SubCategorySchema)
});

export type Category = z.infer<typeof CategorySchema>;

export const Schema = z.object({
	organizations: z.array(OrganizationSchema),
	roles: z.array(RoleSchema),
	categories: z.array(CategorySchema)
});

/** Full `/api/catalog` payload. */
export type Data = z.infer<typeof Schema>;
