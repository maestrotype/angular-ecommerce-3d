import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import isURL from 'validator/lib/isURL';

@ValidatorConstraint({ name: 'isProductMediaUrl', async: false })
export class IsProductMediaUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null) {
      return true;
    }
    if (typeof value !== 'string') {
      return false;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return false;
    }
    if (trimmed.startsWith('assets/') || trimmed.startsWith('/')) {
      return true;
    }
    return isURL(trimmed, { protocols: ['http', 'https'], require_protocol: true });
  }

  defaultMessage(): string {
    return 'imageUrl must be a URL address';
  }
}

export function IsProductMediaUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsProductMediaUrlConstraint,
    });
  };
}
