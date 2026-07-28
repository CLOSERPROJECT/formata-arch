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

export const CategorySubTreeSchema = z.object({
	slug: z.string(),
	name: z.string(),
	icon: z.string().optional(),
	iconURL: z.string().optional(),
	sortOrder: z.number().optional(),
	description: z.string().optional()
});

export type CategorySubTree = z.infer<typeof CategorySubTreeSchema>;

export const CategoryTreeSchema = z.object({
	slug: z.string(),
	name: z.string(),
	icon: z.string().optional(),
	iconURL: z.string().optional(),
	sortOrder: z.number().optional(),
	subCategories: z.array(CategorySubTreeSchema)
});

export type CategoryTree = z.infer<typeof CategoryTreeSchema>;

export const CatalogSchema = z.object({
	organizations: z.array(OrganizationSchema),
	roles: z.array(RoleSchema),
	categories: z.array(CategoryTreeSchema)
});

export type Catalog = z.infer<typeof CatalogSchema>;
