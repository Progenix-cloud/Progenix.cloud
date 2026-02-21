// Dynamic custom fields service
export interface CustomField {
  id: string;
  name: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  entity: 'project' | 'task' | 'client' | 'invoice' | 'meeting';
  required: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
  displayOrder: number;
  createdAt: Date;
  createdBy: string;
}

export interface CustomFieldValue {
  entityId: string;
  fieldId: string;
  value: any;
}

// In-memory stores
const fieldDefinitions = new Map<string, CustomField>();
const fieldValues = new Map<string, CustomFieldValue[]>();

export const customFieldsService = {
  // Create custom field definition
  createField: async (field: Omit<CustomField, 'id' | 'createdAt'>): Promise<CustomField> => {
    const id = `cf-${Date.now()}-${Math.random()}`;
    const fullField: CustomField = {
      ...field,
      id,
      createdAt: new Date(),
    };

    fieldDefinitions.set(id, fullField);
    console.log('[v0] Custom field created:', fullField);
    return fullField;
  },

  // Get all custom fields
  getFields: async (entity?: string): Promise<CustomField[]> => {
    const fields = Array.from(fieldDefinitions.values());
    if (entity) {
      return fields.filter(f => f.entity === entity);
    }
    return fields;
  },

  // Get field by ID
  getField: async (id: string): Promise<CustomField | null> => {
    return fieldDefinitions.get(id) || null;
  },

  // Update field definition
  updateField: async (id: string, updates: Partial<CustomField>): Promise<CustomField | null> => {
    const field = fieldDefinitions.get(id);
    if (!field) return null;

    const updated = { ...field, ...updates };
    fieldDefinitions.set(id, updated);
    return updated;
  },

  // Delete field
  deleteField: async (id: string): Promise<boolean> => {
    fieldDefinitions.delete(id);
    // Clean up values
    for (const [key, values] of fieldValues) {
      fieldValues.set(key, values.filter(v => v.fieldId !== id));
    }
    return true;
  },

  // Set field value for entity
  setFieldValue: async (
    entityId: string,
    fieldId: string,
    value: any
  ): Promise<CustomFieldValue> => {
    const field = await customFieldsService.getField(fieldId);
    if (!field) throw new Error('Field not found');

    // Validate field type
    if (field.fieldType === 'number' && isNaN(Number(value))) {
      throw new Error('Invalid number value');
    }

    const key = `${entityId}`;
    let values = fieldValues.get(key) || [];

    // Update or create value
    const existingIndex = values.findIndex(v => v.fieldId === fieldId);
    const fieldValue: CustomFieldValue = { entityId, fieldId, value };

    if (existingIndex > -1) {
      values[existingIndex] = fieldValue;
    } else {
      values.push(fieldValue);
    }

    fieldValues.set(key, values);
    return fieldValue;
  },

  // Get field values for entity
  getFieldValues: async (entityId: string): Promise<CustomFieldValue[]> => {
    return fieldValues.get(entityId) || [];
  },

  // Get field value
  getFieldValue: async (entityId: string, fieldId: string): Promise<any> => {
    const values = await customFieldsService.getFieldValues(entityId);
    const value = values.find(v => v.fieldId === fieldId);
    return value?.value || null;
  },

  // Validate field values
  validateFieldValues: async (entity: string, values: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    const fields = await customFieldsService.getFields(entity);

    for (const field of fields) {
      if (field.required && (!values[field.id] || values[field.id] === '')) {
        errors.push(`${field.name} is required`);
      }

      if (field.fieldType === 'number' && values[field.id] && isNaN(Number(values[field.id]))) {
        errors.push(`${field.name} must be a number`);
      }

      if (field.fieldType === 'select' && values[field.id] && field.options) {
        if (!field.options.includes(values[field.id])) {
          errors.push(`${field.name} has an invalid value`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Create default fields for entity
  createDefaultFields: async (entity: string, createdBy: string): Promise<void> => {
    if (entity === 'project') {
      await customFieldsService.createField({
        name: 'Project Code',
        fieldType: 'text',
        entity: 'project',
        required: false,
        displayOrder: 1,
        createdBy,
      });

      await customFieldsService.createField({
        name: 'Project Type',
        fieldType: 'select',
        entity: 'project',
        required: false,
        options: ['Web Development', 'Mobile App', 'Consulting', 'Maintenance'],
        displayOrder: 2,
        createdBy,
      });

      await customFieldsService.createField({
        name: 'Budget Approved',
        fieldType: 'checkbox',
        entity: 'project',
        required: false,
        displayOrder: 3,
        createdBy,
      });
    }
  },

  // Export custom fields as JSON
  exportFields: async (entity?: string): Promise<string> => {
    const fields = await customFieldsService.getFields(entity);
    return JSON.stringify(fields, null, 2);
  },

  // Import custom fields from JSON
  importFields: async (json: string, createdBy: string): Promise<number> => {
    let count = 0;
    try {
      const fields = JSON.parse(json);
      for (const field of fields) {
        await customFieldsService.createField({
          ...field,
          createdBy,
        });
        count++;
      }
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
    return count;
  },
};

export type CustomFieldsService = typeof customFieldsService;
