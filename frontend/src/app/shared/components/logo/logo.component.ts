import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <span class="flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#F59E0B" />
        <rect x="7" y="18" width="4" height="8" rx="1.5" fill="#0B1D3A" />
        <rect x="14" y="13" width="4" height="13" rx="1.5" fill="#0B1D3A" />
        <rect x="21" y="7" width="4" height="19" rx="1.5" fill="#0B1D3A" />
        <circle cx="23" cy="6" r="2.5" fill="#0B1D3A" />
      </svg>
      <span class="text-lg font-bold leading-none tracking-tight">
        <span class="text-white">Bilim</span><span class="text-accent-500">Data</span>
      </span>
    </span>
  `,
})
export class LogoComponent {}
