import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
declare var bootstrap: any;

interface Users {
  userId: number;
  fullName: string;
  email: string;
  contact: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  isModalOpen: boolean = false;
  editForm!: FormGroup;
  addForm!: FormGroup;
  users: Users[] = [];
  userIdToDelete: number | null = null;
  currentUserId: number | null = null;
  signupSuccess: boolean = false;
  emailExistsError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern('^[A-Za-z]+$')
        ]
      ],
      lastName: [
        '',
        [
          Validators.maxLength(20),
          Validators.pattern('^[A-Za-z]+$')
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          (control: AbstractControl) => this.customEmailValidator(control)
        ]
      ],
      contact: [
        '',
        [
          Validators.required,
          Validators.pattern('^[1-9][0-9]{9}$')
        ]
      ]
    });
    this.addForm = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(20),
        Validators.pattern('^[A-Za-z]{2,}(\\s[A-Za-z]{2,})*$')  
      ]],
      
      lastName: ['', [
        Validators.maxLength(20), 
        Validators.pattern('^[A-Za-z]+$')  
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|[a-zA-Z]{2,})$/)
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
    });
    this.fetchUsers();
  }

  openAddModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  addUser() {
    this.addForm.markAllAsTouched();
    if (this.addForm.valid) {
      const userData = this.addForm.value;
  
      this.authService.registerUser(userData).subscribe({
        next: (response) => {
          this.signupSuccess = true;
          this.emailExistsError = '';
          alert('User registered successfully!');
          this.addForm.reset();
          this.modalService.dismissAll();
          this.fetchUsers();
        },
        error: (error) => {
          this.signupSuccess = false
          if (error.status === 409) {
            this.emailExistsError = 'Email already exists';
          } else {
            this.emailExistsError = 'Email already exists';
          }
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }
  
  




  get firstName() {
    return this.addForm.get('firstName');
  }

  get lastName() {
    return this.
    addForm.get('lastName');
  }

  get email() {
    return this.addForm.get('email');
  }

  get password() {
    return this.addForm.get('password');
  }

  get contact() {
    return this.addForm.get('contact');
  }


  fetchUsers(): void {
    this.authService.getUsers().subscribe({
      next: (response) => {
        this.users = response;
        console.log('Users:', this.users);
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  openEditModal(modal: any, user: any): void {
    this.currentUserId = user.userId; 
    this.editForm.setValue({
      firstName: user.fullName.split(' ')[0],
      lastName: user.fullName.split(' ')[1],
      email: user.email,
      contact: user.contact
    });

    // Open the modal
    this.modalService.open(modal, { centered: true });
  }

  applyChanges(): void {
    if (this.editForm.valid) {
      if (!this.currentUserId) {
        alert('User ID not found.');
        return;
      }
  
      // Prepare updated details, ensuring lastName is an empty string if blank
      const updatedDetails = {
        ...this.editForm.value,
        lastName: this.editForm.value.lastName?.trim() || '', // Set to empty string if blank
        userId: this.currentUserId
      };
  
      // Call the service to update details
      this.authService.updateDetails(this.currentUserId, updatedDetails).subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          alert('Details updated successfully!');
          this.modalService.dismissAll();
          this.fetchUsers();
        },
        error: (error) => {
          console.error('Error updating details:', error);
          alert('Failed to update details. Please try again.');
        }
      });
    } else {
      alert('Please provide valid input.');
    }
  }
  restrictSpecialCharacters2(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
  }

  customEmailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|[a-zA-Z]{2,})$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
    localStorage.clear();
  }

  openDeleteModal(userId: number, content: any): void {
    this.userIdToDelete = userId;
    this.modalService.open(content);
  }

  confirmDelete(): void {
    if (this.userIdToDelete !== null) {
      this.authService.deleteUserById(this.userIdToDelete).subscribe({
        next: () => {
          alert('User deleted successfully');
          this.fetchUsers();
          this.modalService.dismissAll();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }
}
