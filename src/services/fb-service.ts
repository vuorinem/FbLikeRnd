import { DOM, PLATFORM } from "aurelia-framework";

export class FbService {
    public FB: facebook.FacebookStatic | undefined;

    public initialize(): Promise<void> {
        const fbService = this;

        return new Promise((resolve, reject) => {
            PLATFORM.global.fbAsyncInit = function () {
                PLATFORM.global.FB.init({
                    appId: '1702672053101084',
                    cookie: true,
                    xfbml: true,
                    version: 'v2.11'
                });

                PLATFORM.global.FB.AppEvents.logPageView();

                fbService.FB = PLATFORM.global.FB;

                resolve();
            };

            const scriptTag = DOM.createElement('script');

            if (!(scriptTag instanceof HTMLScriptElement)) {
                reject('Cannot create SCRIPT tag');
                return;
            }

            scriptTag.src = 'https://connect.facebook.net/en_US/sdk.js';
            scriptTag.async = true;

            const fbContainer = DOM.getElementById('fb-container');
            fbContainer.appendChild(scriptTag);
        });
    }
}
