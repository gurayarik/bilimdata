import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="overflow-hidden rounded-md border border-slate-300">
      <div class="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
        <button
          type="button"
          class="rounded px-2 py-1 text-sm font-bold hover:bg-slate-200"
          (mousedown)="$event.preventDefault()"
          (click)="exec('bold')"
        >
          B
        </button>
        <button
          type="button"
          class="rounded px-2 py-1 text-sm italic hover:bg-slate-200"
          (mousedown)="$event.preventDefault()"
          (click)="exec('italic')"
        >
          I
        </button>
        <button
          type="button"
          class="rounded px-2 py-1 text-sm font-semibold hover:bg-slate-200"
          (mousedown)="$event.preventDefault()"
          (click)="exec('formatBlock', 'H2')"
        >
          H2
        </button>
        <button
          type="button"
          class="rounded px-2 py-1 text-sm hover:bg-slate-200"
          (mousedown)="$event.preventDefault()"
          (click)="exec('formatBlock', 'P')"
        >
          P
        </button>
        <button
          type="button"
          class="rounded px-2 py-1 text-sm hover:bg-slate-200"
          (mousedown)="$event.preventDefault()"
          (click)="exec('insertUnorderedList')"
        >
          • Liste
        </button>
        <button
          type="button"
          class="rounded px-2 py-1 text-sm hover:bg-slate-200"
          (mousedown)="$event.preventDefault()"
          (click)="addLink()"
        >
          🔗 Link
        </button>
      </div>
      <div
        #editor
        class="min-h-[280px] px-4 py-3 text-sm leading-relaxed text-slate-700 focus:outline-none [&_a]:text-accent-600 [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-brand-900 [&_ul]:list-disc [&_ul]:pl-5"
        contenteditable="true"
        (input)="onInput()"
        (blur)="onTouched()"
      ></div>
    </div>
  `,
})
export class RichTextEditorComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  private pendingValue = '';
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  ngAfterViewInit() {
    this.editorRef.nativeElement.innerHTML = this.pendingValue;
  }

  writeValue(value: string | null): void {
    this.pendingValue = value || '';
    if (this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.pendingValue;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    this.onInput();
  }

  addLink() {
    const url = prompt('Bağlantı adresi (URL):');
    if (url) this.exec('createLink', url);
  }

  onInput() {
    this.onChange(this.editorRef.nativeElement.innerHTML);
  }
}
