import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

const jwtSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && (!jwtSecret || jwtSecret.includes('replace_with_'))) {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET must be configured with a high-entropy secret in production!');
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret || 'temporary_dev_secret_replace_in_production_min_64_chars',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '15m' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
