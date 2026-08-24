import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseService } from './core/services/supabase.service';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.supabase.authEvent$.subscribe((event) => {
      if (event === 'SIGNED_IN' && /^\/(auth\/(login|register))?$/.test(location.pathname)) {
        this.router.navigateByUrl('/dashboard');
      }
    });
  }
}
