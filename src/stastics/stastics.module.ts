import { Module } from '@nestjs/common';
import { StasticsService } from './stastics.service';
import { StasticsController } from './stastics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletHistory } from 'src/db/entity/wallet-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WalletHistory])],
  controllers: [StasticsController],
  providers: [StasticsService],
})
export class StasticsModule {}
