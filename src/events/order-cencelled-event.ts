import {Subjects} from "./subjects";
import {OrderStatus} from "./types/order-status";

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  // 必要な情報のみ
  data: {
    id: string;
    version: number;
    ticket: {
      id: string;
    }
  }
}