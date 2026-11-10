import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/service/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly errorMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const { email, password } = this.form.getRawValue();

      const result = await this.authService.login(email, password);

      if (!result.success) {
        this.errorMessage.set(result.message);
        return;
      }

      const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');

      const destination =
        returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/';

      await this.router.navigateByUrl(destination);
    } catch {
      this.errorMessage.set('Ocurrió un problema al iniciar sesión. Inténtalo nuevamente.');
    }
  }
}
