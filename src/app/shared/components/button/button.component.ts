import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'gev-button',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="'btn ' + variant"
      [class.btn-large]="size === 'large'"
      [class.btn-small]="size === 'small'"
      (click)="onClick($event)"
    >
      <span class="btn-content" [class.hidden]="loading">
        <ng-content></ng-content>
      </span>
      
      @if (loading) {
        <span class="loader-container">
          <svg class="spinner" viewBox="0 0 24 24">
            <circle class="path" cx="12" cy="12" r="10" fill="none" stroke-width="3"></circle>
          </svg>
          <span class="loading-text">{{ loadingText }}</span>
        </span>
      }
    </button>
  `,
    styles: [`
    :host {
      display: inline-block;
    }

    .btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.7rem 1.4rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      min-width: 120px;
      height: 44px;
      font-family: inherit;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-large {
      padding: 1rem 2rem;
      height: 54px;
      font-size: 1.1rem;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      height: 36px;
      font-size: 0.85rem;
      min-width: 80px;
    }

    .primary {
      background: #3B82F6;
      color: white;
    }

    .primary:hover:not(:disabled) {
      background: #2563EB;
    }

    .secondary {
      background: white;
      color: #3B82F6;
      border-color: #3B82F6;
    }

    .secondary:hover:not(:disabled) {
      background: #EFF6FF;
    }

    .auth__primary {
      background: #3B82F6;
      color: white;
      width: 100%;
    }

    .auth__primary:hover:not(:disabled) {
      background: #2563EB;
    }

    .auth__secondary {
      background: white;
      color: #4B5563;
      border-color: #D1D5DB;
    }

    .auth__secondary:hover:not(:disabled) {
      background: #F9FAFB;
      border-color: #9CA3AF;
    }

    .cancel-txt {
      background: white;
      border: 1px solid #D1D5DB;
      color: #4B5563;
    }

    .cancel-txt:hover:not(:disabled) {
      background: #F9FAFB;
    }

    .btn-content.hidden {
      visibility: hidden;
      opacity: 0;
    }

    .loader-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .spinner {
      animation: rotate 2s linear infinite;
      width: 18px;
      height: 18px;
    }

    .spinner .path {
      stroke: currentColor;
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }

    .loading-text {
      font-size: 0.85rem;
    }

    @keyframes rotate {
      100% { transform: rotate(360deg); }
    }

    @keyframes dash {
      0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
      }
      100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
    @Input() type: 'button' | 'submit' = 'button';
    @Input() loading = false;
    @Input() disabled = false;
    @Input() variant: string = 'primary';
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
    @Input() loadingText: string = 'Chargement...';

    @Output() btnClick = new EventEmitter<MouseEvent>();

    onClick(event: MouseEvent) {
        if (!this.loading && !this.disabled) {
            this.btnClick.emit(event);
        }
    }
}
