import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatMessage',
  standalone: true
})
export class FormatMessagePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string): SafeHtml {
    if (!text) return '';
    
    let formatted = '';
    
    // Process the text line by line
    const lines = text.split('\n');
    
    lines.forEach((line, index) => {
      // Bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Bullet points
      if (line.startsWith('• ')) {
        formatted += `<li class="ml-5">${line.substring(2)}</li>`;
      }
      // Numbered lists
      else if (line.match(/^\d+\.\s/)) {
        formatted += `<li class="ml-5">${line.substring(line.indexOf(' ') + 1)}</li>`;
      }
      // Regular paragraph
      else {
        formatted += line ? `<p class="mb-0">${line}</p>` : '<br>';
      }
    });
    
    // Return sanitized HTML
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
}