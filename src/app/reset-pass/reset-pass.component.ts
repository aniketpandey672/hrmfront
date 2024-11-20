import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  passwordMismatch: boolean = false;
  constructor(private fb: FormBuilder, private router: Router) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [
        Validators.required, 
        this.customEmailValidator  
      ]],
      newPassword: [
        '', 
        [
          Validators.required, 
          Validators.minLength(8),
          Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
        ]
      ],
      confirmPassword: ['', [Validators.required]]
    });
  }
  customEmailValidator(control: AbstractControl): ValidationErrors | null {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|[a-zA-Z]{2,})$/;
    const isValid = emailPattern.test(control.value);
    return isValid ? null : { invalidEmail: true };
  }
  onSubmit(): void {
    const { newPassword, confirmPassword } = this.resetPasswordForm.value;
  
    if (newPassword !== confirmPassword) {
      this.passwordMismatch = true;
      setTimeout(() => {
        this.passwordMismatch = false;
      }, 2000);
      return;
    } else {
      this.passwordMismatch = false;
    }

    if (this.resetPasswordForm.valid) {
      console.log('Form Submitted', this.resetPasswordForm.value);
      this.showModal();
    }
  }
  showModal(): void {
    const modalElement = document.getElementById('successModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
  onNavigateToLogin(): void {
    const modalElement = document.getElementById('successModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
    this.router.navigate(['/login']);
  }
}
