import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {GlobalService} from "../core/services/global.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private _router: Router,
              public gs: GlobalService) {
    // this.menuCtrl.enable(false, 'myMenu');
  }

  ngOnInit() { }
/*
  doLogin(event, form) {
    if (event.code === 'Enter') {
      this.login(form);
    }
  }*/

  login(form) {
    const _values = form.value;
    this.gs.login(_values.username, _values.password).subscribe( data => {
      if (data.hasOwnProperty('error')) {
        this.gs.toast.present(data.error);
        return;
      }
      this.gs.logged = true;
      this.gs.user = data.user[0];
      localStorage.setItem('token', data.token.token);
      localStorage.setItem('user', JSON.stringify(data.user[0]));
      this.gs.init();
      this._router.navigate(['/home']);
    }, error => this.gs.toast.present(error.message) );
  }

}
