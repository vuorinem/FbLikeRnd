import { computedFrom, autoinject } from "aurelia-framework";

import { FbService } from "services/fb-service";

@autoinject
export class UserService {
    private authResponse: any;
    private name: string | undefined;

    @computedFrom('authResponse')
    private get isAuthenticated(): boolean {
        return this.authResponse.status === 'connected';
    }

    constructor(private fbService: FbService) {
        // No-op
    }

    public initialize(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            await this.fbService.initialize();

            this.fbService.FB.getLoginStatus(async response => {
                this.authResponse = response;

                await this.updateUserDetails();

                resolve();
            });
        });
    }

    public login(): Promise<void> {
        return new Promise((resolve, reject) => {
            const handleResponse = async response => {
                this.authResponse = response;

                await this.updateUserDetails();

                resolve();
            }

            this.fbService.FB.login(handleResponse, {
                scope: 'manage_pages,pages_show_list',
            });
        });
    }

    private updateUserDetails(): Promise<void> {
        if (!this.isAuthenticated) {
            this.name = undefined;
        }

        return new Promise((resolve, reject) => {
            this.fbService.FB.api('/me', response => {
                this.name = response.name;

                resolve();
            });
        });
    }
}