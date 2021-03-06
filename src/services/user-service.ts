import { computedFrom, autoinject } from "aurelia-framework";

import { FbService } from "services/fb-service";

@autoinject
export class UserService {
  public id: string | undefined;
  public name: string | undefined;

  private authResponse: any;

  @computedFrom('id')
  public get isAuthenticated(): boolean {
    return this.id !== undefined;
  }

  @computedFrom('authResponse')
  public get isConnected(): boolean {
    return this.authResponse.status === 'connected';
  }

  constructor(private fbService: FbService) {
    // No-op
  }

  public initialize(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.fbService.initialize();

      this.fbService.FB.getLoginStatus(this.getAuthResponseHandler(resolve));
    });
  }

  public login(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fbService.FB.login(this.getAuthResponseHandler(resolve), {
        scope: 'manage_pages,pages_show_list',
      });
    });
  }

  public logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fbService.FB.logout(this.getAuthResponseHandler(resolve));
    });
  }

  public fbApi(endpoint: string, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fbService.FB.api(endpoint, response => {
        resolve(response);
      }, options);
    });
  }

  private updateUserDetails(): Promise<void> {
    if (!this.isConnected) {
      this.id = undefined;
      this.name = undefined;
    }

    return new Promise((resolve, reject) => {
      this.fbService.FB.api('/me', response => {
        this.id = response.id;
        this.name = response.name;

        resolve();
      });
    });
  }

  private getAuthResponseHandler(resolve: () => void) {
    return async response => {
      this.authResponse = response;

      await this.updateUserDetails();

      resolve();
    }
  }
}
