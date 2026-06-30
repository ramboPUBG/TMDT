import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'secret';
      const payload = this.jwtService.verify(token, { secret });
      const userId = payload.sub;

      client.data.userId = userId;
      this.userSockets.set(userId, client.id);
      client.join(userId); // Join personal room for direct messages
      console.log(`User connected to chat: ${userId}`);
    } catch (error) {
      console.log('Socket authentication failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSockets.delete(client.data.userId);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    try {
      const message = await this.chatService.saveMessage(
        dto.conversationId,
        senderId,
        dto.content,
      );

      // Find the conversation to get the other participant
      const conversation = await this.chatService.getConversationById(dto.conversationId);
      if (!conversation) return;

      const participants = conversation.participants.map(p => p.toString());
      
      // Broadcast to all participants' personal rooms
      for (const participantId of participants) {
        this.server.to(participantId).emit('newMessage', message);
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  }
}
