import { platform } from './types';

export default function prettyPlatform(platform: platform): string {
    let pf = 'generic';

    switch (platform) {
        case 'psn':
            pf = 'PSN';
            break;
        case 'xbox':
            pf = 'Xbox';
            break;
        case 'switch':
            pf = 'Switch';
            break;
        case 'pc':
            pf = 'PC';
            break;
        default:
            pf = 'generic';
            break;
    }

    return pf;
}
