import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  avatar?: string;
  data?: any; // For dashboard-specific actions
}

interface DashboardAction {
  type: 'filter' | 'navigate' | 'export' | 'refresh' | 'alert';
  payload: any;
}

@Component({
  selector: 'app-ai-chat-assistant',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-assistant.component.html',
  styleUrls: ['./ai-chat-assistant.component.css']
})
export class AiChatAssistantComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @Output() chatOpenChange = new EventEmitter<boolean>();
  @Output() dashboardAction = new EventEmitter<DashboardAction>();
  
  // Input for dashboard context (optional)
  @Input() dashboardContext?: {
    currentView?: string;
    selectedWell?: string;
    dateRange?: { start: Date; end: Date };
  };

  messages: ChatMessage[] = [];
  userInput: string = '';
  isTyping: boolean = false;
  isChatOpen: boolean = false;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  
  private hubConnection?: signalR.HubConnection;
  private webhookUrl = 'YOUR_WEBHOOK_URL'; // Configure this
  private signalRUrl = 'YOUR_SIGNALR_HUB_URL'; // Configure this
  private useSignalR = true; // Toggle between SignalR and HTTP webhooks

  // Quick action suggestions
  public quickActions = [
    { icon: 'e-filter', text: 'Show active wells', query: 'Show me all active wells' },
    { icon: 'e-warning', text: 'Critical alerts', query: 'What are the critical alerts?' },
    { icon: 'e-performance', text: 'Top performers', query: 'Which wells have the best efficiency?' },
    { icon: 'e-export', text: 'Export report', query: 'Export today\'s production report' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMessageHistory();
    
    if (this.useSignalR) {
      this.initializeSignalR();
    }

    // Add welcome message
    if (this.messages.length === 0) {
      this.addMessage({
        id: this.generateId(),
        text: 'Hello! I\'m your AI assistant for oil field operations. I can help you analyze data, generate reports, and answer questions about your wells. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        avatar: '🤖'
      });
    }
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  // SignalR Connection Setup
  private initializeSignalR(): void {
    this.connectionStatus = 'connecting';
    
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.signalRUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Listen for bot messages
    this.hubConnection.on('ReceiveMessage', (message: any) => {
      this.handleBotResponse(message);
    });

    // Listen for typing indicator
    this.hubConnection.on('BotTyping', (isTyping: boolean) => {
      this.isTyping = isTyping;
      if (!isTyping) {
        this.scrollToBottom();
      }
    });

    // Listen for dashboard actions from AI
    this.hubConnection.on('DashboardAction', (action: DashboardAction) => {
      this.dashboardAction.emit(action);
    });

    // Handle connection events
    this.hubConnection.onreconnecting(() => {
      this.connectionStatus = 'connecting';
    });

    this.hubConnection.onreconnected(() => {
      this.connectionStatus = 'connected';
    });

    this.hubConnection.onclose(() => {
      this.connectionStatus = 'disconnected';
    });

    // Start connection
    this.hubConnection.start()
      .then(() => {
        this.connectionStatus = 'connected';
        console.log('AI Assistant Connected');
      })
      .catch(err => {
        this.connectionStatus = 'disconnected';
        console.error('SignalR Connection Error:', err);
      });
  }

  // Send message via SignalR
  private sendViaSignalR(message: string): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SendMessage', {
        message: message,
        context: this.dashboardContext
      }).catch(err => console.error('Error sending message:', err));
    }
  }

  // Send message via HTTP Webhook
  private sendViaWebhook(message: string): void {
    this.isTyping = true;
    
    this.http.post(this.webhookUrl, {
      message: message,
      userId: this.getUserId(),
      context: this.dashboardContext,
      timestamp: new Date()
    }).subscribe({
      next: (response: any) => {
        this.handleBotResponse(response);
      },
      error: (err) => {
        console.error('Webhook error:', err);
        this.isTyping = false;
        this.addMessage({
          id: this.generateId(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date(),
          avatar: '🤖'
        });
      }
    });
  }

  // Handle bot response
  private handleBotResponse(response: any): void {
    this.isTyping = false;
    
    const botMessage: ChatMessage = {
      id: this.generateId(),
      text: response.message || response.text || response,
      sender: 'bot',
      timestamp: new Date(),
      avatar: '🤖',
      data: response.data
    };
    
    this.addMessage(botMessage);
    
    // Handle dashboard actions if present
    if (response.action) {
      this.dashboardAction.emit(response.action);
    }
    
    this.saveMessageHistory();
  }

  // Send user message
  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMessage: ChatMessage = {
      id: this.generateId(),
      text: this.userInput,
      sender: 'user',
      timestamp: new Date(),
      avatar: '👤'
    };

    this.addMessage(userMessage);
    
    if (this.useSignalR) {
      this.sendViaSignalR(this.userInput);
    } else {
      this.sendViaWebhook(this.userInput);
    }

    this.userInput = '';
    this.saveMessageHistory();
  }

  // Send quick action
  sendQuickAction(action: any): void {
    this.userInput = action.query;
    this.sendMessage();
  }

  // Add message to chat
  private addMessage(message: ChatMessage): void {
    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  // Utility methods
  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    this.chatOpenChange.emit(this.isChatOpen);
    if (this.isChatOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.messages = [];
      localStorage.removeItem('oilFieldChatHistory');
      
      // Re-add welcome message
      this.addMessage({
        id: this.generateId(),
        text: 'Chat cleared. How can I help you?',
        sender: 'bot',
        timestamp: new Date(),
        avatar: '🤖'
      });
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  private saveMessageHistory(): void {
    localStorage.setItem('oilFieldChatHistory', JSON.stringify(this.messages));
  }

  private loadMessageHistory(): void {
    const history = localStorage.getItem('oilFieldChatHistory');
    if (history) {
      this.messages = JSON.parse(history);
    }
  }

  private getUserId(): string {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}