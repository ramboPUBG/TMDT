import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createOrGetConversation(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateConversationDto,
  ) {
    const conversation = await this.chatService.findOrCreateConversation(
      userId,
      dto.participantId,
    );
    return { success: true, data: conversation };
  }

  @Get('conversations')
  async getConversations(@CurrentUser('_id') userId: string) {
    const conversations = await this.chatService.getUserConversations(userId);
    return { success: true, data: conversations };
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const messages = await this.chatService.getMessages(conversationId, limit, skip);
    return { success: true, data: messages };
  }
}
