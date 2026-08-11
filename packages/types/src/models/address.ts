import { AddressType } from '../enums';

/** User address */
export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

/** Create/update address request */
export interface AddressRequest {
  type: AddressType;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  deliveryInstructions?: string;
}
