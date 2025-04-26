import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatMessagePipe } from '../format-message.pipe';
import { HttpClient } from '@angular/common/http';
import { ChartComponent } from './components/chart/chart.component';
import { catchError } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';


interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  thinking?: boolean;
  time: string;
  animationClass?: string;
  graph?: any,
  graphView?: boolean,
  data?: any
}

interface ChatHistory {
  id: number;
  title: string;
  date: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatMessagePipe, ChartComponent, DrawerModule],
  providers: [HttpClient],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatData') private chatDataContainer!: ElementRef;
  theme: 'light' | 'dark' = 'light';
  extraInfo: any = {
    show: false
  }
  messages: Message[] = [
    { 
      id: 1, 
      text: "Hello! I'm your AI assistant. How can I help you today?", 
      sender: "ai", 
      thinking: false, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    },
  ];
  newMessage = '';
  isProcessing = false;
  isThinking = false;
  sidebarOpen = false;
  showSuggestions = true;
  currentConversation = "Current Conversation";
  newChatTransition = false;

  suggestions: string[] = ["How many Sku Categories are there can you plot of each how many are there as well", "How many Sku Categories are there can you plot a pie chart of each how many are there as well", "Explain quantum computing in simple terms", "Give me ideas for a presentation on climate change"];

  chatHistory: ChatHistory[] = [
    { id: 1, title: "Current Conversation", date: "Today" },
    { id: 2, title: "Conversation 4", date: "Yesterday" },
    { id: 3, title: "Conversation 3", date: "Apr 23" },
    { id: 4, title: "Conversation 2", date: "Apr 21" },
    { id: 5, title: "Conversation 1", date: "Apr 19" }
  ];

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    private http: HttpClient,
  ) { 

  }

  ngOnInit(): void {
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  handleSendMessage(): void {
    if (this.newMessage.trim() === '') return;
    const userMessage: Message = {
      id: this.messages.length + 1,
      text: this.newMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      animationClass: 'message-fade-in'
    };
    
    this.messages = [...this.messages, userMessage];
    this.showSuggestions = false;
    this.scrollDataDown();
    this.newMessage = '';
    this.isProcessing = true;
    
    // After a brief delay, show thinking indicator
    setTimeout(() => {
      this.isThinking = true;
      this.scrollDataDown();
      // After another delay, show the response
      setTimeout(() => {
         this.http.post('http://172.16.2.90:8000/query', { question: userMessage.text }).pipe(catchError(this.handleError))
          .subscribe((response: any) => {
            console.log('Response from server:', response);
            this.isThinking = false;
            this.isProcessing = false;
            const aiMessage: Message = {
              id: this.messages.length + 2,
              text: response?.response?.answer || '',
              sender: 'ai',
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              animationClass: 'message-slide-in',
              data: response?.response || {},
            };
            let graphData: any = {};
            if (response?.response?.formatted_results?.type === 'bar' || response?.response?.formatted_results?.type === 'pie') {
              const color = this.dynamicColors();
              graphData = {
                id: this.messages.length + 3,
                sender: 'ai',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                animationClass: 'message-slide-in',
                graph: {
                  data: [{...response?.response?.formatted_results, color}],
                  label: response?.response?.formatted_results?.label,
                  },
                graphView: true,
                data: response?.response || {},           
              }
            }
            this.messages = [...this.messages, aiMessage];
            Object.keys(graphData)?.length > 0 && this.messages.push(graphData);
            this.scrollDataDown();
            this.showSuggestions = false;
          }, error => {
            const errorMessage: Message = {
              id: this.messages.length + 2,
              text: 'Sorry, I encountered an error while processing your request.',
              sender: 'ai',
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              animationClass: 'message-slide-in',
            };
            this.messages = [...this.messages, errorMessage];
            this.scrollDataDown();
            this.isProcessing = false;
            this.isThinking = false;
            console.log('Error sending message', error);
          });
      }, 200);
    }, 500);
   
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSendMessage();
    }
  }

  handleSuggestionClick(suggestion: string): void {
    this.newMessage = suggestion;
    this.showSuggestions = false;
    this.handleSendMessage();
  }
  
  startNewChat(): void {
    this.newChatTransition = true;
    this.isThinking = false;
    this.isProcessing = false;
    this.newMessage = '';
    this.messages = [];
    setTimeout(() => {
      this.messages = [
        { 
          id: 1, 
          text: "Hello! I'm your AI assistant. How can I help you today?", 
          sender: "ai", 
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }
      ];
      this.showSuggestions = true;
      this.currentConversation = "New Conversation";
      this.newChatTransition = false;
    }, 300);
  }

  selectChat(chatTitle: string): void {
    this.currentConversation = chatTitle;
    this.sidebarOpen = false;
  }
  
  formatMessage(text: string): string {
    // Process markdown-like formatting
    // In Angular, we'll handle this with a pipe
    return text;
  }
  dynamicColors() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  }
  scrollDataDown(){
    setTimeout(() => {
      const element = this.chatDataContainer?.nativeElement;
      if (element && element.lastElementChild) {
        element.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 200)
  }
  handleError(error: any) {
    return error;
  }
  showExtras(message: Message) {
    console.log(message);
    this.extraInfo = {
      show: true,
      data: message?.data || {}
    }
  }
}