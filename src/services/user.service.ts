import { UserRepository } from '@/repositories';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { authenticator } from 'otplib';
import { ConfigService } from '@nestjs/config';
import { ERROR_MESSAGES } from '../constants/errors';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async create() {
    const authenticatorSecret = authenticator.generateSecret();
    const service = this.configService.get<string>('app.name');
    const accountName = 'Telegram';
    const user = await this.userRepository.save({
      authenticator_secret: authenticatorSecret,
    });

    const otpauth = authenticator.keyuri(
      accountName,
      service,
      authenticatorSecret,
    );
    return { ...user, otpauth };
  }

  async verifyAuthenticator(userId: string, token: string) {
    const user = await this.userRepository.findOne({
      select: ['authenticator_secret', 'verified_authenticator', 'id'],
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (user.verified_authenticator) {
      throw new BadRequestException(ERROR_MESSAGES.VERIFIED_AUTHENTICATOR_USER);
    }

    try {
      const isValid = authenticator.check(token, user.authenticator_secret);
      if (!isValid) {
        throw new BadRequestException(
          ERROR_MESSAGES.VERIFY_AUTHENTICATOR_FAILED,
        );
      }
      await this.userRepository.save({ ...user, verified_authenticator: true });
      return true;
    } catch (err) {
      console.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException();
    }
  }

  // async removeVerifiedAuthenticator(userId: string) {
  //   const user = await this.userRepository.findOne({
  //     select: ['verified_authenticator', 'id'],
  //     where: { id: userId },
  //   });
  //
  //   if (!user) {
  //     throw new NotFoundException();
  //   }
  //
  //   if (!user.verified_authenticator) {
  //     throw new BadRequestException(
  //       ERROR_MESSAGES.NOT_VERIFIED_AUTHENTICATOR_USER,
  //     );
  //   }
  //
  //   try {
  //     const authenticatorSecret = authenticator.generateSecret();
  //     await this.userRepository.save({
  //       ...user,
  //       verified_authenticator: false,
  //       authenticator_secret: authenticatorSecret,
  //     });
  //     return true;
  //   } catch (err) {
  //     console.error(err);
  //     if (err instanceof BadRequestException) {
  //       throw err;
  //     }
  //     throw new InternalServerErrorException();
  //   }
  // }
}
