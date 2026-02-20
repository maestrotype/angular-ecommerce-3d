import { SocialAuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from '@abacritt/angularx-social-login';

export const socialAuthConfig: SocialAuthServiceConfig = {
    autoLogin: false,
    providers: [
        {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
                'YOUR_GOOGLE_CLIENT_ID' // Replace with actual Client ID
            )
        },
        {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(
                'YOUR_FACEBOOK_APP_ID' // Replace with actual App ID
            )
        }
    ],
    onError: (err) => {
        console.error('Social Auth Error:', err);
    }
};
