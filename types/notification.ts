/**
 * 通知状态枚举
 * SENT: 已发送
 * READ: 已读
 * CLICKED: 已点击
 */
export enum NotificationStatus {
  SENT = 0,
  READ = 1,
  CLICKED = 2,
}

/**
 * 通知记录实体
 */
export interface NotificationRecord {
  id: number;
  redemptionCodeId: number;
  notifiedAt: number;
  content: string;
  status: NotificationStatus;
  clickedAt: number | null;
}

/**
 * 通知记录（含兑换码信息）
 */
export interface NotificationRecordWithCode extends NotificationRecord {
  code: string;
  codeId: number;
}

/**
 * 通知记录数据库原始行（snake_case字段）
 */
export interface NotificationRecordRow {
  id: number;
  redemption_code_id: number;
  notified_at: number;
  content: string;
  status: number;
  clicked_at: number | null;
}
