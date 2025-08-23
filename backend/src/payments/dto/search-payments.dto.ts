export class SearchPaymentsDto {
  status?: any;
  paymentMethod?: any;
  startDate?: any;
  endDate?: any;
  customerEmail?: any;
  minAmount?: any;
  maxAmount?: any;
  limit?: any = 20;
  offset?: any = 0;
} 