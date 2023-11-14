import { Module } from '@nestjs/common'
import { PaysService } from './pays.service'
import { PaysController } from './pays.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletHistory } from 'src/db/entity/wallet-history.entity'

@Module({
  imports: [TypeOrmModule.forFeature([WalletHistory])],
  controllers: [PaysController],
  providers: [PaysService],
})
export class PaysModule {}
