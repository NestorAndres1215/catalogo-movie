import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/service/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  private readonly passwordsMatchValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordsMismatch: true };
  };

  readonly form = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordsMatchValidator,
    },
  );

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }


    try {
      const { name, email, password } = this.form.getRawValue();

      const result = await this.authService.register(name, email, password);

      if (!result.success) {
        this.errorMessage.set(result.message);
        return;
      }

      this.successMessage.set('¡Tu cuenta ha sido creada correctamente!');

      const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');

      const destination =
        returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/';

      await this.router.navigateByUrl(destination);
    } catch {
      this.errorMessage.set('Ocurrió un problema al crear tu cuenta. Inténtalo nuevamente.');
    } 
  }
}
