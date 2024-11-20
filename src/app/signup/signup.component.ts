import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { last } from 'rxjs';
import { AuthService } from '../auth.service';
declare var bootstrap: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  passwordsMatch = false;
  signupSuccess: boolean = false;
  emailExistsError: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private fact : AuthService) {
    
    this.signupForm = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(20),
        Validators.pattern('^[A-Za-z]+$')  
      ]],
      lastName: ['', [
        Validators.maxLength(20), 
        Validators.pattern('^[A-Za-z]+$')  
      ]],
      email: ['', [
        Validators.required,
        (control: AbstractControl) => this.customEmailValidator(control) 
      ]],
      contact : ['', [
        Validators.required,
        Validators.pattern('^[1-9][0-9]{9}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]],
      gender: ['', [Validators.required]],
      confirmPassword: [
        '',
        Validators.required
      ]
    }, { validators: this.passwordMatchValidator });
  }

 
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

      if (password?.value !== confirmPassword?.value) {
        confirmPassword?.setErrors({ passwordMismatch: true });
      } else {
        confirmPassword?.setErrors(null);
      } 
      
  }


  customEmailValidator(control: AbstractControl): ValidationErrors | null {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|[a-zA-Z]{2,})$/;
    const isValid = emailPattern.test(control.value);
    return isValid ? null : { invalidEmail: true };
  }


  get firstName() {
    return this.signupForm.get('firstName');
  }

  get lastName() {
    return this.signupForm.get('lastName');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get contact() {
    return this.signupForm.get('contact');
  }
  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }
  onSubmit() {
    this.signupForm.markAllAsTouched();
    if (this.signupForm.valid) {
      const userData = this.signupForm.value;
  
      this.fact.registerUser(this.signupForm.value).subscribe({
        next: (response) => {
          this.signupSuccess = true;
          this.emailExistsError = '';
          const modal = new bootstrap.Modal(document.getElementById('successModal') as HTMLElement);
          modal.show(); 
          console.log('User registered successfully:', response);
        },
        error: (error) => {
          this.signupSuccess = false;
          if (error.message === 'Email already exists') {
            this.emailExistsError = 'Email already exists';
          } else {
            this.emailExistsError = 'An error occurred during registration';
          }
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }

  showModal(): void {
    const modalElement = document.getElementById('successModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.navigateToLogin();
      }, { once: true });
    }
  }
  restrictSpecialCharacters2(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }
  

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  restrictSpecialCharacters(event: KeyboardEvent): void {
    const regex = /^[A-Za-z\s]*$/;
    const inputChar = String.fromCharCode(event.keyCode);
    if (
      ['Backspace', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
    ) {
      return;
    }
    if (!regex.test(inputChar)) {
      event.preventDefault();
    }
  }
  
}
