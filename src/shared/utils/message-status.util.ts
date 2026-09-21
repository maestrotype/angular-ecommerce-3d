import { TranslateService } from '@ngx-translate/core';

const MESSAGE_STATUS_I18N: Record<string, string> = {
  new: 'MESSAGE_STATUS.NEW',
  in_progress: 'MESSAGE_STATUS.IN_PROGRESS',
  answered: 'MESSAGE_STATUS.ANSWERED',
  closed: 'MESSAGE_STATUS.CLOSED',
};

export function getMessageStatusLabel(
  status: string | undefined | null,
  translate: TranslateService,
): string {
  if (!status) {
    return '';
  }
  const key = MESSAGE_STATUS_I18N[status];
  if (!key) {
    return status.replace(/_/g, ' ');
  }
  const translated = translate.instant(key);
  return translated !== key ? translated : status.replace(/_/g, ' ');
}
