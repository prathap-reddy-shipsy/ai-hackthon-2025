import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatMessagePipe } from '../format-message.pipe';
import { HttpClient } from '@angular/common/http';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  thinking?: boolean;
  time: string;
  animationClass?: string;
}

interface ChatHistory {
  id: number;
  title: string;
  date: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatMessagePipe],
  providers: [HttpClient],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked {
  theme: 'light' | 'dark' = 'light';
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

  suggestions: string[] = [
    "How many Sku Categories are there can you plot of each how many are there as well",
    "Write a short story about space exploration",
    "Explain quantum computing in simple terms",
    "Give me ideas for a presentation on climate change"
  ];

  chatHistory: ChatHistory[] = [
    { id: 1, title: "Current Conversation", date: "Today" },
    { id: 2, title: "AI Ethics Discussion", date: "Yesterday" },
    { id: 3, title: "Creative Writing Help", date: "Apr 23" },
    { id: 4, title: "Programming Assistance", date: "Apr 21" },
    { id: 5, title: "Travel Planning Ideas", date: "Apr 19" }
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
    this.http.post('http://172.16.2.90:8000/query', { question: this.newMessage })
      .subscribe(response => {
        // Add user message with animation class
        const userMessage: Message = {
          id: this.messages.length + 1,
          text: this.newMessage,
          sender: 'user',
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          animationClass: 'message-fade-in'
        };
        
        this.messages = [...this.messages, userMessage];
        const messageSent = this.newMessage;
        this.newMessage = '';
        this.isProcessing = true;
        
        // After a brief delay, show thinking indicator
        setTimeout(() => {
          this.isThinking = true;
          
          // After another delay, show the response
          setTimeout(() => {
            this.isThinking = false;
            this.isProcessing = false;
            
            // Generate response based on input
            let aiResponse: string;
            if (messageSent.toLowerCase().includes('ai') || messageSent.toLowerCase().includes('artificial intelligence')) {
              aiResponse = "Artificial Intelligence (AI) refers to computer systems designed to perform tasks that typically require human intelligence. These include learning, reasoning, problem-solving, perception, and language understanding.\n\nThere are different types of AI:\n\n• Narrow AI: Designed for specific tasks (like virtual assistants)\n• General AI: Systems with human-level cognitive abilities\n• Superintelligent AI: Systems that surpass human intelligence\n\nModern AI is primarily based on machine learning techniques, especially deep learning with neural networks. Would you like me to elaborate on any specific aspect of AI?";
            } else if (messageSent.toLowerCase().includes('story')) {
              aiResponse = "**THE BEACON**\n\nCaptain Elena Shiro stood at the viewport of the Arcturus, gazing at the swirling nebula before her. After fifteen years in deep space, they had finally found it—the source of the signal.\n\n\"How much longer?\" she asked her science officer.\n\n\"Proximity alert in three minutes,\" Zhang replied, eyes fixed on his console. \"Whatever's transmitting that pattern, we're about to meet it.\"\n\nThe ship hummed as it pushed through the cosmic dust. The signal had been discovered accidentally—a perfect mathematical sequence hidden in background radiation, repeating for what appeared to be millions of years.\n\nThe nebula parted, revealing a small, crystalline structure floating in space. No larger than a shuttle, it pulsed with internal light.\n\n\"It's artificial,\" Elena whispered.\n\nAs the Arcturus approached, the object suddenly projected a field of light that enveloped their ship. Data flooded their systems—star charts, physics equations, and coordinates to thousands of habitable worlds.\n\nIt wasn't a message. It was a beacon. And humanity had just joined a conversation spanning galaxies.";
            } else if (messageSent.toLowerCase().includes('quantum')) {
              aiResponse = "Quantum computing explained simply:\n\nClassical computers (like your phone or laptop) use bits—which are either 0 or 1, like tiny on/off switches.\n\nQuantum computers use quantum bits or \"qubits.\" Thanks to a property called \"superposition,\" qubits can exist as both 0 and 1 simultaneously until measured.\n\nImagine trying to find an exit in a giant maze:\n- A classical computer would try one path at a time\n- A quantum computer explores multiple paths simultaneously\n\nThis allows quantum computers to solve certain problems exponentially faster than classical computers, particularly in areas like encryption, drug discovery, and complex simulations.\n\nWhile powerful, quantum computers aren't simply \"faster\" regular computers—they excel at specific types of problems where this parallel exploration provides an advantage.";
            } else if (messageSent.toLowerCase().includes('climate')) {
              aiResponse = "Here are some compelling angles for a presentation on climate change:\n\n1. **Economic Opportunities**: Focus on how climate solutions create jobs and new industries\n\n2. **Technological Innovation**: Showcase breakthrough technologies addressing climate challenges\n\n3. **Local Impacts**: Connect global climate trends to local effects your audience experiences\n\n4. **Nature-Based Solutions**: Highlight how restoring ecosystems can sequester carbon and build resilience\n\n5. **Climate Justice**: Explore how climate change disproportionately affects vulnerable communities\n\n6. **Success Stories**: Share examples of cities, countries, or businesses that have successfully reduced emissions\n\n7. **Personal Agency**: Conclude with actionable steps individuals can take\n\nVisual elements could include before/after imagery, data visualizations of temperature trends, and projections of different emissions scenarios.";
            } else {
              aiResponse = "Thanks for your message! I'll do my best to help with your question.\n\nBased on what you're asking about, I could provide information, explanations, creative content, or analysis depending on your needs. Would you like me to:\n\n1. Explain a concept in depth?\n2. Generate creative content?\n3. Help solve a problem?\n4. Provide information on a specific topic?\n\nPlease feel free to ask follow-up questions or provide more details so I can better assist you.";
            }
            
            const aiMessage: Message = {
              id: this.messages.length + 2,
              text: aiResponse,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              animationClass: 'message-slide-in'
            };
            
            this.messages = [...this.messages, aiMessage];
            this.showSuggestions = false;
          }, 200);
        }, 500);
      }, error => {
        console.error('Error sending message', error);
      });
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
  }
  
  startNewChat(): void {
    this.newChatTransition = true;
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
}