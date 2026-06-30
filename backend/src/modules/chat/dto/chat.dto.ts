import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsMongoId()
  participantId: string;
}

export class SendMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
