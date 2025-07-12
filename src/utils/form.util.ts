import { z } from "zod";

/**
 * Checks if a field is required based on Zod schema
 * @param schema - The Zod schema object
 * @param fieldName - The field name to check
 * @returns boolean - true if field is required
 */
export const isFieldRequired = (schema: z.ZodSchema<any>, fieldName: string): boolean => {
  try {
    // Get the field schema from the object schema
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const fieldSchema = shape[fieldName];
      
      if (!fieldSchema) return false;
      
      // Check if field is optional
      if (fieldSchema instanceof z.ZodOptional) {
        return false;
      }
      
      // Check if field is nullable
      if (fieldSchema instanceof z.ZodNullable && fieldSchema._def.innerType instanceof z.ZodOptional) {
        return false;
      }
      
      // Check if it's a default schema (usually means optional)
      if (fieldSchema instanceof z.ZodDefault) {
        return false;
      }
      
      // Check for union types that include undefined/null
      if (fieldSchema instanceof z.ZodUnion) {
        const types = fieldSchema._def.options;
        const hasUndefined = types.some((type: any) => 
          type instanceof z.ZodUndefined || 
          type instanceof z.ZodNull ||
          (type instanceof z.ZodLiteral && (type._def.value === undefined || type._def.value === null))
        );
        if (hasUndefined) return false;
      }
      
      // If none of the above, it's likely required
      return true;
    }
    
    return false;
  } catch (error) {
    // If we can't determine, default to not required
    return false;
  }
};

/**
 * Alternative method using the actual validation result
 * This checks if the field would fail validation with empty/undefined value
 */
export const isFieldRequiredByValidation = (schema: z.ZodSchema<any>, fieldName: string): boolean => {
  try {
    if (schema instanceof z.ZodObject) {
      // Create a test object with only the field being undefined
      const testData = { [fieldName]: undefined };
      
      // Try to parse - if it fails, the field is required
      const result = schema.safeParse(testData);
      
      if (!result.success) {
        // Check if the error is specifically for this field
        const fieldError = result.error.errors.find(err => 
          err.path.length === 1 && err.path[0] === fieldName
        );
        
        if (fieldError && (
          fieldError.code === 'invalid_type' || 
          fieldError.code === 'custom' ||
          fieldError.message.toLowerCase().includes('required')
        )) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
};