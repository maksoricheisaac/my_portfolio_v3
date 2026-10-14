import { Module } from '@nestjs/common';
import {
  MessagesController,
  PublicContactController,
} from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  controllers: [MessagesController, PublicContactController],
  providers: [MessagesService],
})
export class MessagesModule {}
