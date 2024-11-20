import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  responseMessage: string = '';
  showPassword: boolean = false;

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        (control: AbstractControl) => this.customEmailValidator(control) 
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  customEmailValidator(control: AbstractControl): ValidationErrors | null {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|[a-zA-Z]{2,})$/;
    const isValid = emailPattern.test(control.value);
    return isValid ? null : { invalidEmail: true };
  }

  onSubmit() {
    this.loginForm.markAllAsTouched(); 
    if (this.loginForm.valid) {
      this.auth.loginUser(this.loginForm.value).subscribe({
        next: (response) => {
          debugger
          this.responseMessage = 'Login successful';
          localStorage.setItem('authToken', 'true');
          this.router.navigate(['/home-page']); 
        },
        error: (error) => {
          if (error.status === 401) {
            if (this.loginForm.get('email')?.value) {
              this.responseMessage = 'Incorrect password. Please try again.';
              setTimeout(() => {
                this.responseMessage = '';
              }, 2000);
            } else {
              this.responseMessage = 'This email is not registered. Please sign up.';
            }
          } else {
            this.responseMessage = 'Login failed. Please try again.';
          }
        }
      });
    } else {
      this.responseMessage = 'Form is invalid. Please check your inputs.';
    }
  }
  
  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
