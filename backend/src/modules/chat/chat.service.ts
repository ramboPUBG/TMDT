import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async findOrCreateConversation(userId: string, participantId: string) {
    let conversation = await this.conversationModel.findOne({
      participants: { 
        $all: [new Types.ObjectId(userId), new Types.ObjectId(participantId)] 
      }
    }).populate('participants', 'fullName avatar');

    if (!conversation) {
      conversation = await this.conversationModel.create({
        participants: [new Types.ObjectId(userId), new Types.ObjectId(participantId)],
      });
      conversation = await conversation.populate('participants', 'fullName avatar');
    }

    return conversation;
  }

  async getConversationById(conversationId: string) {
    return this.conversationModel.findById(conversationId).exec();
  }

  async getUserConversations(userId: string) {
    return this.conversationModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate('participants', 'fullName avatar')
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async getMessages(conversationId: string, limit = 50, skip = 0) {
    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    const message = await this.messageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(senderId),
      content,
    });

    await this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: content,
        lastMessageAt: new Date(),
      }
    );

    return message;
  }
}
