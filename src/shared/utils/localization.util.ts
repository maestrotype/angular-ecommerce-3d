import { LocalizedString } from '../models/localized-string.model';
import { resolveApiUrl } from '../../app/core/utils/api-url.util';

export interface ResolvedApiError {
  title: string;
  message: string;
  panelClass: string[];
  duration: number;
}

export function getLocalizedString(value: string | LocalizedString | undefined | null, lang: string = 'en'): string {
    if (!value) return '';
    if (typeof value === 'string') return value;

    return value[lang as keyof LocalizedString] || value['en'] || Object.values(value)[0] || '';
}

export function translateErrorMessage(message: string, translate: any): string {
    if (!message) return '';

    const match = message.match(/^([A-Z0-9_]+\.[A-Z0-9_]+): (.*)$/);
    if (match) {
        const key = match[1];
        const rest = match[2];
        const translatedKey = translate.instant(key);
        const translatedRest = translate.instant(rest);

        if (translatedKey !== key) {
            return `${translatedKey}: ${translatedRest}`;
        }
    }

    const translated = translate.instant(message);
    return translated !== message ? translated : message;
}

function isDevelopmentHost(): boolean {
    return typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
}

function isLocalApiUrl(): boolean {
    return resolveApiUrl().includes('localhost:3002');
}

function isProductionApiUrl(): boolean {
    return resolveApiUrl().includes('onrender.com');
}

function isNetworkFailure(err: any, rawMsg: string): boolean {
    const status = err?.status ?? 0;
    return (
        !status ||
        status === 0 ||
        rawMsg === 'Failed to fetch' ||
        rawMsg.includes('Http failure response') ||
        rawMsg.includes('NetworkError')
    );
}

function isCloudinarySizeError(rawMsg: string): boolean {
    return (
        rawMsg.includes('File size too large') ||
        rawMsg.includes('Maximum is 10485760') ||
        rawMsg.includes('10485760') ||
        rawMsg.includes('still larger than 10MB')
    );
}

function isServerSleepingError(err: any, rawMsg: string, targetsProductionApi = false): boolean {
    const status = err?.status ?? 0;
    if ([502, 503, 504].includes(status)) {
        return true;
    }
    if (!isNetworkFailure(err, rawMsg)) {
        return false;
    }
    return targetsProductionApi || isProductionApiUrl();
}

export function resolveApiError(
    err: any,
    translate: any,
    options?: {
        titleKey?: string;
        isLocalApi?: boolean;
        isDevelopment?: boolean;
        /** Request was sent to production Render API (e.g. Cloudinary upload), not the local API toggle. */
        targetsProductionApi?: boolean;
    },
): ResolvedApiError {
    const status = err?.status ?? 0;
    const rawMsg = err?.error?.message || err?.message || '';
    const titleKey = options?.titleKey || 'ERROR_TITLE';
    const targetsProductionApi = options?.targetsProductionApi ?? false;
    const isLocalApi = targetsProductionApi ? false : (options?.isLocalApi ?? isLocalApiUrl());
    const isDevelopment = options?.isDevelopment ?? isDevelopmentHost();

    if (isCloudinarySizeError(rawMsg)) {
        return {
            title: translate.instant(options?.titleKey || 'MODEL_3D_UPLOAD_FAILED'),
            message: translate.instant('CLOUDINARY_3D_FILE_TOO_LARGE'),
            panelClass: ['error-snackbar'],
            duration: 12000,
        };
    }

    if (rawMsg.includes('CLOUDINARY_NOT_CONFIGURED')) {
        return {
            title: translate.instant('CLOUDINARY_UPLOAD_BLOCKED_TITLE'),
            message: translate.instant('CLOUDINARY_NOT_CONFIGURED_MSG'),
            panelClass: ['error-snackbar'],
            duration: 18000,
        };
    }

    if (isServerSleepingError(err, rawMsg, targetsProductionApi)) {
        let message = translate.instant('SERVER_SLEEPING_MSG');
        if (status === 0 || rawMsg === 'Failed to fetch') {
            message += `\n${translate.instant('SERVER_SLEEPING_CORS_HINT')}`;
        }
        if (isDevelopment) {
            message += `\n${translate.instant('SERVER_SLEEPING_LOCAL_HINT')}`;
        }
        return {
            title: translate.instant('SERVER_SLEEPING_TITLE'),
            message,
            panelClass: ['warning-snackbar'],
            duration: 22000,
        };
    }

    if (isNetworkFailure(err, rawMsg) && isLocalApi) {
        return {
            title: translate.instant('LOCAL_BACKEND_DOWN_TITLE'),
            message: translate.instant('LOCAL_BACKEND_DOWN_MSG'),
            panelClass: ['warning-snackbar'],
            duration: 15000,
        };
    }

    if (isNetworkFailure(err, rawMsg)) {
        return {
            title: translate.instant('NETWORK_ERROR_TITLE'),
            message: translate.instant('NETWORK_ERROR_MSG'),
            panelClass: ['error-snackbar'],
            duration: 12000,
        };
    }

    const statusSuffix = status ? ` [HTTP ${status}]` : '';
    return {
        title: translate.instant(titleKey),
        message: `${translateErrorMessage(rawMsg || 'UNKNOWN_ERROR', translate)}${statusSuffix}`,
        panelClass: ['error-snackbar'],
        duration: 12000,
    };
}

export function formatResolvedApiError(resolved: ResolvedApiError): string {
    return `${resolved.title}\n${resolved.message}`;
}

export function getDetailedUploadErrorMessage(err: any, translate: any): string {
    return resolveApiError(err, translate, { titleKey: 'MODEL_3D_UPLOAD_FAILED' }).message;
}
